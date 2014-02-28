var connect = require('connect');
var path = require('path');

connect.createServer(connect.static(path.resolve(__dirname, '..'))).listen(8080);
