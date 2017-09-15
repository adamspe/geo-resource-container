let path = require('path'),
    fs = require('fs'),
    spawn = require('child_process').spawn;


function do_spawn(cmd,args,on_out,on_err) {
    return new Promise(resolve => {
        let child = spawn(cmd,args);
        if(on_out) {
            child.stdout.on('data',on_out);
        }
        if(on_err) {
            child.stderr.on('data',on_err);
        }
        child.on('close',code => {
            if(code === 0) {
                return resolve();
            }
            console.log(`"${cmd} ${args.join(' ')}" non-zero exit code ${code} exiting.`);
            process.exit(1);
        });
    });
}

module.exports = function(output_dir) {
    return {
        toGeoJson: function(shp,simplify) {
            return new Promise(resolve => {
                let baseName = path.basename(shp,'.shp'),
                    geoJson = `${baseName}.json`,
                    log = d => console.log(`${d}`);

                /* won't deal with making sure we're using WGS84 coordinates
                console.log(`-- simplify ${path.basename(shp,'.shp')}`);
                do_spawn('mapshaper',[
                    shp,
                    '--simplify', 'visvalingam', 'weighted', '10%', '-o', 'format=geojson',
                    `${output_dir}/${geoJson}`
                ],log,log).then(() => {
                    resolve(geoJson) });*/

                // #1 ogr2ogr
                console.log(`toGeoJson: ${baseName}`);
                // consider using https://www.npmjs.com/package/ogr2ogr
                do_spawn('ogr2ogr',[
                        '-f','GeoJSON',
                        `${output_dir}/${geoJson}`,
                        '-t_srs','WGS84',
                        `${shp}`
                    ],
                    log,log).then(() => {
                        if(!simplify) {
                            return resolve(geoJson);
                        }
                        console.log(`simplify: ${baseName}`);
                        let simplified = `${baseName}_simplified.json`;
                        // #2 mapshaper to simplify
                        do_spawn('mapshaper',[
                            `${output_dir}/${geoJson}`,
                            '--simplify', 'visvalingam', 'weighted', '10%', '-o', 'format=geojson',
                            `${output_dir}/${simplified}`
                        ],log,log).then(() => {
                            resolve(simplified);
                        });
                    });
            });
        },
        noNewLines: function(geoJson) {
            let script = `${__dirname}/scripts/removeNewLines`,
                log = d => console.log(`${d}`);
            return new Promise(resolve => {
                do_spawn('sh',[
                    script,
                    `${output_dir}/${geoJson}`
                ],log,log).then(() => {
                    resolve(geoJson);
                });
            });
        },
        toNdJson(geoJson) {
            let ndJson = path.basename(geoJson,'.json')+'.ndjson',
                script = `${__dirname}/scripts/toNdJson`,
                log = d => console.log(`${d}`);
            return new Promise(resolve => {
                do_spawn('sh',[
                    script,
                    `${output_dir}/${geoJson}`,
                    `${output_dir}/${ndJson}`,
                ],log,log).then(() => {
                    resolve(ndJson);
                });
            });
        },
        split: function(ndJson,max) {
            let f = `${output_dir}/${ndJson}`,
                baseF = path.basename(f,'.ndjson'),
                pfx = `${f}.`;
            return new Promise(resolve => {
                do_spawn('split',[
                    '-l', max, f, pfx
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
                        resolve(splits);
                    });
                });
            });
        }
    };
};
