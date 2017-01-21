var fs = require('fs'),
    unzip = require('unzip'),
    _ = require('lodash'),
    shapefile = require('shapefile');

const EventEmitter = require('events');
const ShpPreProcessor = require('./ShpPreProcessor');

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

class LayerPreProcessor extends ShpPreProcessor {
    start() {
        this._extract();
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
                  self._toNdJson();
              });
          finder.find();
    }
}

module.exports = LayerPreProcessor;
