var mongoose = require('mongoose'),
    schema = mongoose.Schema({
        name: {type: String, required: true, unique: true},
        source: {type: String},
        featureIdFmt: {type: String, required: true},
        featureNameFmt: {type: String, required: true},
        _createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        _modifiedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    });

schema.set('collection','Layer');

var Layer = mongoose.model('Layer',schema);

module.exports = Layer;
