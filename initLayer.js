
var debug = require('debug')('geo-resource-container'),
    util = require('util'),
    conf = require('app-container-conf'),
    prefix = (conf.get('resources:$apiRoot')||'/api/v1/')+'geo/',
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    layerImport = require('./lib/layer-import'),
    PreProcessorFactory = layerImport.PreProcessorFactory,
    PostProcessorFactory = layerImport.PostProcessorFactory,
    STATES = {
        HANDSHAKE: 'HANDSHAKE',
        FILE_UPLOAD: 'FILE_UPLOAD',
        PRE_PROCESS_RUNNING: 'PRE_PROCESS_RUNNING',
        USER_INPUT: 'USER_INPUT'
    },
    File = require('odata-resource-file').File;;

module.exports = function(container){
    container.enableWebSockets();
    container.app().ws(prefix+'initLayer',function(ws,req) {
        function send(msg) {
            debug('WebSocket sending ',msg);
            ws.send(JSON.stringify(msg));
        }
        function sendError(err) {
            send({key:'error',data:err});
        }
        function sendInfo(info) {
            send({key:'info',data:info});
        }
        function moveClientTostate(s,data) {
            send({key:'state',toState:s,data:data});
        }
        function logError(err,next) {
            if(err) {
                console.error(err);
            }
        }
        var tmpFolder,
            preProcessor,
            postProcessor;
        ws.on('close',function(){
            debug('WebSocket closed [%s]',req.user.email);
            var tmp;
            if(tmpFolder) {
                fse.remove(tmpFolder,logError);
                tmpFolder = undefined;
            }
            if(preProcessor) {
                preProcessor.cleanup(logError);
                preProcessor = undefined;
            }
        });
        ws.on('message',function(msg){
            msg = JSON.parse(msg);
            debug('WebSocket message[%s] %j',req.user.email,msg);
            switch(msg.key) {
                case 'state':
                    switch(msg.currentState){
                        case STATES.HANDSHAKE:
                            moveClientTostate(STATES.FILE_UPLOAD);
                            break;
                        case STATES.FILE_UPLOAD:
                            debug('TODO pre-process file id',msg.data);
                            File.findById(msg.data).exec(function(err,file){
                                if(err) {
                                    console.error(err);
                                    return sendError(err);
                                }
                                fs.mkdtemp(conf.get('tmp')+'initLayer',function(err,folder){
                                    if(err) {
                                        console.error(err);
                                        return sendError(err);
                                    }
                                    tmpFolder = folder;
                                    debug('created %s',folder);
                                    var tmpFileName = tmpFolder+path.sep+file.filename,
                                        writeStream = fs.createWriteStream(tmpFileName),
                                        readStream = file.getReadStream().pipe(writeStream);
                                    writeStream.on('error',sendError);
                                    writeStream.on('close',function(){
                                        sendInfo(util.format('Starting pre-processing of file %s (%s)',file.filename,file._id));
                                        preProcessor = PreProcessorFactory({
                                            filePath: tmpFileName,
                                            fork: conf.get('forkWorkers')
                                        });
                                        preProcessor.on('error',sendError)
                                                    .on('complete',function(preResults){
                                                        preResults._sourceFile = file._id;
                                                        moveClientTostate(STATES.USER_INPUT,preResults);
                                                    });
                                        moveClientTostate(STATES.PRE_PROCESS_RUNNING);
                                        preProcessor.start();
                                    });
                                });

                            });
                            break;
                    }
                    break;
                default:
                    debug('Unexpected message',msg);
                    break;
            }
        });
    });
    return container;
};
