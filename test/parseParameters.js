
'use strict';

var parseParameter = require('../parseParameters.js');
var hexToBytes = require('convert-hex').hexToBytes;

describe('parseParameter', function () {
    it('should be correct', function() {
        var hexString='00001cba007b0878012c0001000200030004ffffffff007bffffffffffffffffffffffffffff000c00170022ffffffffffffffffffff007b5555bd';
        var bytes=hexToBytes(hexString);
        var result=parseParameter(bytes);
        (result === undefined).should.be.false();
        Object.keys(result).length.should.equal(27);
    });

    it('should be empty', function() {
        var hexString='1100001cba007b0878012c0001000200030004ffffffff007bffffffffffffffffffffffffffff000c00170022ffffffffffffffffffff007b5555bd';
        var bytes=hexToBytes(hexString);
        var result=parseParameter(bytes);
        (result === undefined).should.be.true();
    });

});