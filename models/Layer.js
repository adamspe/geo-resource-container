var mongoose = require('mongoose'),
    schema = mongoose.Schema({
        name: {type: String, required: true, unique: true},
        source: {type: String},
        featureIdProperty: {type: String, required: true},
        featureNameProperty: {type: String, required: true},
        _createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        _modifiedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    });

schema.set('collection','Layer');

var Layer = mongoose.model('Layer',schema);

module.exports = Layer;
