var fs = require('fs'),
    fse = require('fs-extra'),
    unzip = require('unzip'),
    _ = require('lodash'),
    shapefile = require('shapefile');
const EventEmitter = require('events');

// wrapping in a class in case I later want to implement myself.
class ShpFinder extends EventEmitter {
    constructor(dir) {
        super();
        this.dir = dir;
    }

    find() {
        var self = this,
            FindFiles = require('node-find-files'),
            finder = new FindFiles({
                rootFolder: self.dir,
                filterFunction: function(path,stat){
                    return /\.shp$/i.test(path);
                }
            });
        finder.on('match',function(strPath,stat){
            self.emit('match',strPath,stat);
        })
        .on('error',function(err){
            self.emit('error',err);
        })
        .on('patherror',function(err,strPath){
            self.emit('error',err);
        })
        .on('complete',function(){
            self.emit('complete');
        });
        finder.startSearch();
    }
}

class LayerPreProcessor extends EventEmitter {
    constructor(input) {
        super();
        if(_.isObject(input)) {
            this.$results = input;
        } else if(_.isString(input)) {
            this.$results = {
                inputFile: input
            };
        }
    }

    start() {
        this._extract();
    }

    results(nv) {
        if(!arguments.length) {
            return this.$results||{};
        }
        this.$results = nv;
        return this;
    }

    complete() {
        this.emit('complete',this.$results);
    }

    cleanup(next) {
        var self = this,
            results = self.results(),
            tmpFolder = results.tmpFolder;
        function reset() {
            self.results({
                inputFile: results.inputFile
            });
        }
        if(tmpFolder) {
            fse.remove(tmpFolder,next||function(err) {
                if(err) {
                    console.error(err);
                    return self.emit('error',err);
                }
                reset();
            });
        } else {
            reset();
        }
    }

    _cleanup(originalErr){
        var self = this;
        if(self.results().tmpFolder) {
            self.cleanup(function(err){
               if(err) {
                   console.error(err);
               }
               self.emit('error',originalErr);
            });
        } else {
            self.emit('error',originalErr);
        }
    }

    _extract() {
        var self = this,
            results = self.results(),
            cleanup = function(err) { self._cleanup(err) };
        fs.mkdtemp('geo-shp',function(err,folder){
            results.tmpFolder = folder;
            if(err) {
                return cleanup(err);
            }
            fs.createReadStream(results.inputFile).pipe(unzip.Extract({path:results.tmpFolder}))
              .on('error',cleanup)
              .on('close',function(){
                  self._findShpFile();
              });
        });
    }

    _findShpFile() {
        var self = this,
            results = self.results(),
            finder = new ShpFinder(results.tmpFolder),
            shps = [],
            cleanup = function(err) { self._cleanup(err) };
        finder.on('error',cleanup)
              .on('match',function(path){
                  shps.push(path);
              })
              .on('complete',function(){
                  if(shps.length !== 1) {
                      cleanup(new Error('Unable to find a single shapefile (found '+shps.length+')'));
                  }
                  results.shpFile = shps[0];
                  self._toNdJsonson();
              });
          finder.find();
    }

    _toNdJsonson() {
        var self = this,
            results = self.results(),
            out,
            coordError,
            exampleProperties,
            featureCount = 0,
            cleanup = function(err) { self._cleanup(err) };
        results.ndJson = results.shpFile+'.ndjson';
        out = fs.createWriteStream(results.ndJson)
                .on('error',cleanup);
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

        shapefile.open(results.shpFile)
                .then(function (source) {
                  return source.read()
                      .then(function repeat(result) {
                            if(result.done || (coordError = testFirstCoordPair(result.value.geometry.coordinates))) {
                                return;
                            }
                            collectProperties(result.value.properties);
                            out.write(JSON.stringify(result.value));
                            out.write("\n");
                            featureCount++;
                            return source.read().then(repeat);
                      })
                      .then(function() {
                          out.end();
                          if(coordError) {
                              cleanup(coordError);
                          } else {
                              results.properties = exampleProperties;
                              results.featureCount = featureCount;
                              self.complete();
                          }
                      });
                })
                .catch(cleanup);
    }


}

module.exports = LayerPreProcessor;
