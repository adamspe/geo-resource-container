var AppContainer = require('app-container'),
    appModule = {
        init: function(container) {
            var resources = require('./api');
            container.addResource(resources.featuresResource)
                     .addResource(resources.layersResource);
            return require('./initLayer')(container);
        },
        container: function(initPipeline) {
            return appModule.init(new AppContainer().init(initPipeline));
        }
    };

module.exports = appModule;
