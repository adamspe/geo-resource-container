var mongoose = require('mongoose'),
    fs = require('fs'),
    q = require('q'),
    _ = require('lodash'),
    path = require('path'),
    ndjson = require('ndjson'),
    topojson = require('topojson'),
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
            function doFormat(fmt,props) {
                try {
                    return fmt.format(props);
                } catch(err) {
                    // TODO, how to inform the user of the situation??
                    console.error(err);
                    self.emit('info',err);
                    return '?';
                }
            }
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
                var savePromises = [];
                input.pipe(ndjson.parse({strict: true}))
                     .on('end',function() {
                         //console.log('eof read, waiting for all saves to complete.');
                         q.allSettled(savePromises).then(finished);
                     })
                     .on('data',function(feature){
                         var def = q.defer(),
                             featureId = doFormat(idFormat,feature.properties),
                             featureName = doFormat(nameFormat,feature.properties),
                             retry = true;
                        function dedup(feature) {
                            let polygons = feature.geometry.type === 'Polygon' ?
                                            [feature.geometry.coordinates] : (feature.geometry.type === 'MultiPolygon' ?
                                            feature.geometry.coordinates : undefined);
                            return (polygons||[]).reduce((deduped,poly,poly_index) => {
                                poly.forEach((ring,ring_index) => {
                                    let set = [],
                                        first = i => i === 0,
                                        last = i => i === ring.length-1;
                                    ring.forEach((coord,i) => {
                                        if(first(i) || last(i)) {
                                            if(last(i)) {
                                                // verify first and last are the same
                                            }
                                            set.push(coord);
                                        } else {
                                            let found_index;
                                            for(let j = 0; j < set.length; j++) {
                                                if(coord[0] === set[j][0] && coord[1] === set[j][1]) {
                                                    found_index = j;
                                                    break;
                                                }
                                            }
                                            if(typeof(found_index) === 'undefined') {
                                                set.push(coord);
                                            } else {
                                                console.log(`duplicate coordinates ${i}/${found_index} in ring ${ring_index} of polygon ${poly_index}`);
                                            }
                                        }
                                    });
                                    if(ring.length !== set.length) {
                                        deduped = true;
                                        // cannot chage the reference of the array, only its contents
                                        ring.splice((set.length-1),(ring.length-set.length));
                                        set.forEach((c,i) => { ring[i] = c; });
                                    }
                                });
                                return deduped;
                            },false);
                        }
                        savePromises.push(def.promise);
                        function tryAddFeature(featureData) {
                            (new Feature({
                                _layer: layer._id,
                                data: featureData,
                                featureId: featureId,
                                featureName: featureName
                            })).save(function(err,f) {
                               if(err) {
                                   self.emit('info','FAILED: to create feature ['+featureId+'] "'+featureName+'"');
                                   // the contents of the error simply get too large since they contain
                                   // a stringified version of a feature, so trim down the resulting JSON to be
                                   // more reasonable.
                                   self.emit('info','ERROR: '+JSON.stringify(err,function replacer(key,o){
                                       var t = typeof(o);
                                       if(key === 'data' && t === 'object') {
                                           return undefined;
                                       }
                                       if(t === 'string' && o.length > 100) {
                                           return o.substring(0,50)+' ... '+o.substring(o.length-50);
                                       }
                                       return o;
                                   }));
                                   // try to solve any common problems...
                                   // run over all polygons, a single retry is good enuf.
                                   if(retry) {
                                       retry = false;
                                       // most common error is duplicate vertices
                                       if(dedup(feature)) {
                                           // TODO, this still fails for "canada" but @turf/kinks & unkink-polygon
                                           // may be of use since that seems to be the case and the existence of duplicates
                                           // within that polygon were causing unkink to fail.
                                           self.emit('RETRY: creating feature ['+featureId+'] "'+featureName+'"');
                                           return tryAddFeature(feature);
                                       }/* else {
                                           let polygons = feature.geometry.type === 'Polygon' ?
                                                           [feature.geometry.coordinates] : (feature.geometry.type === 'MultiPolygon' ?
                                                           feature.geometry.coordinates : undefined);
                                           if(polygons) {
                                               let kinks = require('@turf/kinks'),
                                                    unkink = require('@turf/unkink-polygon');
                                                polygons.forEach((p,i) => {
                                                    console.log(`checking polygon ${i} for kinks`);
                                                    let hasKinks = kinks({
                                                        type: 'Polygon',
                                                        coordinates: p
                                                    });
                                                    if(hasKinks.features.length) {
                                                        console.log(`polygon ${i} has kinks`);
                                                        console.log(hasKinks);
                                                    }
                                                });
                                           }
                                       }*/
                                   }
                                   def.resolve();
                               } else {
                                   self.emit('info','Created feature ['+f.featureId+'] "'+f.featureName+'"');
                                   def.resolve();
                               }
                            });
                        }
                        tryAddFeature(feature);
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
