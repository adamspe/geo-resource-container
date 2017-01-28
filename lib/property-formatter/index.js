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
