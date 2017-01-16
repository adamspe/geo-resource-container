var AppContainer = require('app-container'),
    appModule = {
        init: function(container) {
            var resources = require('./api');
            return container.addResource(resources.featuresResource).addResource(resources.layersResource);
        },
        container: function(initPipeline) {
            return appModule.init(new AppContainer().init(initPipeline));
        }
    };

module.exports = appModule;
