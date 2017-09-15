let path = require('path'),
    fs = require('fs'),
    spawn = require('child_process').spawn;


function do_spawn(shp,cmd,args,on_out,on_err) {
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
            console.log(`${cmd} non-zero exit code ${code} exiting.`);
            process.exit(1);
        });
    });
}

module.exports = function(output_dir) {
    return {
        toGeoJson: function(shp,simplify) {
            return new Promise(resolve => {
                let geoJson = path.basename(shp,'.shp')+'.json',
                    log = d => console.log(`${d}`);
                // #1 ogr2ogr
                do_spawn(shp,'ogr2ogr',[
                        '-f','GeoJSON',
                        `${output_dir}/${geoJson}`,
                        '-t_srs','WGS84',
                        `${shp}`
                    ],
                    log,log).then(() => {
                        if(!simplify) {
                            return resolve(geoJson);
                        }
                        let simplified = path.basename(shp,'.shp')+'_simplified.json'
                        // #2 mapshaper to simplify
                        do_spawn(shp,'mapshaper',[
                            `${output_dir}/${geoJson}`,
                            '--simplify', 'visvalingam', 'weighted', '10%', '-o', 'format=geojson',
                            `${output_dir}/${simplified}`
                        ],log,log).then(() => {
                            resolve(simplified);
                        })
                    });
            });
        },
        noNewLines: function(geoJson) {
            let script = `${__dirname}/scripts/removeNewLines`;
            return new Promise(resolve => {
                let child = spawn('sh',[
                    script,
                    `${output_dir}/${geoJson}`
                ]);
                child.stdout.on('data',data => console.log(`${data}`));
                child.stderr.on('data',data => console.log(`ERROR:${data}`));
                child.on('close',(code) => {
                    if(code == 0) {
                        return resolve(geoJson);
                    }
                    console.log(`Unable to remove newlines from ${output_dir}/${geoJson} (exit code: ${code}) exiting.`);
                    process.exit(1);
                });
            });
        },
        toNdJson(geoJson) {
            console.log(`${path.basename(geoJson,'.json')}`);
            let ndJson = path.basename(geoJson,'.json')+'.ndjson',
                script = `${__dirname}/scripts/toNdJson`;
            return new Promise(resolve => {
                let child = spawn('sh',[
                    script,
                    `${output_dir}/${geoJson}`,
                    `${output_dir}/${ndJson}`,
                ]);
                child.stdout.on('data',data => console.log(`${data}`));
                child.stderr.on('data',data => console.log(`ERROR:${data}`));
                child.on('close',(code) => {
                    if(code == 0) {
                        return resolve(ndJson);
                    }
                    console.log(`Unable to translate ${output_dir}/${geoJson} to NdJson (exit code: ${code}) exiting.`);
                    process.exit(1);
                });
            });
        }
    };
};
