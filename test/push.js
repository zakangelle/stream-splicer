var pipeline = require('../');
var through = require('through2');
var split = require('split');
var concat = require('concat-stream');
var test = require('tape');

test('push', function (t) {
    var expected = {};
    expected.first = [ 333, 444, 555, 666, 777 ];
    expected.second = [ 6.66, 7.77 ];
    expected.output = [ 3.33, 4.44, 5.55, 3, 2 ];
    
    t.plan(Object.keys(expected).reduce(function (sum, key) {
        return sum + expected[key].length;
    }, 0));
    
    var a = split();
    var b = through.obj(function (row, enc, next) {
        this.push(JSON.parse(row));
        next();
    });
    var c = through.obj(function (row, enc, next) { this.push(row.x); next() });
    var d = through.obj(function (x, enc, next) { this.push(x * 111); next() });
    
    var first = through.obj(function (row, enc, next) {
        if (expected.first.length === 2) p.push(second);
        
        var ex = expected.first.shift();
        t.deepEqual(row, ex);
        
        this.push(row / 100);
        next();
    });
    var second = through.obj(function (row, enc, next) {
        var ex = expected.second.shift();
        t.deepEqual(row, ex);
        this.push(Math.floor(10 - row));
        next();
    });
    
    var p = pipeline.obj([ a, b, c, d, first ]);
    p.pipe(through.obj(function (row, enc, next) {
        var ex = expected.output.shift();
        t.deepEqual(row, ex);
        next();
    }));
    
    p.write('{"x":3}\n');
    p.write('{"x":4}\n');
    p.write('{"x":5}\n');
    p.write('{"x":6}\n');
    p.write('{"x":7}');
    p.end();
});
