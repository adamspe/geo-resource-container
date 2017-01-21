var fs = require('fs'),
    fse = require('fs-extra'),
    _ = require('lodash');
const EventEmitter = require('events');

class PropertyCollector {
    collect(props) {
        var self = this;
        if(!self.$exampleProperties) {
            self.$exampleProperties = Object.keys(props).reduce(function(map,key){
                if(!!props[key]) { // weed out null
                    map[key] = props[key];
                }
                return map;
            },{});
            self.$uniqueProperties = Object.keys(self.$exampleProperties).reduce(function(map,key){
                map[key] = [self.$exampleProperties[key]];
                return map;
            },{});
            return;
        }
        var exampleProperties = self.$exampleProperties,
            uniqueProperties = self.$uniqueProperties;
        // exampleProperties should be the intersection of all feature
        // properties (those consistently found among all features)
        var epKeys = Object.keys(exampleProperties);
        Object.keys(props).forEach(function(key) {
            if(!exampleProperties[key]/* null */ || epKeys.indexOf(key) === -1) {
                delete exampleProperties[key];
            }
            if(uniqueProperties[key] && uniqueProperties[key].indexOf(props[key]) !== -1) {
                delete uniqueProperties[key]
            }
        });
    }

    exampleProperties() {
        return this.$exampleProperties;
    }

    uniqueProperties() {
        return Object.keys(this.$uniqueProperties);
    }
}
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

    /**
     * Synchronous cleanup
     */
    cleanupSync() {
        var self = this,
            results = self.results(),
            tmpFolder = results.tmpFolder;
        if(tmpFolder) {
            fse.removeSync(tmpFolder);
        }
        self.results({
            inputFile: results.inputFile
        });
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


    // given a feature geometry tests the first coordinate pair to make sure
    // it is in fact a pair and that it appears to be lat/lng or in some
    // other coordinate system which would be problematic.
    testFirstCoordPair(geometry) {
        while(_.isArray(geometry) && !_.isNumber(geometry[0])) {
            geometry = geometry[0];
        }
        if(geometry.length !== 2) {
            return new Error('Expected two coordinates but found '+geometry.length);
        }
        var x = Math.abs(geometry[0]),
            y = Math.abs(geometry[1]);
        if(x > 180 || y > 180) {
            return new Error('Coordinates out of range ['+x+','+y+']');
        }
    }

    propertyCollector() {
        return new PropertyCollector();
    }
}

module.exports = PreProcessor;
