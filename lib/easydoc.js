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
	if (options.min){
		console.log('TO IMPLEMENT');
	}

	// Express configuration
	// ------------------------------------------------------------------------
	var app = express();
	app.configure(function(){
	    app.use(express.methodOverride());
	    app.use(express.bodyParser());
	});
 
	// HTTP Routes (/!\ keep order safe)
	// ------------------------------------------------------------------------
	app.get('/'+options.app+'/*', httpHandlers.getApp);
	app.post('/search', httpHandlers.search);
	app.get('/myeasydoc/*', httpHandlers.getDoc);
	app.get('/', httpHandlers.getAppDefault);
	app.get('/*', httpHandlers.getAppDefault);

	// HTTP Server
	// ------------------------------------------------------------------------
	var server = http.createServer(app);
	server.listen(options.port, options.host, function(err) {
		if (err) throw err;
		console.info('[OK] Server started on ',options.host+':'+options.port);
		console.info(' -> documentation root set to "'+options.root+'"');
		console.info(' -> client app retrieved from "'+options.app+'"');
	});

	// Socket.IO
	// ------------------------------------------------------------------------
	var wsServer = socketio.listen(server);
	wsServer.set('log level', 1);
	wsServer.sockets.on('connection', function (socket) {
		socket.on('disconnect', function(data){
			console.log("pair disconnected");
		});
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