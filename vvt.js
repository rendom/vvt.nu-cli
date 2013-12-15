/*

    Todo:
    *stdin
    *readfile
    *get paste

 */

var stdio = require('stdio');
var CryptoJS = require("crypto-js/core");
var AES = require("crypto-js/aes");
var https = require('https')

var ops = stdio.getopt({
    'file': {key: 'f', description: 'Filename', args: 1},
    'encrypt': {key: 'e', description: 'Encryption key', args: 1}
});


function postRequest(dataObj){
    var post_data = JSON.stringify( dataObj );
    var opt = {
        host: 'vvt.nu',
        port: 443,
        path: '/api/pastebin.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };
    req = https.request(opt, function(res){
        res.setEncoding('utf-8');
        res.on('data', function(d){
            console.log(d);
        });
    });

    req.write(post_data);
    req.end();
}


var data = "foo";
var postObj = {};
var JsonFormatter = {
    stringify: function (cipherParams) {
        var jsonObj = {
            ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
        };
        if (cipherParams.iv) {
            jsonObj.iv = cipherParams.iv.toString(CryptoJS.enc.Base64);
        }
        if (cipherParams.salt) {
            jsonObj.s = cipherParams.salt.toString(CryptoJS.enc.Base64);
        }
        return JSON.stringify(jsonObj);
    }
};
if(ops.encrypt){
    data = AES.encrypt(data, ops.encrypt, {format: JsonFormatter})
    postObj.encrypted=1;
}
postObj.code = data.toString();
postRequest(postObj);