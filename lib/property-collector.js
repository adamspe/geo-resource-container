class PropertyCollector {
    collect(props) {
        var self = this;
        props = props||{};
        if(!self.$exampleProperties) {
            self.$exampleProperties = Object.keys(props).reduce(function(map,key){
                map[key] = {
                    value: props[key],
                    type: typeof(props[key]),
                    values: [props[key]],
                    unique: true
                };
                return map;
            },{});
            return;
        }
        var map = self.$exampleProperties;
        Object.keys(props).forEach(function(key) {
            if(!map[key]) { // wasn't in a previous feature
                map[key] = {
                    value: props[key],
                    type: 'mixed',
                    values: [props[key]],
                    unique: false
                };
            } else {
                if(!map[key].value && props[key]) {
                    map[key].value = props[key];
                    map[key].type = 'mixed';
                }
                if(map[key].type !== typeof(props[key])) {
                    map[key].type = 'mixed';
                }
                if(map[key].unique && map[key].values.indexOf(props[key]) !== -1) {
                    map[key].unique = false;
                }
                map[key].values.push(props[key]);
            }
        });
    }

    exampleProperties(annotated) {
        var props = this.$exampleProperties;
        return Object.keys(props).reduce(function(map,key){
            map[key] = annotated ? {
                    value: props[key].value,
                    type: props[key].type,
                    unique: props[key].unique
                } : props[key].value;
            return map;
        },{});
    }
}
module.exports = PropertyCollector;
