angular.module('app-container-geo.admin',[
    'app-container-file',
    'ui.bootstrap'
])
.directive('propertyFormatValidate',['$log','$q','$parse','$window',function($log,$q,$parse,$window){
    return {
        require: 'ngModel',
        link: function($scope,$element,$attrs,$ctrl){
            var PropertyFormatter = $window.PropertyFormatter,
                exampleProperties = $parse($attrs.propertyFormatValidate)($scope);
            $log.debug('propertyFormatValidate.exampleProperties',exampleProperties);
            if(exampleProperties) {
                $ctrl.$asyncValidators['propertyFormat'] = function(modelValue,newValue) {
                    $log.debug('modelValue="'+modelValue+'" newValue="'+newValue+'"');
                    var def = $q.defer(),fmt;
                    if(newValue) {
                        try {
                            fmt = (new PropertyFormatter(newValue)).format(exampleProperties);
                            $log.debug('format string ok',fmt);
                            def.resolve(true);
                        } catch(err) {
                            $log.debug('format error',err);
                            def.reject();
                        }
                    } else {
                        def.reject(); // required so OK
                    }
                    return def.promise;
                };
            }
        }
    };
}])
.directive('layerNameValidate',['$log','$q','$timeout','Layer',function($log,$q,$timeout,Layer){
    return {
        require: 'ngModel',
        link: function($scope,$element,$attrs,$ctrl){
            var $t_promise;
            $ctrl.$asyncValidators['layerNameinUse'] = function(modelValue,newValue) {
                $log.debug('modelValue="'+modelValue+'" newValue="'+newValue+'"');
                if($t_promise) {
                    $timeout.cancel($t_promise);
                    $t_promise = undefined;
                }
                var def = $q.defer();
                if(newValue) {
                    // only fire after 1/2 sec to avoid lots of beating on
                    // the server
                    $t_promise = $timeout(function(){
                        Layer.query({
                            $filter: 'name eq \''+newValue+'\''
                        },function(layers){
                            if(layers.list.length === 0) {
                                def.resolve(true);
                            } else {
                                def.reject();
                            }
                        });
                    },500);
                } else {
                    def.reject(); // required so OK
                }
                return def.promise;
            };
        }
    };
}])
.directive('layerCreateInputForm',[function(){
    return {
        restrict: 'C',
        templateUrl: 'js/admin/layer-create-input-form.html'
    };
}])
.directive('exampleLayerProperties',[function(){
    return {
        restrict: 'AEC',
        template: '<h4>Example Feature Properties '+
        '<i uib-popover-template="\'js/admin/layer-create-eprops-popover.html\'" '+
        'popover-placement="auto bottom" '+
        'class="fa fa-info-circle" aria-hidden="true"></i>'+
        '</h4><table class="table table-striped table-condensed">'+
        '<tr><th>Property</th><th>Value</th><th>Type</th><th></th></tr>'+
        '<tr ng-repeat="(prop,pinfo) in preResults.examplePropertiesAnnotated">'+
        '<td>{{prop}}</td><td>{{pinfo.value}}</td><td>{{pinfo.type}}</td>'+
        '<td><i uib-tooltip="Unique" ng-if="pinfo.unique" class="fa fa-key" aria-hidden="true"></i></td>'+
        '</tr>'+
        '</table>'
    };
}])
.controller('LayerCreateCtrl',['$scope','$log','$timeout','$mdDialog','WebSocketConnection','File','NotificationService',function($scope,$log,$timeout,$mdDialog,WebSocketConnection,File,NotificationService) {
    var STATES = $scope.STATES = {
        HANDSHAKE: 'HANDSHAKE',
        FILE_UPLOAD: 'FILE_UPLOAD',
        PRE_PROCESS_RUNNING: 'PRE_PROCESS_RUNNING',
        USER_INPUT: 'USER_INPUT',
        POST_PROCESS_RUNNING: 'POST_PROCESS_RUNNING',
        COMPLETE: 'COMPLETE'
    },
    STATE,
    STATE_DATA;
    $scope.infoMessages = [];

    $scope.dismiss = function() {
        function goaway() {
            $mdDialog.cancel();
        }
        if($scope.uploadedFile) {
            // cleanup, they're dismissing
            $log.debug('dismiss, cleaning up',$scope.uploadedFile);
            $scope.uploadedFile.$remove({id: $scope.uploadedFile._id},goaway,NotificationService.addError);
        } else {
            goaway();
        }
    };

    var wsc = new WebSocketConnection('geo/initLayer',function(){
        $log.debug('connection to geo/initLayer established.');
        $scope.$on('$destroy',wsc.connectionCloser());
        wsc.onMessage(function(msg){
            $scope.$apply(function(){
                $log.debug('Message (current state:'+STATE+')',msg);
                switch(msg.key) {
                    case 'state':
                        STATE = $scope.STATE = STATES[msg.toState];
                        STATE_DATA = $scope.STATE_DATA = msg.data;
                        break;
                    case 'error':
                        $log.error(msg.data);
                        break;
                    case 'info':
                        $log.debug('info: ',msg.data);
                        /*
                        if($scope.infoMessages.length > 200) {
                            $scope.infoMessages = $scope.infoMessages.filter(function(m){
                                return m.cls === 'error';
                            }); // just hold onto errors
                        }*/
                        $scope.infoMessages.splice(0,0,{
                            cls: /^FAILED/.test(msg.data) || /^ERROR/.test(msg.data) ? 'error' : 'info',
                            text: msg.data
                        });
                        break;
                    case 'complete':
                        break;
                    default:
                        $log.error('unexpected message');
                        break;
                }
            });
        });
        $timeout(function(){
             STATE = $scope.STATE = STATES.HANDSHAKE;
        },1000);
    });

    $scope.$watch('STATE',function(state){
        if(state) {
            $log.debug('Entered state ',state);
            switch(state) {
                case STATES.HANDSHAKE:
                    wsc.send({key:'state',currentState: STATES.HANDSHAKE});
                    break;
                case STATES.USER_INPUT:
                    $scope.preResults = STATE_DATA;
                    $scope.userInput = {

                    };
                    break;
                case STATES.COMPLETE:
                    // layer added, don't cleanup the file when the modal is dismissed.
                    delete $scope.uploadedFile;
                    // update dismiss to use close so the caller knows things went swimmingly
                    $scope.dismiss = function() {
                        // TODO pass new layer back
                        $mdDialog.hide();
                    };
                    break;
            }
        }
    });

    $scope.fileResource = File;
    $scope.$watch('fileToUpload',function(file) {
        console.log('fileToUpload',file);
        if(file && file.file && file.$save) {
            file.metadata = {
                type: 'layerSource'
            };
            file.$save(function(f){
                $scope.uploadedFile = f;
                delete $scope.fileToUpload;
            });
        }
    });
    $scope.$watch('uploadedFile',function(file){
        if(file) {
            $log.debug('uploadedFile',file);
            if(file.contentType === 'application/zip' ||
               /\.ndjson$/.test(file.filename)) {
               $log.debug('Notifying server of new file, start pre-processing');
               wsc.send({key:'state',currentState:STATE,data:file._id});
           } else {
                $log.debug('Unacceptable file type, deleting.');
                NotificationService.addError({statusText: file.fileName+' is not a zip or ndjson file.'});
                file.$remove({id: file._id},function(){
                    $log.debug('removed '+file.fileName);
                    delete $scope.uploadedFile;
                },NotificationService.addError);
            }
        }
    });

    $scope.add = function() {
        wsc.send({key:'state',currentState:STATE,data:$scope.userInput});
    };

}])
.directive('mapLayerAdministration',['$log','$mdDialog','$typeAheadFinder','uiGmapGoogleMapApi','uiGmapIsReady','MapLayerService','NotificationService','Layer','DynamicMapLayer',function($log,$mdDialog,$typeAheadFinder,uiGmapGoogleMapApi,uiGmapIsReady,MapLayerService,NotificationService,Layer,DynamicMapLayer){
    return {
        restrict: 'E',
        templateUrl: 'js/admin/map-layer-administration.html',
        scope: {
            adminModeChange: '&'
        },
        link: function($scope) {
            $scope.selection = {};
            $scope.findLayer = $typeAheadFinder(Layer,function(s){
                return 'contains(name,\''+s+'\')';
            });
            uiGmapGoogleMapApi.then(function(google_maps){
                uiGmapIsReady.promise(1).then(function(instances){
                    var map = instances[0].map;
                    $log.debug('map-layer-administration: ready');
                    function reset(selectedLayerToo) {
                        if($scope.activeMapLayer) {
                            $scope.activeMapLayer.remove();
                        }
                        delete $scope.activeMapLayer;
                        delete $scope.displayedOfTotal;
                        if(selectedLayerToo) {
                            delete $scope.selection.layer;
                        }
                    }
                    function setLayer(layer){
                        reset();
                        if(layer) {
                            $scope.activeMapLayer = (new DynamicMapLayer($scope,layer))
                                .map(map)
                                .changeListener(function(dl){
                                    dl.totalFeatureCount().then(function(count){
                                        $scope.displayedOfTotal = dl.featureCount()+'/'+count;
                                        if(dl.featureCount() === dl.maxFeatures()) {
                                            $scope.limitToast = NotificationService.addError('Features limit reached '+$scope.displayedOfTotal+'.  Zoom in or pan to limit bounds.');
                                        } else if ($scope.limitToast) {
                                            NotificationService.hideToast();
                                            delete $scope.limitToast;
                                        }
                                    });
                                })
                                .add();
                        }
                    }
                    $scope.$watch('enabled',function(onOff){
                        $log.debug('map-layer-administration: '+(onOff ? 'on' : 'off'));
                        ($scope.adminModeChange||angular.noop)({mode: onOff});
                        reset(!onOff);
                    });
                    $scope.$watch('selection.layer',function(layer){
                        $log.debug('map-layer-administration: layer',layer);
                        setLayer(layer);
                    });
                    $scope.createLayer = function() {
                        $mdDialog.show({
                            templateUrl: 'js/admin/layer-create.html',
                            controller: 'LayerCreateCtrl',
                            fullscreen: true,
                            clickOutsideToClose: false,
                            escapeToClose: false
                        }).then(setLayer,angular.noop);
                    };
                    $scope.removeLayer = function(l,$event) {
                        $mdDialog.show($mdDialog.confirm()
                            .title('Are you sure you want to delete '+l.name+'?')
                            .textContent('This cannot be undone.')
                            .ariaLabel('Delete map layer')
                            .ok('Yes')
                            .cancel('No'))
                            .then(function(){
                                    reset(true);
                                    l.$remove({id: l._id},function(){
                                        NotificationService.addInfo('Removed '+l.name);
                                    },NotificationService.addError);
                                },angular.noop);
                    };
                });
            });
        }
    };
}]);
