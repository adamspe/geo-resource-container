var Resource = require('odata-resource'),
    debug = require('debug')('geo-resource-container'),
    q = require('q'),
    featuresToTopo = require('./lib/featuresToTopo'),
    conf = require('app-container-conf'),
    prefix = (conf.get('resources:$apiRoot')||'/api/v1/')+'geo/';

module.exports = function(container,featuresResource) {
    function exec(query) {
        var def = q.defer();
        query.exec(function(err,response){
            if(err) {
                def.reject(err);
            } else {
                def.resolve(response);
            }
        });
        return def.promise;
    }
    // don't overload intersects this behaves differently
    // ?coordinates=a,b,c,d,e,f,j,k&$filter=<filter>
    // POSTed body is an array of feature ids that the client
    // already has in hand that should be excluded from the results
    // response: {
    //   topojson: <topojson of new features>
    //   ids: [<list of feature ids that would comprise the complete result set>]
    // }
    container.app().post(featuresResource.getRel()+'/featureBounds',function(req,res){
        var q1,q2,cids = req.body;
        if(!Array.isArray(req.body)) {
            return Resource.sendError(res,400,'Bad request',err);
        }
        try {
            q1 = featuresResource.intersectsQuery(req);
            q2 = featuresResource.intersectsQuery(req);
        } catch(err) {
            return Resource.sendError(res,400,'Bad request',err);
        }
        if(cids.length) {
            q1.where('_id').nin(cids);
        }
        q2.select('_id');
        q.allSettled([exec(q1),exec(q2)]).then(function(result){
console.log('allSettled');
            var err = result[0].state !== 'fulfilled' ?
                        result[0].reason :
                        (result[1].state !== 'fulfilled' ? result[1].reason : undefined);
            if(err) {
                console.error(err);
                return Resource.sendError(res,500,'Internal Server Error',err);
            }
            // turn q1 results into topojson
            var features = result[0].value,
                ids = result[1].value;
            res.json({
                topojson: featuresToTopo(features,req),
                ids: ids.map(function(d) { return d._id })
            });
        });
    });
    return container;
};
