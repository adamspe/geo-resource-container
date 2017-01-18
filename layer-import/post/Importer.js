var mongoose = require('mongoose'),
    AppContainer = require('app-container');


const PostProcessor = require('./PostProcessor');

class Importer extends PostProcessor {
    start() {
        var self = this,
            disconnectOnComplete = !mongoose.connection.readyState;
        function complete(err) {
            if(err) {
                console.error(err);
            }
            self.emit('complete',{
                preResults: self.preResults(),
                userInput: self.userInput()
            });
        }
        function connected(err) {
            if(err) {
                return self.emit('error',err);
            }
            var Layer = require('../../models/Layer'),
                Feature = require('../../models/Feature');
            // TODO, do the work!!
            if(disconnectOnComplete) {
                mongoose.connection.close(complete);
            } else {
                complete();
            }
        }
        if(disconnectOnComplete) {
            AppContainer.db(connected);
        } else {
            connected();
        }
    }
}

module.exports = Importer;
