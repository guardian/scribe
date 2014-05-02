var connect = require('connect');
var path = require('path');

var server = connect();
server.use(connect.logger());
server.use(connect.static(path.resolve(__dirname, '..')));
server.listen(8080);
