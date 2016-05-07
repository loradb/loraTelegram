
var config = require('./config.js');

var Telegram = require('telegram-bot-api');
var Tail = require('tail').Tail;
var parse = require('csv-parse/lib/sync');
var Lora = require('lora');
var dir = require('folder-contents');

var parseParemeters = require('./parseParameters.js');

// we get the last CSV file of the specified folder
var logfile=dir({
    path:'/opt/ttn-gateway/lora_gateway/util_pkt_logger',
    filter:{
        recursively: false,
        extensionAccept:['csv']
    }
})[".files"].sort(function (a,b) {
        return b.mtime- a.mtime;
    })[0];
logfile=logfile.path+"/"+logfile.name+"."+logfile.ext;

console.log("Watching file: "+logfile);


function parseData(data) {
    data=data.replace(/" +,/g,'",');
    var result=parse(data, {
        columns: ["gatewayID","nodeMAC","timestamp","usCount","frequency","rfCchain","RX chain","status","size","modulation","bandwidth","datarate","coderate","RSSI","SNR","originalPayload"],
        skip_empty_lines: true,
        trim: true,
        auto_parse: true
    });
    result.forEach(function(result) {
        var encryptedPayload=result.originalPayload.replace(/\-/g,"");
        result.payload=Lora.getPayload(encryptedPayload);
        result.debug=Lora.debug(encryptedPayload);
        result.parameters=parseParemeters(result.payload.array);
    });
    /*
    result=result.filter(function(result) {
        return result.status==='CRC_OK';
    });
    */
    return result;
}


var api = new Telegram({
    token: config.telegramToken
});

tail = new Tail(logfile);

tail.on("line", function(data) {
    var result=parseData(data);
    result.forEach(function(result) {
        if (result.parameters) toSend=JSON.stringify(result.parameters);
        else if (result.payload.ascii) var toSend=result.payload.ascii;
        else toSend=JSON.stringify(result.debug);

        api.sendMessage({
                chat_id:"@loradb",
                text:toSend
            }
        ).then(
            function(data) {
                console.log(data);
            }
        ).catch(function(err) {
                console.log(err);
            }
        );
    });
});

