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
