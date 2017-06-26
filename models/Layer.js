var mongoose = require('mongoose'),
    schema = mongoose.Schema({
        name: {type: String, required: true, unique: true},
        source: {type: String},
        featureIdFmt: {type: String, required: true},
        featureNameFmt: {type: String, required: true},
        _sourceFile: {type: mongoose.Schema.Types.ObjectId, ref: 'File'},
        _createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        _modifiedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    });

schema.post('remove',function(layer){
    // go cleanup associated features
    var Feature = require('./Feature'),
        File = require('odata-resource-file').File;
    Feature.remove({_layer: layer._id},function(err){
        if(err) {
            console.error(err);
        }
    });
    File.remove({_id:layer._sourceFile},function(err){
        if(err) {
            console.error(err);
        }
    });
});

schema.set('collection','Layer');

var Layer = mongoose.model('Layer',schema);

module.exports = Layer;
