var cp = require('child_process'),
    path = require('path');

const PostProcessor = require('./PostProcessor');

class ImporterRunnerMonitor extends PostProcessor {
    start() {
        var self = this,
            pre = JSON.stringify(self.preResults()),
            user = JSON.stringify(self.userInput()),
            child = this.child = cp.fork(__dirname+path.sep+'ImporterRunner.js',[pre,user]);
        child.on('message',function(message){
            if (message.key === 'complete') {
                self.emit('complete',self.results(message.obj).results());
            } else {
                self.emit(message.key,message.obj);
            }
        });
    }
}

module.exports = ImporterRunnerMonitor;
