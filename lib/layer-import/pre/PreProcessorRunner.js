var PreProcessorFactory = require('./PreProcessorFactory');
    inputFile = process.argv[2],
    preProcess = PreProcessorFactory({
        filePath: inputFile
    });

preProcess.on('error',function(err){
    process.send({
        key: 'error',
        data: err.stack
    });
    process.exit(1);
})
.on('complete',function(results) {
    process.send({
        key: 'complete',
        data: results
    });
    process.exit(0);
});
preProcess.start();
