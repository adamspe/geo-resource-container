var Resource = require('odata-resource'),
    debug = require('debug')('geo-resource-container'),
    featuresToTopo = require('./lib/featuresToTopo'),
    conf = require('app-container-conf'),
    prefix = (conf.get('resources:$apiRoot')||'/api/v1/')+'geo/';

module.exports = function(container,featuresResource) {
    // this is a stateful URL, server keeps track of what it understands to be
    // the list of features the client currently has on the map...
    // don't overload intersects this behaves differently
    // ?coordinates=a,b,c,d,e,f,j,k&$filter=<filter>&$reset=true
    // POSTed body is ignored
    // $reset=true can be sent to clobber the server's state
    // response: {
    //   drop: [<feature id>],
    //   add: <topojson>
    // }
    container.app().post(featuresResource.getRel()+'/featureBounds',function(req,res){
        if(!req.query.$filter) {
            return Resource.sendError(res,400,'Bad request',err);
        }
        var query;
        try {
            query = featuresResource.intersectsQuery(req);
        } catch(err) {
            return Resource.sendError(res,400,'Bad request',err);
        }
        query.exec().then(function(result){
            var session = req.session,
                // could be the whole query string instead
                filterJson = JSON.stringify(req.query.$filter),
                responseObj = {},
                foundIds = result.map(function(feature) { return feature._id}),
                // TODO express-session serializes the session object (to/from JSON)
                // as opposed to just storing it as an object in mongo, for large numbers
                // of features this seems less than ideal and maybe this info should be placed elsewhere...
                currentState = session.featureBoundsState;
            if(req.query.$reset) {
                currentState = {};
            }
            currentState = currentState||{};
            currentState.$filter = currentState.$filter||filterJson;
            if(currentState.$filter !== filterJson) {
                // filter has changed clear any previous results
                delete currentState.active;
            }
            currentState.active = currentState.active||[];
            debug('found '+foundIds.length+' intersecting features');
            if(foundIds.length) {
                var drop = [].concat(currentState.active),
                    add = [];
                foundIds.forEach(function(id){
                    id = id.toString();
                    var idx = drop.indexOf(id);
                    if(idx !== -1) {
                        // client has this one already, ignore it
                        drop.splice(idx,1);
                    } else {
                        // client doesn't yet have this one
                        add.push(id);
                    }
                });
                debug('client add feature ids',add);
                debug('client drop feature ids',drop);
                // anything left in active becomes drop
                responseObj.drop = drop;
                if(add.length) {
                    responseObj.add = featuresToTopo(result.filter(function(feature){
                        return add.indexOf(feature._id.toString()) !== -1;
                    }),req);
                }
                // currentState.active becomes active - drop + add
                currentState.active = currentState.active.filter(function(id){
                        return drop.indexOf(id) === -1;
                    }).concat(add);
            } else {
                // nothing found, tell the client to drop any features they have
                responseObj.drop = currentState.active;
                currentState.active = [];
            }
            session.featureBoundsState = currentState;
            res.json(responseObj);
        },function(err){
            console.error(err);
            return Resource.sendError(res,500,'Internal Server Error',err);
        });
    });
    return container;
};
