var Resource = require('odata-resource'),
    conf = require('app-container-conf'),
    debug = require('debug')('geo-api'),
    prefix = (conf.get('resources:$apiRoot')||'/api/v1/')+'geo/',
    features,layers;

features = new Resource({
    rel: prefix+'feature',
    model: require('./models/Feature'),
    $top: 10,
    populate:['_layer']
})
.staticLink('containingPoint',function(req,res){
    var lat = parseFloat(req.query.lat),
        lon = parseFloat(req.query.lon),
        query;
    query = features.initQuery(features.getModel().find({
        'data.geometry':{
            $geoIntersects:{
                $geometry: {
                    type: 'Point',
                    coordinates: [lon,lat]
                }
            }
        }
    }),req);
    query.exec(function(err,found){
        if(err) {
            return Resource.sendError(res,500,'error finding features.',err);
        }
        features.listResponse(req,res,found);
    });
});

layers = new Resource({
    rel: prefix+'layer',
    model: require('./models/Layer'),
    populate:['_sourceFile']
})
.instanceLink('features',{
    otherSide: features,
    key: '_layer'
})
.instanceLink('topojson',function(req,res){
    var topology = require('topojson').topology;
    // TODO - this current route is memory intensive
    features.getModel().find({_layer: req._resourceId}).lean(true).exec(function(err,features){
        if(err) {
            return Resource.sendError(res,500,'error finding features.',err);
        }
        features.forEach(function(f){
            f.data.properties._featureProps = Object.keys(f).reduce(function(map,key){
                var val = f[key];
                if(typeof(val) !== 'object') {
                    map[key] = val;
                }
                return map;
            },{
                _links: {
                    self: prefix+'feature/'+f._id
                }
            });
        });
        res.json(topology({
            layer: {
                type: "FeatureCollection",
                features: features.map(function(f) { return f.data; })
            }
        },(req.query.q ? Number(req.query.q) : undefined)));
    });
    /* this doesn't work because topology will require all the GeoJson features at
     * one time, duh, so alternatively ndJson could be written to disk and then geo2topo
     * run on it and the results piped back.
     stream = features.getModel().find({_layer: req._resourceId}).lean(true).stream();
    res.type('application/json; charset=utf-8');
    res.write('{"type":"Topology","objects":{"'+req._resourceId+'":{"type":"GeometryCollection","geometries":[');
    var oneOut = false;
    stream.on('data',function(feature){
        var topo = topology({translated:{
            type: "FeatureCollection",
            features: [feature.data]
        }});
        if(oneOut) {
            res.write(',');
        }
        feature.data.properties.featureId = feature.featureId;
        feature.data.properties.featureName = feature.featureName;
        res.write(JSON.stringify(feature.data));
        oneOut = true;
    }).on('close',function(){
        res.end(']}}}');
    });*/
});

// file resources can be in another container so unfortunately we
// cannot refer to the resource's mapper directly without creating one
// so create its _links like it would
var filePrefix = (conf.get('resources:$apiRoot')||'/api/v1/')+'fs/file/';
layers.getMapper = (function(superFunc){
    return function(postMapper) {
        var mapper = superFunc.apply(layers,arguments);
        return function(o,i,arr){
            var o = mapper(o,i,arr);
            if(o._sourceFile) {
                o._sourceFile._links = {
                    self: filePrefix+o._sourceFile._id,
                    download: filePrefix+o._sourceFile._id+'/download/'+o._sourceFile.filename
                };
            }
            return o;
        };
    };
})(layers.getMapper);

module.exports.featuresResource = features;
module.exports.layersResource = layers;
