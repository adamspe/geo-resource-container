var should = require('should'),
    _ = require('lodash'),
    PropertyFormatter = require('../lib/property-formatter');

describe('Property Formatter',function(){
    it('basic',function(done){
        var pf = new PropertyFormatter('%s[: %s],A,B');
        pf.format({
            A: 'foo',
            B: 'bar'
        }).should.equal('foo: bar');
        pf.format({
            A: 'foo'
        }).should.equal('foo');
        done();
    });

    it('number',function(done) {
        (new PropertyFormatter('%s: %d,a,b')).format({
            a: 'foo',
            b: 10
        }).should.equal('foo: 10');
        done();
    });

    it('null',function(done){
        var pf = new PropertyFormatter('%s[: %s],A,B');
        var v = pf.format({
            A: 'foo',
            B: null
        }).should.equal('foo');
        done();
    });

    it('non greedy',function(done){
        (new PropertyFormatter('%s (%s),A,B')).format({
            A: 'foo',
            B: 'bar'
        }).should.equal('foo (bar)');
        done();
    });

    it('negative: fmt mismatch',function(done) {
        try {
            var p = new PropertyFormatter('%s[: %s][: %s],a,b');
            should.fail('expected error on mis-match');
        } catch(error) {
            done();
        }
    });

    it('negative: missing required',function(done) {
        try {
            var p = new PropertyFormatter('%s[: %s],a,b');
            p.format({
                a: 'foo',
                b: 'bar'
            }).should.equal('foo: bar');
            p.format({
                b: 'bar'
            });
            should.fail('expected error on missing required key');
        } catch(error) {
            done();
        }
    });
});
