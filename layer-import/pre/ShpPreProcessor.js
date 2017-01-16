var fs = require('fs'),
    fse = require('fs-extra'),
    _ = require('lodash'),
    path = require('path'),
    shapefile = require('shapefile');

const PreProcessor = require('./PreProcessor');

class ShpPreProcessor extends PreProcessor {
    constructor(input) {
        super(input);
    }

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
            exampleProperties,
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
                        results.properties = exampleProperties;
                        results.featureCount = featureCount;
                        self.emit('complete',results);
                    }
                });
        function testFirstCoordPair(geometry) {
            while(_.isArray(geometry) && !_.isNumber(geometry[0])) {
                geometry = geometry[0];
            }
            if(geometry.length !== 2) {
                return new Error('Expected two coordinates but found '+geometry.length);
            }
            var x = Math.abs(geometry[0]),
                y = Math.abs(geometry[1]);
            if(x > 180 || y > 180) {
                return new Error('Coordinates out of range ['+x+','+y+']');
            }
        }
        function collectProperties(props) {
            if(!exampleProperties) {
                return exampleProperties = Object.keys(props).reduce(function(map,key){
                    if(!!props[key]) { // weed out null
                        map[key] = props[key];
                    }
                    return map;
                },{});
            }
            // exampleProperties should be the intersection of all feature
            // properties (those consistently found among all features)
            var epKeys = Object.keys(exampleProperties);
            Object.keys(props).forEach(function(key) {
                if(!exampleProperties[key]/* null */ || epKeys.indexOf(key) === -1) {
                    delete exampleProperties[key];
                }
            });
        }

        function writeNewlineDelimitedFeatures(source) {
            return source.read().then(function repeat(result) {
                if(result.done || (coordError = testFirstCoordPair(result.value.geometry.coordinates))) {
                    return;
                }
                collectProperties(result.value.properties);
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
