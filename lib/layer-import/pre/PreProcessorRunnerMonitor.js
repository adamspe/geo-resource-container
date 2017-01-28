var cp = require('child_process'),
    path = require('path');

const PreProcessor = require('./PreProcessor');

class PreProcessorRunnerMonitor extends PreProcessor {
    start() {
        var self = this,
            results = self.results(),
            child = this.child = cp.fork(__dirname+path.sep+'PreProcessorRunner.js',[results.inputFile]);
        child.on('message',function(message) {
            if (message.key === 'complete') {
                self.emit('complete',self.results(message.data).results());
            } else {
                self.emit(message.key,message.data);
            }
        });
    }
}

module.exports = PreProcessorRunnerMonitor;
