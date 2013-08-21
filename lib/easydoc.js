/******************************************************************************
 *                                                                            *
 * Easydoc is a documentation server, aimed to simply compile and display     *
 * Markdown styled documentation over HTTP/REST services.                     *
 *                                                                            *
 * This project is a fork of the great work done by feugy (@see the above     *
 * mention).                                                                  *
 * Differences are about the storage of the `_assets` folder, which is now    *
 * called `public`. It is not yet related to the documentation `root` folder  *
 * but the easydoc source dir itself. That is to say: documentation style is  *
 * set globally, so the documentation writer should never focus on how it has *
 * to be displayed.                                                           *
 * This version also adds some extra features, ie. tree and markdown live     *
 * updates, which provided over a WebSocket connexion.                        *
 *                                                                            *
 * @original-author feugy <damien.feugas@gmail.com>                           *
 * @author Jokester <main@jokester.fr>                                        *
 * @date 2013/02/04                                                           *
 *                                                                            *
 *****************************************************************************/

var fs = require('fs');
var path = require('path');
var http = require('http');
var async = require('async');
var express = require('express');
var socketio = require('socket.io');
var templates = require('./templates');

module.exports.start = function (options) {
	var handlers = require('./handlers.js')(options);
	var httpHandlers = handlers.http;
	var wsHandlers = handlers.ws;

	// Build ressources
	// ------------------------------------------------------------------------

	// Template precompilation (handlebars)
	templates.compile(options);

	// Javascript minification
	if (options.min) {
		console.log('TO IMPLEMENT');
	}

	// Express configuration
	// ------------------------------------------------------------------------
	var app = express();
	var server = http.createServer(app);
	app.configure(function() {
	    app.use(express.methodOverride());
	    app.use(express.bodyParser());
	});
 
	// HTTP Routes (/!\ keep order safe)
	// ------------------------------------------------------------------------
	app.get('/public/*', httpHandlers.getApp);
	app.post('/search', httpHandlers.search);
	app.get('/myeasydoc/*', httpHandlers.getDoc);
	app.get('/', httpHandlers.getAppDefault);
	app.get('/*', httpHandlers.getRawDoc);

	// Socket.IO
	// ------------------------------------------------------------------------
	var wsServer = socketio.listen(server);
	wsServer.set('log level', 1);
	wsServer.sockets.on('connection', function (socket) {
		socket.on('disconnect', function(data) {
			//console.log("pair disconnected");
		});
	});

	// HTTP Server
	// ------------------------------------------------------------------------
	server.on('error', function onError(e) {
		var port = options.port;
		switch (e.code) {
			case 'EADDRINUSE':
				console.error('[Error] port', port, 'already in use');
				return process.exit(1);

			case 'EACCES':
				console.error('[Error] not allowed to bind on port', port);
				return process.exit(1);

			default:
				console.error(e.code);
				return process.exit(1);
		}
	});

	server.on('after', function log() {
		var ipAddress = req.headers['x-forwarded-for'] === undefined ? req.connection.remoteAddress : req.headers['x-forwarded-for'];
		var responseTime = (res._headers && res._headers.hasOwnProperty('x-response-time') ? res._headers['x-response-time']+'ms' : '');
		console.info(ipAddress + ' ' + req.method + ' ' + req.url + ' ' + res.statusCode + ' ' + responseTime);
	});

	server.listen(options.port, function(err) {
		if (err) throw err;
		console.info('[OK] Server started on', options.port);
		console.info(' -> documentation root set to "' + options.root + '"');
		console.info(' -> client app retrieved from "public"');
	});


	// Documentation files watchdog
	// ------------------------------------------------------------------------
	var watchOn = true; // flag to avoid minority reports
	fs.watch( options.root, function (event, filename) {
		if (event === 'change' && watchOn) {
			watchOn = false;
			wsServer.sockets.emit('fileUpdate', filename);
			setTimeout(function() { watchOn = true }, 50);
		}
	});
};