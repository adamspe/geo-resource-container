var fs = require('fs'),
    fse = require('fs-extra'),
    _ = require('lodash');
const EventEmitter = require('events');

/**
 * "abstract" class implementation of a PreProcessor
 */
class PreProcessor extends EventEmitter {
    /**
     * Creates a new PreProcessor
     * @param {String|Object} If an object its the results from a previous run, if a String the file path to work from.
     */
    constructor(input) {
        super();
        if(_.isObject(input)) {
            this.$results = input;
        } else if(_.isString(input)) {
            this.$results = {
                inputFile: input
            };
        }
    }

    /**
     * Start pre-processing.
     */
    start() {}

    /**
     * Set or get the results
     */
    results(nv) {
        if(!arguments.length) {
            return this.$results||{};
        }
        this.$results = nv;
        return this;
    }

    /**
     * Perform cleanup.
     */
    cleanup(next) {
        var self = this,
            results = self.results(),
            tmpFolder = results.tmpFolder;
        function reset() {
            self.results({
                inputFile: results.inputFile
            });
        }
        if(tmpFolder) {
            fse.remove(tmpFolder,next||function(err) {
                if(err) {
                    console.error(err);
                    return self.emit('error',err);
                }
                reset();
            });
        } else {
            reset();
        }
    }

    _cleanup(originalErr){
        var self = this;
        if(self.results().tmpFolder) {
            self.cleanup(function(err){
               if(err) {
                   console.error(err);
               }
               self.emit('error',originalErr);
            });
        } else {
            self.emit('error',originalErr);
        }
    }
}

module.exports = PreProcessor;
