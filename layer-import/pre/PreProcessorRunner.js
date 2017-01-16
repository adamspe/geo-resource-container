var PreProcessorFactory = require('./PreProcessorFactory');
    inputFile = process.argv[2],
    preProcess = PreProcessorFactory({
        filePath: inputFile
    });

preProcess.on('error',function(err){
    process.send({
        key: 'error',
        obj: err.stack
    });
})
.on('complete',function(results) {
    process.send({
        key: 'complete',
        obj: results
    });
});
preProcess.start();
