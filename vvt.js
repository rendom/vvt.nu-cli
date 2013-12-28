var stdio = require('stdio');
var CryptoJS = require("crypto-js/core");
var AES = require("crypto-js/aes");
var https = require('https');
var fs = require('fs');
var ops = stdio.getopt({
    'file': {key: 'f', description: 'Filename', args: 1},
    'encrypt': {key: 'e', description: 'Encryption key', args: 1}
});

var langs = [
    { ext: "coffee", lng:"Coffeescript" },
    { ext: "c", lng:"c_cpp" },
    { ext: "cpp", lng:"c_cpp" },
    { ext: "h", lng:"c_cpp" },
    { ext: "css", lng:"css" },
    { ext: "html", lng:"HTML" },
    { ext: "java", lng: "Java" },
    { ext: "js", lng: "JavaScript"},
    { ext: "json", lng: "JSON" },
    { ext: "php", lng: "PHP" },
    { ext: "py", lng: "Python" },
    { ext: "rb", lng: "Ruby"},
    { ext: "scss", lng: "SCSS" },
    { ext: "pl", lng: "Perl" },
    { ext: "sh", lng: "SH" },
    { ext: "xml", lng: "XML" },
    { ext: "sql", lng: "XML" }
];


function exitWithMsg(msg){
    console.log(msg);
    process.exit(0);
}

function getFileType(string){
    var match = string.match( /\.([a-zA-Z]+)$/ );
    if(match==null || match==undefined || match[1] == undefined) return 'text';
    match = match[1].toLowerCase();
    for(var i=0; i<langs.length;i++){
        if( langs[i].ext == match ) return langs[i].lng;
    }
    return 'text';
}

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

var data;
var lang = 'text';
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

if(ops.file){
    if(fs.existsSync(ops.file)) {
        data = fs.readFileSync(ops.file, 'utf8');
        lang = getFileType(ops.file);

    } else exitWithMsg('Wrong path?');
}else{
    var size = fs.fstatSync(process.stdin.fd).size;
    if(size > 0) data = fs.readSync(process.stdin.fd, size)[0];
    else exitWithMsg('No data inserted.. Feed stdin or use -f path/file');
}
if(ops.encrypt){
    data = AES.encrypt(data, ops.encrypt, {format: JsonFormatter})
    postObj.encrypted=1;
    data = data.toString();
}

postObj.language = lang;
postObj.code = data;
postRequest(postObj);
