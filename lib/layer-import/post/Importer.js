var mongoose = require('mongoose'),
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    ndjson = require('ndjson'),
    PropertyFormatter = require('../../property-formatter'),
    AppContainer = require('app-container');

const PostProcessor = require('./PostProcessor');

class Importer extends PostProcessor {
    start() {
        var self = this,
            disconnectOnComplete = !mongoose.connection.readyState;
        function complete(err) {
            if(err) {
                console.error(err);
            }
            self.emit('complete',{
                preResults: self.preResults(),
                userInput: self.userInput()
            });
        }
        function finishImport(err,fileId) {
            if(err) {
                return self.emit('error',err);
            }
            function finished() {
                if(disconnectOnComplete) {
                    mongoose.connection.close(complete);
                } else {
                    complete();
                }
            }
            var Layer = require('../../../models/Layer'),
                Feature = require('../../../models/Feature'),
                userInput = self.userInput(),
                idFormat = new PropertyFormatter(userInput.featureIdFmt),
                nameFormat = new PropertyFormatter(userInput.featureNameFmt),
                preResults = self.preResults(),
                input = fs.createReadStream(preResults.ndJson);
            input.on('error',function(err) {
                self.emit('error',err);
            });
            (new Layer({
                name: userInput.layerName,
                source: userInput.layerSource,
                featureIdFmt: userInput.featureIdFmt,
                featureNameFmt: userInput.featureNameFmt,
                _createdBy: mongoose.Types.ObjectId(userInput.userId),
                _modifiedBy: mongoose.Types.ObjectId(userInput.userId),
                _sourceFile: fileId
            })).save(function(err,layer){
                if(err) {
                    return self.emit('error',err);
                }
                var eof = false;
                input.pipe(ndjson.parse({strict: true}))
                     .on('end',function() {
                         eof = true;
                     })
                     .on('data',function(feature){
                         // going to process things serially, for now
                         input.pause();
                         var featureId = idFormat.format(feature.properties),
                             featureName = nameFormat.format(feature.properties);
                         (new Feature({
                             _layer: layer._id,
                             data: feature,
                             featureId: featureId,
                             featureName: featureName
                         })).save(function(err,f) {
                            if(err) {
                                self.emit('info','FAILED: to create feature ['+featureId+'] "'+featureName+'"');
                                // the contents of the error simply get too large since they contain
                                // a stringified version of a feature, so trim down the resulting JSON to be
                                // more reasonable.
                                self.emit('info',JSON.stringify(err,function replacer(key,o){
                                    var t = typeof(o);
                                    if(key === 'data' && t === 'object') {
                                        return undefined;
                                    }
                                    if(t === 'string' && o.length > 100) {
                                        return o.substring(0,50)+' ... '+o.substring(o.length-50);
                                    }
                                    return o;
                                }));
                            } else {
                                self.emit('info','Created feature ['+f.featureId+'] "'+f.featureName+'"');
                            }
                            if(eof) {
                                finished();
                            } else {
                                input.resume();
                            }
                         });
                     });
            });
        }
        function startImport(err) {
            if(err) {
                return self.emit('error',err);
            }
            var File = require('odata-resource-file').File;
            var userInput = self.userInput(),
                preResults = self.preResults();
            if(!preResults._sourceFile && /\.zip$/i.test(preResults.inputFile)) {
                // if it's a zip file store it in the db and register
                // it as the source of the layer
try {
                File.storeFile(null,{
                    cleanup: false,
                    path: preResults.inputFile,
                    originalname: path.basename(preResults.inputFile),
                    mimetype: 'application/zip',
                    metadata: {
                        _user: userInput.userId,
                        type: 'layerSource'
                    }
                },function(err,file){
                    if(err) {
                        return self.emit('error',err);
                    }
                    finishImport(null,file._id.toString());
                });
} catch (err) {
    console.error(err);
}
            } else {
                finishImport(null,preResults._sourceFile);
            }
        }
        if(disconnectOnComplete) {
            AppContainer.db(startImport);
        } else {
            startImport();
        }
    }
}

module.exports = Importer;
