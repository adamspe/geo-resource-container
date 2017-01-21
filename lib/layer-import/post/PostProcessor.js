
const EventEmitter = require('events');

class PostProcessor extends EventEmitter {
    constructor(input) {
        super();
        this.$input = input;
    }

    preResults() {
        return this.$input.preResults;
    }

    userInput() {
        return this.$input.userInput;
    }

    results(v) {
        if(!arguments.length) {
            return this.$results;
        }
        this.$results = v;
        return this;
    }

    start() {}
}

module.exports = PostProcessor;
