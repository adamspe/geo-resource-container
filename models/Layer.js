var mongoose = require('mongoose'),
    schema = mongoose.Schema({
        name: {type: String, required: true, unique: true}
    });

schema.set('collection','Layer');

var Layer = mongoose.model('Layer',schema);

module.exports = Layer;
