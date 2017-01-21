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
                self.emit('complete',self.results(message.obj).results());
            } else {
                self.emit(message.key,message.obj);
            }
        });
    }
}

module.exports = PreProcessorRunnerMonitor;
