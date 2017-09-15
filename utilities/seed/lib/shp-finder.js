let EventEmitter = require('events'),
    path = require('path'),
    fs = require('fs');

class ShpFinder extends EventEmitter {
    constructor(root) {
        super();
        this.root = root;
    }

    find() {
        this.emit('start');
        this._find(this.root).then(() => {
            this.emit('end');
        });
    }

    _find(dir) {
        return new Promise(resolve => {
            fs.readdir(dir,(err,files) => {
                let promises = files.map((f) => {
                    let fn = path.join(dir,f);
                    return new Promise(inner_resolve => {
                        fs.lstat(fn,(e,stat) => {
                            if(stat.isDirectory()) {
                                return this._find(fn).then(inner_resolve);
                            } else if(/\.shp$/.test(fn)){
                                this.emit('found',fn);
                            }
                            inner_resolve();
                        });
                    });

                });
                Promise.all(promises).then(resolve);
            });
        });
    }
}
module.exports = ShpFinder;
