var cp = require('child_process'),
    path = require('path');

const PreProcessor = require('./PreProcessor');

class PreProcessorRunnerMonitor extends PreProcessor {
    constructor(filePath) {
        super(filePath);
    }

    start() {
        var self = this,
            results = self.results(),
            child = this.child = cp.fork(__dirname+path.sep+'PreProcessorRunner.js',[results.inputFile]);
        child.on('message',function(message) {
            if(message.key === 'error') {
                self.emit('error',message.obj);
            } else if (message.key === 'complete') {
                self.results(message.obj);
                self.emit('complete',self.results());
            } else {
                console.error(message);
                self.emit('error','Unkown message from child');
            }
        });
    }
}

module.exports = PreProcessorRunnerMonitor;
