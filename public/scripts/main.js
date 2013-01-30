/*****************************************************************************\
 *                                                                            *
 *  File: 		main.js                                                       *
 *  Author: 	Clément Désiles - clement.desiles@telecomsante.com            *
 *  Licence: 	MIT Public Licence                                            *
 *  Repository: https://github.com/jokesterfr/easydoc                         *
 *                                                                            *
 \****************************************************************************/

/**
 * initWS
 *
 * Websocket initialization
 * to handle dynamic events between client and server
 * @private
 */
(function initWS(){
	// WebSocket configuration
	var socket = io.connect('http://localhost', {
		'reconnect':true,
		'connect timeout': 500,
		'transports':['websocket'],
		'try multiple transports':false
	});

	// Init application whenever WS is connected
	socket.on('connect', function () {
		initApp();
	});

	socket.on('summaryUpdate', function (summary) {
	  // Summary has been updated
	});

	socket.on('fileUpdate', function (contents) {
	  // The current file has been updated
	});
})();



function initApp(){
	function compileTPL(){
		for(tpl in tplList) {
			var source   = document.getElementById(tpl).innerHTML;
			var template = Handlebars.compile(source);	
		}
	}
};




function hashChange(){
	alert('Hash changed');
	//loadTemplate();
}

// Startup-app on document loaded
document.addEventListener('DOMContentLoaded', initApp);

// Update viewer against hash
document.addEventListener("hashchange", hashChange, false);