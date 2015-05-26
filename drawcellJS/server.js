var static = require('node-static');
var url =require('url');
var exec = require('child_process').exec;
var fs = require('fs');
var express    = require('express')
var bodyParser = require('body-parser')

var app = express()
app.use(bodyParser.json({ limit: '5mb' }))

var fileServer = new static.Server('./');
 
require('http').createServer(function (request, response) {
    var parsedUrl = url.parse(request.url);
    var query, code;
    if (parsedUrl.pathname==='/api') {
        try {
            console.log(parsedUrl);
            code = decodeURI(parsedUrl.query);
            fs.writeFile("temp.py", code, function(err) {
                if(err) {
                    console.log("Write File Error:" + err);
                }
                exec('python temp.py', function (error, stdout, stderr) {
                  console.log(stdout);
                  console.log("Python Error: " + stderr);
                });
            }); 
            
        } catch (err) {
            console.log("Exception: " + err);
        }
    } else {
        request.addListener('end', function () {
            fileServer.serve(request, response);
        }).resume();
    }
}).listen(1337, '127.0.0.1');