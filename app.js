
/**
 * Module dependencies.
 */

var express = require('express');
var build = require('./build');
var app = express();

// configure

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.static(__dirname + '/build'));

app.all('*', build, function(req, res){
  res.sendfile('index.html');
});


app.listen(3000);
console.log('listening on 3000');
