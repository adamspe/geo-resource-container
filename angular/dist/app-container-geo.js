/*
 * app-container-geo
 * Version: 1.0.0 - 2017-01-28
 */

angular.module('app-container-geo.admin',[
    'app-container-file'
])
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
.controller('LayerCreateCtrl',['$scope','$log','$timeout','$uibModalInstance','WebSocketConnection','File','NotificationService',function($scope,$log,$timeout,$uibModalInstance,WebSocketConnection,File,NotificationService) {
    var STATES = $scope.STATES = {
        HANDSHAKE: 'HANDSHAKE',
        FILE_UPLOAD: 'FILE_UPLOAD',
        PRE_PROCESS_RUNNING: 'PRE_PROCESS_RUNNING',
        USER_INPUT: 'USER_INPUT'
    },
    STATE,
    STATE_DATA;
    $scope.infoMessages = [];

    $scope.dismiss = function() {
        function goaway() {
            $uibModalInstance.dismiss();
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
                        $scope.infoMessages.push(msg.data);
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
            if(file.contentType !== 'application/zip') {
                $log.debug('File is not a zip, deleting.');
                NotificationService.addError({statusText: file.fileName+' is not a zip file.'});
                file.$remove({id: file._id},function(){
                    $log.debug('removed '+file.fileName);
                    delete $scope.uploadedFile;
                },NotificationService.addError);
            } else {
                $log.debug('Notifying server of new file, start pre-processing');
                wsc.send({key:'state',currentState:STATE,data:file._id});
            }
        }
    });

}])
.directive('layerAdmin',['$log','Layer','NotificationService','$uibModal',function($log,Layer,NotificationService,$uibModal){
    return {
        restrict: 'E',
        templateUrl: 'js/admin/layer-admin.html',
        scope: {},
        link: function($scope,$element,$attrs) {
            function listLayers() {
                $scope.layers = Layer.query({});
            }
            listLayers();

            $scope.createLayer = function() {
                $uibModal.open({
                    templateUrl: 'js/admin/layer-create.html',
                    controller: 'LayerCreateCtrl',
                    windowClass: 'layer-create',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                }).result.then(function(){
                    $log.debug('layer creation dialog ok');
                    listLayers();
                });
            };
        }
    };
}]);

angular.module('app-container-geo',[
    'app-container-common',
    'templates-app-container-geo',
    'app-container-geo.admin'
])
.service('Layer',['$appService',function($appService) {
    var Layer = $appService('geo/layer/:id');
    return Layer;
}])
.service('Feature',['$appService',function($appService) {
    var Feature = $appService('geo/feature/:id');
    return Feature;
}])
.factory('MapLayerService',['$q','MapLayer','Feature',function($q,MapLayer,Feature) {
    return {
        getForPoint: function(lat,lng) {
            var def = $q.defer();
            Feature.get({id:'containingPoint',lat:lat,lon:lng},function(response) {
                def.resolve(new MapLayer(response.list));
            });
            return def.promise;
        },
        getForFeature: function(id) {
            var def = $q.defer();
            Feature.get({id: id},function(feature){
                def.resolve(new MapLayer([feature]));
            });
            return def.promise;
        }
    };
}])
.factory('MapLayer',['$log','Layer','Feature',function($log,Layer,Feature) {
    var COLOR_SCALE = d3.scaleOrdinal(d3.schemeCategory20),
        BASE_STYLE = {
            strokeColor: '#ffffff',
            strokeOpacity: null,
            strokeWeight: 1,
            fillColor: '#aaaaaa',
            fillOpacity: null,
            zIndex: 0,
            clickable: true
        },
        MapFeature = function(feature,layer) {
            this.$feature = feature;
            this.$layer = layer;
            this.$isOn = true;
            var self = this,
                props = this.$properties = {};
            feature.forEachProperty(function(value,name){
                props[name] = value;
            });
            feature.getMapFeature = function() {
                return self;
            };
        },
        MapLayer = function(features) {
            (this.$features = (features||[])).forEach(function(f){
                var props = f.data.properties;
                // unfortunately when google translates geoJson features into
                // objects it discards properties that are objects
                props.$featureName = f.featureName;
                props.$layerName = f._layer.name;
                props.$layerId = f._layer._id;
                props.$featureId = f._id;
            });
        };
    MapFeature.prototype.getBounds = function() {
        if(!this.$bounds) {
            var bounds = this.$bounds = new google.maps.LatLngBounds(),
                geo = this.$feature.getGeometry(),
                type = geo.getType();
            /*if(!type || /LineString/.test(type)) {
                // TODO ? generate bounds of a [Multi]LineString?
            } else {*/
            if(type && /Polygon/.test(type)) {
                var arr = geo.getArray(),
                    rings = type === 'Polygon' ?
                        arr :
                        arr.reduce(function(c,p){
                            c.push(p.getArray()[0]);
                            return c;
                        },[]),i,j;
                for(i = 0; i < rings.length; i++) {
                    var ringArr = rings[i].getArray();
                    for(j = 0; j < ringArr.length; j++) {
                        bounds.extend(new google.maps.LatLng(ringArr[j].lat(),ringArr[j].lng()));
                    }
                }
            }
        }
        return this.$bounds;
    };
    // this is not truly "area" but sufficient for comparing the size of
    // different feature's bounding boxes
    MapFeature.prototype.$area = function() {
        var bounds = this.getBounds(),
            ne = bounds.getNorthEast(),
            sw = bounds.getSouthWest();
        return Math.abs(ne.lat() - sw.lat()) * Math.abs(ne.lng() - sw.lng());
    };
    MapFeature.prototype.fit = function() {
        this.$layer.map().fitBounds(this.getBounds());
    };
    MapFeature.prototype.on = function() {
        if(!this.$isOn) {
            this.$layer.map().data.add(this.$feature);
            this.$isOn = true;
        }
    };
    MapFeature.prototype.off = function() {
        if(this.$isOn){
            this.$layer.map().data.remove(this.$feature);
            this.$isOn = false;
        }
    };
    MapFeature.prototype.isOn = function() {
        return this.$isOn;
    };
    MapFeature.prototype.toggle = function() {
        this[this.isOn() ? 'off' : 'on']();
        return this.isOn();
    };
    MapFeature.prototype.properties = function() {
        return this.$properties;
    };
    MapFeature.prototype.name = function() {
        return this.$properties.$featureName;
    };
    MapFeature.prototype.id = function() {
        return this.$properties.$featureId;
    };
    MapFeature.prototype.layerId = function() {
        return this.$properties.$layerId;
    };
    MapFeature.prototype.layerName = function() {
        return this.$properties.$layerName;
    };
    MapFeature.prototype.getFeatureResource = function() {
        var self = this;
        if(!self.$featureResource) {
            self.$featureResource = Feature.get({id: self.id()});
            self.$featureResource.$promise.then(function(feature){
                feature.getMapFeature = function() {
                    return self;
                };
            });
        }
        return self.$featureResource.$promise;
    };
    MapFeature.prototype.getLayerResource = function() {
        var self = this;
        if(!self.$layerResource) {
            self.$layerResource = Layer.get({id: self.layerId()});
            self.$layerResource.$promise.then(function(layer){
                layer.getMapFeature = function() {
                    return self;
                };
            });
        }
        return self.$layerResource.$promise;
    };

    MapLayer.prototype.map = function(_) {
        if(!arguments.length) {
            return this.$map;
        }
        this.$map = _;
        return this;
    };
    MapLayer.prototype.geoJson = function() {
        return {
            type: 'FeatureCollection',
            features: this.$features.map(function(feature){
                return feature.data;
            })
        };
    };
    MapLayer.prototype.add = function() {
        var self = this,
            map = self.map(),
            geoFeatures;
        if(map && !self.$mapFeatures) {
            geoFeatures = map.data.addGeoJson(self.geoJson());
            self.$mapFeatures = geoFeatures.map(function(f,i){
                f.setProperty('$style',angular.extend({},BASE_STYLE,{fillColor: COLOR_SCALE(i)}));
                return new MapFeature(f,self);
            });
            // sort features by size and set their zIndex so they are stacked with the largest on the bottom
            self.$mapFeatures.sort(function(a,b){
                return b.$area()-a.$area();
            });
            self.$mapFeatures.forEach(function(f,i) {
                var style = f.$feature.getProperty('$style');
                style.zIndex = i;
            });
            $log.debug('feature stacking order',self.$mapFeatures.reduce(function(arr,f){
                arr.push(f.layerName()+' : '+f.name());
                return arr;
            },[]).join(','));
            map.data.setStyle(function(f){
                return f.getProperty('$style');
            });
        }
        return self;
    };
    MapLayer.prototype.fit = function() {
        // features are already ordered by size, largest at the bottom
        // fit the first feature
        if(this.$mapFeatures && this.$mapFeatures.length) {
            this.$mapFeatures[0].fit();
        }
        return this;
    };
    MapLayer.prototype.features = function() {
        return (this.$mapFeatures||[]);
    };
    MapLayer.prototype.remove = function() {
        this.features().forEach(function(f){
            f.off();
        });
        return this;
    };
    return MapLayer;
}]);

angular.module('templates-app-container-geo', ['js/admin/layer-admin.html', 'js/admin/layer-create-eprops-popover.html', 'js/admin/layer-create-input-form.html', 'js/admin/layer-create.html']);

angular.module("js/admin/layer-admin.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-admin.html",
    "<h1>Layer Administration</h1>\n" +
    "<button class=\"btn btn-default\" ng-click=\"createLayer()\">New Layer</button>\n" +
    "<ul>\n" +
    "    <li ng-repeat=\"l in layers.list\">\n" +
    "        <label>{{l.name}}</label>\n" +
    "        {{l._sourceFile.filename}}\n" +
    "    </li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("js/admin/layer-create-eprops-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-eprops-popover.html",
    "<div>\n" +
    "    <p>The properties below represent the superset of all available properties\n" +
    "        across all features within your new layer.  Displayed values are pulled\n" +
    "        from first feature to have the given property set.</p>\n" +
    "\n" +
    "    <p>Properties flagged with the <i class=\"fa fa-key\" aria-hidden=\"true\"></i>\n" +
    "        icon have values that are unique across all features within your new layer.</p>\n" +
    "\n" +
    "    <p>If a property has an explicit type (e.g. <code>string</code>,<code>number</code>\n" +
    "        or <code>boolean</code>) then this indicates the property is available\n" +
    "        on all features and has a consistent type across them.</p>\n" +
    "\n" +
    "    <p>A property type of <code>mixed</code> almost certainly indicates that\n" +
    "        property in question is either unset or is <code>null</code>\n" +
    "        for some features.</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/admin/layer-create-input-form.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-input-form.html",
    "<form>\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputFile\">Source File</label>\n" +
    "        <div id=\"inputFile\" class=\"file-info\" file=\"uploadedFile\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"layerName\">Layer Name *</label>\n" +
    "        <input id=\"layerName\" type=\"text\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.layerName\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"featureIdFmt\">Feature Id Format *</label>\n" +
    "        <input id=\"featureIdFmt\" type=\"text\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.featureIdFmt\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"featureNameFmt\">Feature Id Format *</label>\n" +
    "        <input id=\"featureNameFmt\" type=\"text\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.featureNameFmt\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"layerSource\">Layer Source</label>\n" +
    "        <input id=\"layerSource\" type=\"url\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.layerSource\" />\n" +
    "    </div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("js/admin/layer-create.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create.html",
    "<div class=\"clearfix modal-header\">\n" +
    "    <ul class=\"list-inline pull-right\">\n" +
    "        <li class=\"spinner\" is-working=\"!STATE || [STATE.FILE_UPLOAD,STATE.USER_INPUT].indexOf(STATE) !== -1\"></li>\n" +
    "        <li><a href class=\"pull-right\" ng-click=\"dismiss()\"><i class=\"fa fa-times-circle-o fa-2x\"></i></a></li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <h2>Create Layer</h2>\n" +
    "</div>\n" +
    "<div class=\"clearfix modal-body\">\n" +
    "    <p ng-if=\"!STATE\">Waiting to establish connection...</p>\n" +
    "\n" +
    "    <div ng-show=\"STATE === STATES.FILE_UPLOAD\">\n" +
    "        <p>Start by uploading the source of your layer (currently only zipped shapfile).</p>\n" +
    "        <input type=\"file\" file-model=\"fileToUpload\" file-resource=\"fileResource\" />\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-show=\"STATE === STATES.USER_INPUT\">\n" +
    "        <div class=\"example-layer-properties\"></div>\n" +
    "        <p>Your new layer will have <mark>{{preResults.featureCount}}</mark> features (assuming they can all\n" +
    "            be successfully indexed).</p>\n" +
    "        <div class=\"layer-create-input-form\"></div>\n" +
    "        <pre>{{preResults | json}}</pre>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
