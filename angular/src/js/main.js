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
.factory('MapLayerService',['$q','$http','$log','$compile','$timeout','MapLayer','Feature',function($q,$http,$log,$compile,$timeout,MapLayer,Feature) {
    return {
        getForPoint: function(lat,lng) {
            var def = $q.defer();
            Feature.get({id:'intersects',coordinates:[lng,lat].join(',')},function(response) {
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
        getForLayer: function(layer,q) {
            var def = $q.defer();
            // using the topojson relationship to get a simplified version of
            // the layer (smaller on the wire).  this doesn't solve the issue with
            // layers that have huge numbers of polygons TODO
            $http({
                method: 'GET',
                url: layer._links.topojson+'?q='+(q||'1e4')
            }).then(function(response){
                var topo = response.data,
                    geoJson = topojson.feature(topo,topo.objects.layer);
                def.resolve(new MapLayer(geoJson.features.map(function(f){
                    // need to make geojson features look like feature resource objects
                    var featureObj = angular.extend({},f.properties._featureProps);
                    delete f.properties._featureProps;
                    featureObj.data = f;
                    featureObj._layer = layer;
                    return featureObj;
                })));
            });
            return def.promise;
        },
        featureClickProperties: function($scope,map) {
            var info;
            return function(event) {
                $scope.$apply(function(){
                    $log.debug('feature click.');
                    $scope.$iwFeature = event.feature.getMapFeature();
                    var compiled = $compile('<property-feature-info-window feature="$iwFeature"></property-feature-info-window>')($scope);
                    if(!info) {
                        info = new google.maps.InfoWindow({
                            maxWidth: 750,
                            content: 'temporary',
                        });
                    }
                    $timeout(function(){
                        info.setContent(compiled.html());
                        info.setPosition(event.latLng);
                        info.open(map);
                    });
                });
            };
        },
        boundsToCoords: function(bounds) {
            var ne = bounds.getNorthEast(),
                sw = bounds.getSouthWest(),
                coords = [];
            function addLatLng(latLng) {
                coords.push(latLng.lng());
                coords.push(latLng.lat());
            }
            // sw, nw, ne, se
            addLatLng(sw);
            addLatLng(new google.maps.LatLng(ne.lat(),sw.lng()));
            addLatLng(ne);
            addLatLng(new google.maps.LatLng(sw.lat(),ne.lng()));
            $log.debug('boundsToCoords',bounds,coords);
            return coords;
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
            var start = Date.now();
            // sort features by size and set their zIndex so they are stacked with the largest on the bottom
            self.$mapFeatures.sort(function(a,b){
                return b.$area()-a.$area();
            });
            self.$mapFeatures.forEach(function(f,i) {
                var style = f.$feature.getProperty('$style');
                style.zIndex = i;
            });
            /*
            $log.debug('feature stacking order',self.$mapFeatures.reduce(function(arr,f){
                arr.push(f.layerName()+' : '+f.name());
                return arr;
            },[]).join(','));*/
            $log.debug('stacking order calculated in '+(Date.now()-start)+'ms');
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
}])
.factory('DynamicMapLayer',['$log','$http','$timeout','MapLayer','Feature',function($log,$http,$timeout,MapLayer,Feature){
    // the idea here is that this object will register itself to listen for
    // map bounds_changed and negotiate with the /geo/feature/featureBounds
    // service to add/remove features as necessary while the map is navigated
    var DynamicMapLayer = function($scope,layerResource) {
        MapLayer.call(this,[]);
        this.$scope = $scope;
        this.$layerResource = layerResource;
    };
    DynamicMapLayer.prototype = new MapLayer([]);

    DynamicMapLayer.prototype.map = (function(superFunc){
        return function(_) {
            var self = this;
            if(arguments.length) {
                superFunc.call(self,_);
                _.addListener('bounds_changed',function(){
                    self.boundsChanged();
                });
                self.boundsChanged();
                return self;
            } else {
                return superFunc.call(self);
            }
        };
    })(DynamicMapLayer.prototype.map);

    DynamicMapLayer.prototype.boundsChanged = function() {
        var self = this;
        if(self.$boundsTimer) {
            $timeout.cancel(self.$boundsTimer);
        }
        self.$boundsTimer = $timeout(function(){
            var map = self.map(),
                bounds = map.getBounds(),
                coords = DynamicMapLayer.boundsToCoords(bounds);
            self.$inHandBoundaries = self.$inHandBoundaries||[];
            $log.debug('DynamicMapLayer.bounds_changed',bounds,coords,self.$inHandBoundaries);
            // TODO negotiate with featureBounds
            $http.post(Feature.$basePath+'/featureBounds',self.$inHandBoundaries,{
                params: {
                    $filter: '_layer eq \''+self.$layerResource._id+'\'',
                    coordinates: coords.join(','),
                    q: 1e4
                }
            }).then(function(response){
                $log.debug('success',response);
                // TEMPORARY
                self.$inHandBoundaries = response.data.ids;
            },function(response){
                $log.debug('error',response);
            });
        },500);
    };

    DynamicMapLayer.boundsToCoords = function(bounds) {
        var ne = bounds.getNorthEast(),
            sw = bounds.getSouthWest(),
            nw = new google.maps.LatLng(ne.lat(),sw.lng()),
            se = new google.maps.LatLng(sw.lat(),ne.lng()),
            coords = [];
        function addLatLng(latLng) {
            coords.push(latLng.lng());
            coords.push(latLng.lat());
        }
        // nw,sw,se,ne,nw
        addLatLng(nw);
        addLatLng(sw);
        addLatLng(se);
        addLatLng(ne);
        addLatLng(nw); // close the loop
        $log.debug('boundsToCoords',bounds,coords);
        return coords;
    };

    return DynamicMapLayer;
}])
.directive('propertyFeatureInfoWindow',[function(){
    return {
        restrict: 'E',
        template: '<h3>{{f.name()}}</h3>'+
        '<ul class="list-unstyled">'+
        '<li ng-repeat="(key,value) in f.properties()"><label>{{key}}</label> {{value}}</li>'+
        '</ul>',
        scope: {
            f: '=feature'
        }
    };
}]);
