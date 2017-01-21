var Importer = require('./Importer'),
    ImporterRunnerMonitor = require('./ImporterRunnerMonitor');

module.exports = function(input) {
    return input.fork ? new ImporterRunnerMonitor(input) : new Importer(input);
};
