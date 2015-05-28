var static = require('node-static');
var url =require('url');
var exec = require('child_process').exec;
var fs = require('fs');
var express    = require('express')
var bodyParser = require('body-parser')

var app = express()
app.use(bodyParser.json({ limit: '5mb' }))

var fileServer = new static.Server('./');
var parsedUrl, query, code;

require('http').createServer(function (request, response) {    
    parsedUrl = url.parse(request.url);

    if (parsedUrl.pathname==='/api') {

    } else {
        request.addListener('end', function () {
            fileServer.serve(request, response);
        }).resume();
    }

    request.setEncoding('utf8');
    request.on('data', function (chunk) {
        parsedUrl = url.parse(request.url);
        
        if (parsedUrl.pathname==='/api') {
            try {
                code = decodeURI(chunk);
                fs.writeFile("temp.py", code, function(err) {
                    if(err) {
                        console.log("Write File Error:" + err);
                    }
                    exec('python3 temp.py', function (error, stdout, stderr) {
                      console.log(stdout);
                      console.log("Python Error: " + stderr);
                    });
                }); 
                
            } catch (err) {
                console.log("Exception: " + err);
            }
        }
    });

}).listen(1337, '127.0.0.1');