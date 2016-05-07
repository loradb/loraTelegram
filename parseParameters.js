IOBuffer = require('iobuffer');

module.exports=function(array) {
    if (! array || array.length<4) return;
    if (! checkDigit(array)) return;
    var ioBuffer = new IOBuffer(Uint8Array.from(array));
    ioBuffer.setBigEndian();
    var result= {};
    result.epoch=ioBuffer.readInt32();
    var counter=0;
    while (ioBuffer.available(4)) {
        var reference="";
        if (counter>26) {
            reference+=(counter/26)>0;
        } else {
            reference+=String.fromCharCode(65+counter%26);
        }
        counter++;
        result[reference]=ioBuffer.readInt16();
    }
    return result;
}


function checkDigit(array) {
    var result=0;
    for (var i=0; i<array.length; i++) {
        result^=array[i];
    }
    return result===0 ? true : false;
}