/*
 * app-container-geo
 * Version: 1.0.0 - 2017-01-31
 */

/*! sprintf-js | Alexandru Marasteanu <hello@alexei.ro> (http://alexei.ro/) | BSD-3-Clause */

!function(a){function b(){var a=arguments[0],c=b.cache;return c[a]&&c.hasOwnProperty(a)||(c[a]=b.parse(a)),b.format.call(null,c[a],arguments)}function c(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()}function d(a,b){return Array(b+1).join(a)}var e={not_string:/[^s]/,number:/[diefg]/,json:/[j]/,not_json:/[^j]/,text:/^[^\x25]+/,modulo:/^\x25{2}/,placeholder:/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,key:/^([a-z_][a-z_\d]*)/i,key_access:/^\.([a-z_][a-z_\d]*)/i,index_access:/^\[(\d+)\]/,sign:/^[\+\-]/};b.format=function(a,f){var g,h,i,j,k,l,m,n=1,o=a.length,p="",q=[],r=!0,s="";for(h=0;o>h;h++)if(p=c(a[h]),"string"===p)q[q.length]=a[h];else if("array"===p){if(j=a[h],j[2])for(g=f[n],i=0;i<j[2].length;i++){if(!g.hasOwnProperty(j[2][i]))throw new Error(b("[sprintf] property '%s' does not exist",j[2][i]));g=g[j[2][i]]}else g=j[1]?f[j[1]]:f[n++];if("function"==c(g)&&(g=g()),e.not_string.test(j[8])&&e.not_json.test(j[8])&&"number"!=c(g)&&isNaN(g))throw new TypeError(b("[sprintf] expecting number but found %s",c(g)));switch(e.number.test(j[8])&&(r=g>=0),j[8]){case"b":g=g.toString(2);break;case"c":g=String.fromCharCode(g);break;case"d":case"i":g=parseInt(g,10);break;case"j":g=JSON.stringify(g,null,j[6]?parseInt(j[6]):0);break;case"e":g=j[7]?g.toExponential(j[7]):g.toExponential();break;case"f":g=j[7]?parseFloat(g).toFixed(j[7]):parseFloat(g);break;case"g":g=j[7]?parseFloat(g).toPrecision(j[7]):parseFloat(g);break;case"o":g=g.toString(8);break;case"s":g=(g=String(g))&&j[7]?g.substring(0,j[7]):g;break;case"u":g>>>=0;break;case"x":g=g.toString(16);break;case"X":g=g.toString(16).toUpperCase()}e.json.test(j[8])?q[q.length]=g:(!e.number.test(j[8])||r&&!j[3]?s="":(s=r?"+":"-",g=g.toString().replace(e.sign,"")),l=j[4]?"0"===j[4]?"0":j[4].charAt(1):" ",m=j[6]-(s+g).length,k=j[6]&&m>0?d(l,m):"",q[q.length]=j[5]?s+g+k:"0"===l?s+k+g:k+s+g)}return q.join("")},b.cache={},b.parse=function(a){for(var b=a,c=[],d=[],f=0;b;){if(null!==(c=e.text.exec(b)))d[d.length]=c[0];else if(null!==(c=e.modulo.exec(b)))d[d.length]="%";else{if(null===(c=e.placeholder.exec(b)))throw new SyntaxError("[sprintf] unexpected placeholder");if(c[2]){f|=1;var g=[],h=c[2],i=[];if(null===(i=e.key.exec(h)))throw new SyntaxError("[sprintf] failed to parse named argument key");for(g[g.length]=i[1];""!==(h=h.substring(i[0].length));)if(null!==(i=e.key_access.exec(h)))g[g.length]=i[1];else{if(null===(i=e.index_access.exec(h)))throw new SyntaxError("[sprintf] failed to parse named argument key");g[g.length]=i[1]}c[2]=g}else f|=2;if(3===f)throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");d[d.length]=c}b=b.substring(c[0].length)}return d};var f=function(a,c,d){return d=(c||[]).slice(0),d.splice(0,0,a),b.apply(null,d)};"undefined"!=typeof exports?(exports.sprintf=b,exports.vsprintf=f):(a.sprintf=b,a.vsprintf=f,"function"==typeof define&&define.amd&&define(function(){return{sprintf:b,vsprintf:f}}))}("undefined"==typeof window?this:window);
//# sourceMappingURL=sprintf.min.map
(function(window){
    function PropertyFormatter(input) {
        //"%s[: %s]", A, B
        var parts = input.split(',').map(function(s){return s.trim();}),
            fmt = parts[0],
            keys = parts.slice(1),
            re = /(\[*?[^%]*?%[a-z0-9\.]+[^%]*?\]?)/g,
            reOut,
            fmts = [];
        debug('fmt "%s"',fmt);
        debug('keys = %s',keys);
        var nextLast;
        while((reOut = re.exec(fmt)) !== null) {
            debug('%j',reOut);
            fmts.push(reOut[1]);
            nextLast = re.lastIndex;
        }
        debug('%d,%d',fmt.length,nextLast);
        if(fmt.length > nextLast) {
            // last match excluded some text on the end of the string, append that to the last fmt
            fmts[fmts.length-1] += fmt.substring(nextLast);
        }
        fmts = fmts.map(function(p){
            return /^\[.*\]$/.test(p) ? {
                fmt: p.slice(1,p.length-1),
                opt: true,
            } : {
                fmt: p
            };
        });
        fmts.forEach(function(p,i){debug('[%d] = "%j"',i,p);});
        if(fmts.length !== keys.length) {
            throw new Error('format to key length mismatch');
        }
        this.$keys = keys;
        this.$fmts = fmts;
    }

    PropertyFormatter.prototype.format = function(properties) {
        var keys = this.$keys,
            fmts = this.$fmts,
            fmt = keys.reduce(function(f,key,i){
                var v = properties[key],
                    nov = v === null || typeof(v) === 'undefined',
                    fmt = fmts[i];
                if(nov && !fmt.opt) {
                    throw new Error('missing required key '+key);
                }
                if(!nov) {
                    f.fmt += fmt.fmt;
                    f.args.push(v);
                }
                return f;
            },{
                fmt: '',
                args: []
            });
        debug('%j',fmt);
        return formatter.apply(null,[fmt.fmt].concat(fmt.args));
    };

    var debug,formatter;
    if(typeof(module) !== 'undefined' && module.exports) {
        module.exports = PropertyFormatter;
        debug = require('debug')('property-formatter');
        formatter = require('sprintf-js').sprintf;
    } else if(typeof(window) !== 'undefined'){
        window.PropertyFormatter = PropertyFormatter;
        debug = function(){};
        formatter = window.sprintf; // must be included by browser client
    }
})(typeof(window) === 'undefined' ? this : window);

angular.module('app-container-geo.admin',[
    'app-container-file'
])
.directive('propertyFormatValidate',['$log','$q','$parse','$window',function($log,$q,$parse,$window){
    return {
        require: 'ngModel',
        link: function($scope,$element,$attrs,$ctrl){
            var PropertyFormatter = $window.PropertyFormatter,
                exampleProperties = $parse($attrs.propertyFormatValidate)($scope);
            $log.debug('propertyFormatValidate.exampleProperties',exampleProperties);
            if(exampleProperties) {
                $ctrl.$asyncValidators[$attrs.ngModel.replace('.','_')+'_propertyFormat'] = function(modelValue,newValue) {
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
.controller('LayerCreateCtrl',['$scope','$log','$timeout','$uibModalInstance','WebSocketConnection','File','NotificationService',function($scope,$log,$timeout,$uibModalInstance,WebSocketConnection,File,NotificationService) {
    var STATES = $scope.STATES = {
        HANDSHAKE: 'HANDSHAKE',
        FILE_UPLOAD: 'FILE_UPLOAD',
        PRE_PROCESS_RUNNING: 'PRE_PROCESS_RUNNING',
        USER_INPUT: 'USER_INPUT',
        COMPLETE: 'COMPLETE'
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
                    $scope.userInput = {

                    };
                    break;
                case STATES.COMPLETE:
                    $timeout(function(){
                        $uibModalInstance.close();
                    },2000);
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

    $scope.add = function() {
        wsc.send({key:'state',currentState:STATE,data:$scope.userInput});
    };

}])
.directive('layerAdmin',['$log','Layer','NotificationService','DialogService','$uibModal','PaneStateService',function($log,Layer,NotificationService,DialogService,$uibModal,PaneStateService){
    return {
        restrict: 'E',
        templateUrl: 'js/admin/layer-admin.html',
        scope: {},
        link: function($scope,$element,$attrs) {
            $scope.isPaneActive = PaneStateService.isActive;
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
            $scope.removeLayer = function(l) {
                DialogService.confirm({
                    question: 'Are you sure you want to delete '+l.name+'?',
                    warning: 'This cannot be undone.'
                }).then(function(){
                    l.$remove({id: l._id},function(){
                        NotificationService.addInfo('Removed '+l.name);
                        listLayers();
                    },NotificationService.addError);
                });
            };
        }
    };
}])
.directive('layerAdminMap',['$log','uiGmapGoogleMapApi','uiGmapIsReady','MapLayerService',function($log,uiGmapGoogleMapApi,uiGmapIsReady,MapLayerService){
    return {
        restrict: 'C',
        template:'<ui-gmap-google-map ng-if="map" center="map.center" zoom="map.zoom" options="map.options" events="map.events">'+
        '<ui-gmap-marker ng-if="marker" coords="marker.coords" options="marker.options" events="marker.events" idkey="marker.id"></ui-gmap-marker>'+
        '</ui-gmap-google-map>',
        scope: {
            layer: '='
        },
        link: function($scope,$elm,$attrs) {
            uiGmapGoogleMapApi.then(function(google_maps){
                $scope.map = {
                    center: { latitude: 41.135760, longitude: -99.157679 },
                    zoom: 4,
                    options: {
                        scrollwheel: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        mapTypeId: google_maps.MapTypeId.HYBRID,
                        panControl: false,
                        zoomControl: true,
                        disableDoubleClickZoom: true,
                        zoomControlOptions: {
                            style: google_maps.ZoomControlStyle.SMALL,
                            position: google_maps.ControlPosition.RIGHT_TOP
                        }
                    }/*,
                    events : {
                        dblclick: function(map,eventName,args) {
                            var latLng = args[0].latLng,
                                lat = latLng.lat(),
                                lng = latLng.lng(),i;
                            $log.debug('dblclick:['+lat+','+lng+']');
                            if($scope.currentMapLayer) {
                                $scope.currentMapLayer.remove();
                            }
                            delete $scope.currentMapLayer;
                            delete $scope.currentFeatures;
                            $scope.marker = {
                                id: markerIndex++,
                                coords: {
                                    latitude: lat,
                                    longitude: lng
                                },
                                events: {
                                    'click': function() {
                                        $log.debug('marker click');
                                        //DialogService.buildConservationPlan($scope.currentMapLayer);
                                    }
                                }
                            };
                            $scope.featureProperties = [];
                            MapLayerService.getForPoint(lat,lng).then(layerSetter(map));
                        }
                    }*/
                };
                // ISSUE #1 : the 2 below is unfortunate.  for some reason that, after
                // a great deal of debugging, i was unable to determine this directive
                // gets loaded twice when its pane is opened, this means that the
                // underlying code believes there should be two maps (presumably the
                // first is discarded).
                // this MUST be fixed because the result is two promises get fired
                // and as a result the layer contents are fetched from the server
                // twice...
                // ISSUE #2 : each pane only works the first time it is opened, not the
                // second...
                uiGmapIsReady.promise(2).then(function(instances){
                    var map = instances[1].map;
                    map.data.addListener('mouseover',function(event){
                        map.data.overrideStyle(event.feature, {strokeWeight: 3});
                    });
                    map.data.addListener('mouseout',function(event) {
                        map.data.revertStyle();
                    });
                    map.data.addListener('click',function(event) {
                        $scope.$apply(function(){
                            $log.debug('feature click.');
                        });
                    });
                    // kick the map so that it draws properly
                    google_maps.event.trigger(map, 'resize');
                    MapLayerService.getForLayer($scope.layer).then(function(mapLayer){
                        mapLayer.map(map).add();
                    });
                    /*
                    var fid = InitMapService.getInitFeatureId();
                    if(fid) {
                        MapLayerService.getForFeature(fid).then(layerSetter(map));
                    }*/
                });
            });
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
        },
        getForLayer: function(layerOrId) {
            var def = $q.defer(),
                id = typeof(layerOrId) === 'string' ?
                    layerOrId : (layerOrId && layerOrId._id ? layerOrId._id : undefined);
            if(!id) {
                def.reject('bad layerOrId');
            } else {
                // TODO - how many?
                // write special service that will load all features within a layer
                // translate that into topojson and have the client turn it back into GeoJson
                Feature.query({$filter: '_layer eq \''+id+'\'',$top: 5000},function(response){
                    def.resolve(new MapLayer(response.list));
                });
            }
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

angular.module('templates-app-container-geo', ['js/admin/layer-admin.html', 'js/admin/layer-create-eprops-popover.html', 'js/admin/layer-create-idfmt-popover.html', 'js/admin/layer-create-input-form.html', 'js/admin/layer-create-lname-popover.html', 'js/admin/layer-create-lsource-popover.html', 'js/admin/layer-create-nmfmt-popover.html', 'js/admin/layer-create.html']);

angular.module("js/admin/layer-admin.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-admin.html",
    "<pane-set unique-id=\"layer-admin\" open-heading-cols=\"4\">\n" +
    "    <pane-set-header>\n" +
    "        <div class=\"pane-set-title\" title=\"Layer Administration\"></div>\n" +
    "    </pane-set-header>\n" +
    "    <pane-set-footer>\n" +
    "        <button class=\"btn btn-default pull-right\" ng-click=\"createLayer()\">New Layer</button>\n" +
    "    </pane-set-footer>\n" +
    "\n" +
    "    <pane ng-repeat=\"l in layers.list\" unique-id=\"pane-{{l._id}}\">\n" +
    "        <pane-heading>\n" +
    "            <h4>{{l.name}}</h4>\n" +
    "            <div class=\"file-info\" file=\"l._sourceFile\"></div>\n" +
    "            <a href ng-click=\"removeLayer(l)\">Remove layer</a>\n" +
    "        </pane-heading>\n" +
    "        <div ng-if=\"isPaneActive('pane-'+l._id)\">\n" +
    "            <div class=\"layer-admin-map\" layer=\"l\" />\n" +
    "        </div>\n" +
    "    </pane>\n" +
    "</pane-set>\n" +
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

angular.module("js/admin/layer-create-idfmt-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-idfmt-popover.html",
    "<div>\n" +
    "    <p>Each feature added to the system must have an id that identifies it uniquely\n" +
    "        within its layer.</p>\n" +
    "    <p>If this layer is updated in the future (e.g. boundaries re-defined) it may be\n" +
    "        desireable to allow the feature data to be updated in place rather than\n" +
    "        recreated.  For example if other entities are to be associated with a given feature\n" +
    "        to prevent data integrity problems.</p>\n" +
    "    <p>The property format syntax is basic <code>sprintf</code> format without\n" +
    "        surrounding <code>&quot;</code> characters.  Unlike standard <code>sprintf</code>\n" +
    "        you can wrap optional properties in <code>[]</code>.</p>\n" +
    "    <p><em>Example:</em> If your features had a unique property, <code>GEOID</code> that\n" +
    "        is guaranteed to remain constant moving forward you could specify a format\n" +
    "        like <code>%s,GEOID</code>.</p>\n" +
    "    <p><em>Example:</em> If your features had two properties then when put together\n" +
    "        would guarantee uniqueness, and remain constant moving forward, you could\n" +
    "        specify a format like <code>%s.%s,MAINID,SUBID</code>.</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/admin/layer-create-input-form.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-input-form.html",
    "<form name=\"newLayerForm\" ng-if=\"userInput && preResults\">\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputFile\">Source File</label>\n" +
    "        <div id=\"inputFile\" class=\"file-info\" file=\"uploadedFile\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <div class=\"text-danger pull-right\" ng-if=\"newLayerForm.$error.layerNameinUse.length\">\n" +
    "            The layer name &quot;{{newLayerForm.$error.layerNameinUse[0].$viewValue}}&quot; is already in use.\n" +
    "        </div>\n" +
    "        <label for=\"layerName\">Layer Name <i uib-popover-template=\"'js/admin/layer-create-lname-popover.html'\" popover-placement=\"auto right\" class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> *</label>\n" +
    "        <input id=\"layerName\" type=\"text\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.layerName\" layer-name-validate required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <div class=\"text-danger pull-right\" ng-if=\"newLayerForm.$error.userInput_featureIdFmt_propertyFormat.length\">\n" +
    "            Invalid format\n" +
    "        </div>\n" +
    "        <label for=\"featureIdFmt\">Feature Id Format <i uib-popover-template=\"'js/admin/layer-create-idfmt-popover.html'\" popover-placement=\"auto right\" class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> *</label>\n" +
    "        <input id=\"featureIdFmt\" type=\"text\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.featureIdFmt\"\n" +
    "               property-format-validate=\"preResults.exampleProperties\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <div class=\"text-danger pull-right\" ng-if=\"newLayerForm.$error.userInput_featureNameFmt_propertyFormat.length\">\n" +
    "            Invalid format\n" +
    "        </div>\n" +
    "        <label for=\"featureNameFmt\">Feature Name Format <i uib-popover-template=\"'js/admin/layer-create-nmfmt-popover.html'\" popover-placement=\"auto right\" class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> *</label>\n" +
    "        <input id=\"featureNameFmt\" type=\"text\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.featureNameFmt\"\n" +
    "               property-format-validate=\"preResults.exampleProperties\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"layerSource\">Layer Source <i uib-popover-template=\"'js/admin/layer-create-lsource-popover.html'\" popover-placement=\"auto right\" class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> </label>\n" +
    "        <input id=\"layerSource\" type=\"url\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.layerSource\" />\n" +
    "    </div>\n" +
    "    <ul class=\"list-inline pull-right\">\n" +
    "        <li><button class=\"btn btn-default\" ng-click=\"dismiss()\">Cancel</button></li>\n" +
    "        <li><button class=\"btn btn-default\" ng-click=\"add()\" ng-disabled=\"newLayerForm.$invalid\">Create</button></li>\n" +
    "    </ul>\n" +
    "</form>\n" +
    "");
}]);

angular.module("js/admin/layer-create-lname-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-lname-popover.html",
    "<div>\n" +
    "    Specify your layer name here.  Your layer name must be unique within the system.\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/admin/layer-create-lsource-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-lsource-popover.html",
    "<div>\n" +
    "    <p>It may be useful to keep track of where the source of this layer originated.\n" +
    "    If you downloaded the data from a web address you can record that here.</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/admin/layer-create-nmfmt-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-nmfmt-popover.html",
    "<div>\n" +
    "    <p>Each feature added to the system should have a friendly name to identify it.\n" +
    "        Feature names are generated from each feature's properties.</p>\n" +
    "    <p>The property format syntax is basic <code>sprintf</code> format without\n" +
    "        surrounding <code>&quot;</code> characters.  Unlike standard <code>sprintf</code>\n" +
    "        you can wrap optional properties in <code>[]</code>.</p>\n" +
    "    <p><em>Example:</em> If your features had a unique property, <code>UNITNAME</code> that\n" +
    "        is guaranteed to remain constant moving forward you could specify a format\n" +
    "        like <code>%s,UNITNAME</code>.</p>\n" +
    "    <p><em>Example:</em> If your features had two properties then when put together\n" +
    "        would create a more meaningful feature name, but one of the two properties\n" +
    "        is not always available (not unique, type <code>mixed</code>), you might\n" +
    "        specify a format like <code>%s[ (%s)],UNITNAME,SUBUNITNAME</code>.</p>\n" +
    "</div>\n" +
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
    "    <h2>Add Layer</h2>\n" +
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
    "        <p>Your new layer will have <mark>{{preResults.featureCount}}</mark> features (assuming they can all\n" +
    "            be successfully indexed).</p>\n" +
    "        <div class=\"layer-create-input-form clearfix\"></div>\n" +
    "        <div class=\"example-layer-properties\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"STATE === STATES.COMPLETE && userInput\">\n" +
    "        Layer {{userInput.layerName}} added.\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
