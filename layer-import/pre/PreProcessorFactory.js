const EXT_MAP = {
    'zip': require('./ZipPreProcessor'),
    'shp': require('./ShpPreProcessor')
};
module.exports = function(filePath,previousResults) {
    var dot = filePath.lastIndexOf('.'),
        ext = dot ? filePath.substring(dot+1).toLowerCase() : undefined,
        PreProcessorClass = EXT_MAP[ext];
    if(PreProcessorClass) {
        return new PreProcessorClass(previousResults||filePath);
    }
    throw new Error('Unable to find pre-processor for '+filePath);
}
