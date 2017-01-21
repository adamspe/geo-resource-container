var fs = require('fs'),
    fse = require('fs-extra'),
    _ = require('lodash'),
    path = require('path'),
    shapefile = require('shapefile');

const PreProcessor = require('./PreProcessor');

class ShpPreProcessor extends PreProcessor {
    start() {
        var self = this,
            results = self.results(),
            cleanup = function(err) { self._cleanup(err); };
        fs.mkdtemp('geo-shp',function(err,folder){
            results.tmpFolder = folder;
            if(err) {
                return cleanup(err);
            }
            results.shpFile = results.inputFile;
            self._toNdJson();
        });
    }

    _toNdJson() {
        var self = this,
            results = self.results(),
            out,
            coordError,
            propertyCollector = self.propertyCollector(),
            featureCount = 0,
            cleanup = function(err) {
                if(out) {
                    out.end();
                }
                self._cleanup(err)
            };
        results.ndJson = results.tmpFolder+path.sep+'output.ndjson';
        out = fs.createWriteStream(results.ndJson)
                .on('error',cleanup)
                .on('finish',function(){
                    if(coordError) {
                        cleanup(coordError);
                    } else {
                        results.exampleProperties = propertyCollector.exampleProperties();
                        results.uniqueProperties = propertyCollector.uniqueProperties();
                        results.featureCount = featureCount;
                        self.emit('complete',results);
                    }
                });

        function writeNewlineDelimitedFeatures(source) {
            return source.read().then(function repeat(result) {
                if(result.done || (coordError = self.testFirstCoordPair(result.value.geometry.coordinates))) {
                    return;
                }
                propertyCollector.collect(result.value.properties);
                out.write(JSON.stringify(result.value));
                out.write("\n");
                featureCount++;
                return source.read().then(repeat);
            }).then(function() {
                out.end();
            });
        }
        shapefile.open(results.shpFile,undefined,{encoding: undefined})
                .then(writeNewlineDelimitedFeatures)
                .catch(cleanup);
    }
}

module.exports = ShpPreProcessor;
