
var fs = require('fs')
    ndjson = require('ndjson');

const PreProcessor = require('./PreProcessor');

class NdJsonPreProcessor extends PreProcessor {
    start() {
        var self = this,
            results= self.results(),
            propertyCollector = self.propertyCollector(),
            featureCount = 0;
        results.ndJson = results.inputFile;
        fs.createReadStream(results.inputFile)
          .pipe(ndjson.parse())
          .on('data',function(obj){
              propertyCollector.collect(obj.properties);
              featureCount++;
          })
          .on('end',function(){
              results.exampleProperties = propertyCollector.exampleProperties();
              results.examplePropertiesAnnotated = propertyCollector.exampleProperties(true);
              results.featureCount = featureCount;
              self.emit('complete',results);
          });
    }
}

module.exports = NdJsonPreProcessor;
