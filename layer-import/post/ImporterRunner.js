var Importer = require('./Importer'),
    importer = new Importer({
        preResults: JSON.parse(process.argv[2]),
        userInput: JSON.parse(process.argv[3])
    });

importer.on('error',function(err){
    process.send({
        key: 'error',
        obj: err.stack
    });
    process.exit(1);
})
.on('complete',function(results) {
    process.send({
        key: 'complete',
        obj: results
    });
    process.exit(0);
})
.on('info',function(msg){
    process.send({
        key: 'info',
        obj: msg
    });
});
importer.start();
