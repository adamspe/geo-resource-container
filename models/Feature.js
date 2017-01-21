var GeoJSON = require('mongoose-geojson-schema'),
    mongoose = require('mongoose'),
    schema = mongoose.Schema({
        _layer: {$type: mongoose.Schema.Types.ObjectId, ref: 'Layer'},
        featureId: {$type: String, required: true},
        featureName: {$type: String, required: true},
        data: { // the actual feature data, wrap a level down
            type: {$type: String},
            properties: {$type: mongoose.Schema.Types.Mixed},
            geometry: {$type: mongoose.Schema.Types.Geometry/*, index: '2dsphere'*/},
        }
    },{typeKey: '$type'});

schema.set('collection','Feature');
//schema.index({data: { geometry: 1 } });

var Feature = mongoose.model('Feature',schema);

module.exports = Feature;
