var Resource = require('odata-resource'),
    conf = require('app-container-conf'),
    debug = require('debug')('geo-resource-container'),
    prefix = (conf.get('resources:$apiRoot')||'/api/v1/')+'geo/',
    features,layers;

features = new Resource({
    rel: prefix+'feature',
    model: require('./models/Feature'),
    populate:['_layer'],
    count: true
})
.staticLink('intersects',function(req,res){
    var query;
    try {
        query = features.intersectsQuery(req);
    } catch(err) {
        return Resource.sendError(res,400,'Bad request',err);
    }
    query.exec(function(err,found){
        if(err) {
            return Resource.sendError(res,500,'error finding features.',err);
        }
        features.listResponse(req,res,found);
    });
});

features.intersectsQuery = function(req) {
    var geometry = { type: 'Point' };
    // lon,lat[,lon,lat]*
    if(req.query.coordinates) {
        geometry.coordinates = req.query.coordinates.split(',').map(function(c){
            return parseFloat(c);
        });
        if(geometry.coordinates.length > 2) {
            if((geometry.coordinates.length%2) !== 0) {
                throw new Error('Invalid number of coordinates.');
            }
            geometry.type = 'Polygon';
            // break into pairs and wrap
            geometry.coordinates = [geometry.coordinates.reduce(function(arr,c,i){
                if(i%2 == 0) {
                    arr.push([c]);
                } else {
                    arr[arr.length-1].push(c);
                }
                return arr;
            },[])];
            // coordinates must be wound counter clockwise for inclusive
            geometry.crs = {
                type: "name",
                properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" }
            };
        }
    } else {
        throw new Error('Missing coordinates.');
    }
    debug('intersectsQuery.geometry',geometry);
    return features.initQuery(features.getModel().find({
        'data.geometry':{
            $geoIntersects:{
                $geometry: geometry
            }
        }
    }),req);
};

layers = new Resource({
    rel: prefix+'layer',
    model: require('./models/Layer'),
    populate:['_sourceFile'],
    count: true
})
.instanceLink('features',{
    otherSide: features,
    key: '_layer'
})
.instanceLink('topojson',function(req,res){
    var featuresToTopo = require('./lib/featuresToTopo');
    // TODO - this current route is memory intensive
    var query = this.initQuery(features.getModel().find({_layer: req._resourceId}),req);
    query.exec(function(err,features){
        if(err) {
            return Resource.sendError(res,500,'error finding features.',err);
        }
        res.json(featuresToTopo(features,req));
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
