var express = require('express');
var http = require('http');
var fs = require('fs');
var util = require('util');
var pandoc = require("pdc");
var path = require('path');
var mu = require('mu2');
var socketio = require('socket.io');

module.exports.start = function (options) {

	var handlers = require('./handlers.js')(options);
	var ext = /\.m(ar)?k?d(own)?$/;

	//var assets = path.join(options.root, 'public');
	options.publicDir = path.join(__dirname, '..', 'public');

	// Express configuration
	// ------------------------------------------------------------------------
	var app = express();
	app.configure(function(){
	    app.use(express.methodOverride());
	    app.use(express.bodyParser());
	});
 
	// HTTP Routes (/!\ keep order safe)
	// ------------------------------------------------------------------------
	app.get('/',         getPublicDefault);
	app.get('/public/*', getPublic);
	app.get('/*',        getDoc);
	app.post('/search', search);

	// HTTP Server
	// ------------------------------------------------------------------------
	var server = http.createServer(app);
	server.listen(options.port, options.host, function(err) {
		if (err) {
			console.error('Cannot start server on ',options.host,':',options.port);
			console.error(err);
			return;
		}
		
		console.info('Server started on '+options.host+':'+options.port);
		console.info('-> documentation root set to "'+options.root+'"');

		if (!options.cache) {
			console.warn('<WARN> Template cache not set: do not use in production !!');
		}
	});

	// File watch lookup
	//// TODO

	// Socket.IO
	// ------------------------------------------------------------------------
	var wsServer = socketio.listen(server);
	wsServer.sockets.on('connection', function (socket) {
		socket.emit('hooohooo', { hello:'world'} );
		socket.on('disconnect', function(data){
			console.log("pair disconnected");
		});
	});
};