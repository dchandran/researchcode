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

var http = require('http');

http.createServer(function (request, response) {    
    parsedUrl = url.parse(request.url);    

    if (parsedUrl.pathname.indexOf('/api') > -1) {

    } else {
        request.addListener('end', function () {
            fileServer.serve(request, response);
        }).resume();
    }

    request.setEncoding('utf8');
    request.on('data', function (chunk) {
        parsedUrl = url.parse(request.url);

        if (parsedUrl.pathname==='/api/model') {
            try {
                code = decodeURI(chunk);
                console.log(code);
                fs.writeFile("py/temp.psc", code, function(err) {
                    if(err) console.log("Write File Error:" + err);
                });
                response.writeHead(200, {'Content-Type': 'text/plain' });
                response.write(code);
                response.end();          
            } catch (err) {
                console.log("Exception: " + err);
            }
        }

        if (parsedUrl.pathname==='/api/modules') {
            try {
                code = decodeURI(chunk);
                console.log(code);
                fs.writeFile("py/modules.yaml", code, function(err) {
                    if(err) console.log("Write File Error:" + err);
                });
                response.writeHead(200, {'Content-Type': 'text/plain' });
                response.write(code);
                response.end();          
            } catch (err) {
                console.log("Exception: " + err);
            }
        }
        
        if (parsedUrl.pathname==='/api/code') {
            try {
                code = decodeURI(chunk);
                console.log(code);
                fs.writeFile("py/temp.py", code, function(err) {
                    if(err) console.log("Write File Error:" + err);

                    exec('python3 py/temp.py', function (error, stdout, stderr) {
                      console.log(stdout);
                      console.log(stderr);
                      fs.readFile('py/temp.out', function (err, data) {
                          if (err) console.log("Read File Error:" + err);
                          console.log(data);
                          response.writeHead(200, {'Content-Type': 'text/plain' });
                          response.write(data);
                          response.end();
                        });
                    });
                }); 
                
            } catch (err) {
                console.log("Exception: " + err);
            }
        }
    });
}).listen(1337, '127.0.0.1');