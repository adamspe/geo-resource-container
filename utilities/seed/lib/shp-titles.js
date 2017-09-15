let EventEmitter = require('events'),
    fs = require('fs'),
    xpath = require('xpath'),
    DOMParser = require('xmldom').DOMParser;

class ShpTitles extends EventEmitter {
    constructor(shpFinder) {
        super();
        this.shpFinder = shpFinder;
    }
    find() {
        this.emit('start');
        let shps = [];
        this.shpFinder.on('found',f => shps.push(f))
        .on('end',() => {
            let shpMap = {};
            Promise.all(shps.map(f => {
                return new Promise(resolve => {
                    let fx = `${f}.xml`;
                    fs.lstat(fx,(e,stat) => {
                        if(stat && stat.isFile()) {
                            fs.readFile(fx,'utf8',(err,data) => {
                                // parse and get title
                                let doc = (new DOMParser()).parseFromString(data),
                                    nodes = xpath.select('/metadata/dataIdInfo/idCitation/resTitle ',doc);
                                resolve(shpMap[f] = nodes.length === 1 ? nodes[0].firstChild.data : undefined);
                            });
                        } else {
                            resolve(shpMap[f] = undefined);
                        }
                    });
                });
            })).then(() => {
                this.emit('end',shpMap);
            });
        })
        .find();
    }
}
module.exports = ShpTitles;
