var PreProcessorRunnerMonitor = require('./PreProcessorRunnerMonitor');

const EXT_MAP = {
    'zip': require('./ZipPreProcessor'),
    'shp': require('./ShpPreProcessor'),
    'ndjson': require('./NdJsonPreProcessor'),
};
module.exports = function(input) {
    var filePath = input.filePath,
        previousResults = input.previousResults,
        dot = filePath.lastIndexOf('.'),
        ext = dot ? filePath.substring(dot+1).toLowerCase() : undefined,
        PreProcessorClass = EXT_MAP[ext];
    if(PreProcessorClass) {
        if(input.fork && !previousResults) {
            return new PreProcessorRunnerMonitor(filePath);
        } else {
            return new PreProcessorClass(previousResults||filePath);
        }
    }
    throw new Error('Unable to find pre-processor for '+filePath);
}
