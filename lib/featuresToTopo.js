var topology = require('topojson').topology,
    conf = require('app-container-conf'),
    prefix = (conf.get('resources:$apiRoot')||'/api/v1/')+'geo/';

module.exports = function(features,req) {
    features.forEach(function(f){
        f.data.properties._featureProps = Object.keys(f).reduce(function(map,key){
            var val = f[key];
            if(typeof(val) !== 'object') {
                map[key] = val;
            }
            return map;
        },{
            _id: f._id,
            _links: {
                self: prefix+'feature/'+f._id
            }
        });
    });
    return topology({
        layer: {
            type: "FeatureCollection",
            features: features.map(function(f) { return f.data; })
        }
    },(req.query.q ? Number(req.query.q) : undefined));
};
