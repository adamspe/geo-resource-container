let path = require('path'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    NdJsonPreProcessor = require('../../../lib/layer-import/pre/NdJsonPreProcessor');

const TO_NDJSON_SCRIPT = `${__dirname}/scripts/toNdJson`;
const REMOVE_NEWLINES_SCRIPT = `${__dirname}/scripts/removeNewLines`;

function do_spawn(cmd,args) {
    return new Promise(resolve => {
        let child = spawn(cmd,args);
        child.stdout.on('data',d => console.log(`${d}`));
        child.stderr.on('data',d => console.error(`stderr: ${d}`));
        child.on('close',code => {
            if(code === 0) {
                return resolve();
            }
            console.log(`"${cmd} ${args.join(' ')}" non-zero exit code ${code} exiting.`);
            process.exit(1);
        });
    });
}

module.exports = function(output_dir,argv) {
    let cleanup = !argv.nocleanup,
        maxAverageFeatureSize = argv.maxAverageFeatureSize ? ((+argv.maxAverageFeatureSize)*1024) : undefined,
        maxFeatures = argv.maxFeatures ? +argv.maxFeatures : 5000;

    let transforms = {
        // sets record.geoJson resolves record
        toGeoJson: function(record) {
            return new Promise(resolve => {
                let shp = record.shp,
                    baseName = path.basename(shp,'.shp'),
                    geoJson = `${baseName}.json`;
                console.log(`toGeoJson: ${baseName}`);
                // consider using https://www.npmjs.com/package/ogr2ogr
                do_spawn('ogr2ogr',[
                        '-f','GeoJSON',
                        `${output_dir}/${geoJson}`,
                        '-t_srs','WGS84',
                        `${shp}`
                ]).then(() => {
                    transforms.noNewLines(geoJson)
                        .then((geoJson) => {
                            record.geoJson = geoJson;
                            resolve(record);
                        });
                });
            });
        },
        // sets record.ndJson resolves record
        toNdJson(record) {
            return new Promise(resolve => {
                let geoJson = record.geoJson,
                    ndJson = path.basename(geoJson,'.json')+'.ndjson';
                do_spawn('sh',[
                    TO_NDJSON_SCRIPT,
                    `${output_dir}/${geoJson}`,
                    `${output_dir}/${ndJson}`,
                ]).then(() => {
                    record.ndJson = ndJson;
                    resolve(record);
                });
            });
        },
        simplifyIfNecessary: function(record) {
            return new Promise(resolve => {
                let geoJson = record.geoJson,
                    ndJson = record.ndJson;
                transforms.collectProperties(ndJson)
                    .then(results => {
                        record.featureCount = results.featureCount;
                        record.examplePropertiesAnnotated = results.examplePropertiesAnnotated;
                        record.exampleProperties = results.exampleProperties;
                        if(!maxAverageFeatureSize) {
                            return resolve(record);
                        }
                        let stat = fs.statSync(`${output_dir}/${ndJson}`),
                            avg = stat.size/record.featureCount;
                        if(avg < maxAverageFeatureSize) {
                            return resolve(record);
                        }
                        console.log(`"${record.title}" exceeds maxAverageFeatureSize ${stat.size}/${record.featureCount} = `+avg.toFixed(2)+' simplifying');
                        transforms.simplify(record.geoJson,(maxAverageFeatureSize/avg)*100)
                            .then(simplified => {
                                record.geoJsonSimplified = simplified;
                                transforms.toNdJson({
                                    geoJson: simplified
                                }).then(result => {
                                    if(cleanup) {
                                        // we've replaced the previous ndJson with a simplified one
                                        // don't leave the old one dangling
                                        fs.unlinkSync(`${output_dir}/${record.ndJson}`);
                                    }
                                    record.ndJson = result.ndJson;
                                    stat = fs.statSync(`${output_dir}/${result.ndJson}`);
                                    avg = stat.size/record.featureCount;
                                    console.log('simplified average = '+avg.toFixed(2));
                                    resolve(record);
                                });
                            });
                    });
            });
        },
        splitIfNecessary: function(record) {
            return new Promise(resolve => {
                if(record.featureCount > maxFeatures) {
                    console.log(`Max features exceeded ${record.featureCount} exceeds the maximum of ${maxFeatures} breaking "${record.title}" into multiple layers.`);
                    transforms.split(record.ndJson).then(splits => {
                        record.ndJson = splits;
                        resolve(record);
                    });
                } else {
                    resolve(record);
                }
            });
        },
        simplify: function(geoJson,pcnt) {
            return new Promise(resolve => {
                let baseName = path.basename(geoJson,'.json'),
                    simplified = `${baseName}_simplified.json`;
                pcnt = pcnt.toFixed(2);
                console.log(`Simplifying ${geoJson} to retain ${pcnt}% of removable points`);
                do_spawn('mapshaper',[
                    `${output_dir}/${geoJson}`,
                    '--simplify', 'visvalingam', 'weighted', `${pcnt}%`, '-o', 'format=geojson',
                    `${output_dir}/${simplified}`
                ]).then(() => {
                    transforms.noNewLines(simplified)
                        .then(() => {
                            resolve(simplified);
                        });
                });
            });
        },
        noNewLines: function(geoJson) {
            return new Promise(resolve => {
                do_spawn('sh',[
                    REMOVE_NEWLINES_SCRIPT,
                    `${output_dir}/${geoJson}`
                ]).then(() => {
                    resolve(geoJson);
                });
            });
        },
        split: function(ndJson) {
            let f = `${output_dir}/${ndJson}`,
                baseF = path.basename(f,'.ndjson'),
                pfx = `${f}.`;
            return new Promise(resolve => {
                do_spawn('split',[
                    '-l', maxFeatures, f, pfx
                ]).then(() => {
                    fs.readdir(output_dir,(err,files) => {
                        let split = `${ndJson}.`,
                            splits = files.reduce((arr,f) => {
                                if(f.length > split.length && f.substring(0,split.length) === split) {
                                    arr.push(f);
                                }
                                return arr;
                            },[]);
                        splits = splits.map(function(f,i) {
                            let newF = `${baseF}_${i}.ndjson`;
                            fs.renameSync(`${output_dir}/${f}`,`${output_dir}/${newF}`);
                            return newF;
                        });
                        if(cleanup) {
                            fs.unlinkSync(f);
                        }
                        resolve(splits);
                    });
                });
            });
        },
        collectProperties: function(ndJson) {
            return new Promise(resolve => {
                (new NdJsonPreProcessor(`${output_dir}/${ndJson}`))
                    .on('complete',resolve)
                    .start();
            });
        },
        cleanup: function(record) {
            return new Promise(resolve => {
                if(cleanup) {
                    ['geoJson','geoJsonSimplified'].forEach(key => {
                        if(record[key]) {
                            fs.unlinkSync(`${output_dir}/${record[key]}`);
                            delete record[key];
                        }
                    });
                }
                resolve(record);
            });
        }
    };

    return transforms;
};
