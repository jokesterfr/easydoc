/*****************************************************************************\
 *                                                                            *
 *  File: 		main.js                                                       *
 *  Author: 	Clément Désiles - clement.desiles@telecomsante.com            *
 *  Licence: 	MIT Public Licence                                            *
 *  Repository: https://github.com/jokesterfr/easydoc                         *
 *                                                                            *
 \****************************************************************************/

var DOC_ROUTE = '/myeasydoc/'
var DEFAULT_PAGE = 'index.md';

/**
 * Init websocket
 * Websocket initialization
 * to handle dynamic events between client and server
 */
var socket = io.connect('http://localhost', {
	'reconnect':true,
	'connect timeout': 500,
	'transports':['websocket'],
	'try multiple transports':false
});

// Init application whenever WS is connected
socket.on('connect', function () {

});

socket.on('summaryUpdate', function (summary) {
  // Summary has been updated
});

socket.on('fileUpdate', function (file) {
	var actualFile = window.location.pathname.substring(1);
	if (file === actualFile) {
		console.log('Update current file:', file);
		setDocument(file);
	}
});

/**
 * Init the client application
 * @return none
 */
function initApp() {
	var actualFile = window.location.pathname.substring(1);
	if (!actualFile) setDocument(DEFAULT_PAGE);
	else setDocument(actualFile);
};


/**
 * Get the document 
 * and update the page DOM
 * @param doc name {String}
 * @return none
 */
function setDocument(name) {
	var req = new XMLHttpRequest();
	
	req.addEventListener('error', transferFailed, false);
	req.addEventListener('load', function(evt){
		transferComplete(evt.target, name);
	}, false);
	// req.addEventListener('progress', transferProgress, false);
	// req.addEventListener('abort', transferCanceled, false);
	req.open('GET', DOC_ROUTE + name.replace(/^\.\.\//, ''), true);
	req.send();
}

/**
 * @return none
 */
function transferProgress(evt) {
	if (evt.lengthComputable) {
		var percentComplete = evt.loaded / evt.total;
		console.log(percentComplete);
	} else {
		// Unknwon length 
		// -> impossible to compute progress 
	}
}

/**
 *
 */
function transferFailed(evt) {

}

/**
 *
 */
function transferCanceled(evt) {

}
/**
 *
 */
function transferComplete(res, name) {
	if (res.getResponseHeader('content-type') !== 'application/json') {
		return alert('not actually supported');
	}
	
	var view, html;
	try { view = JSON.parse(res.responseText) }
	catch(e) { throw e }
	
	// Display page
	html = Handlebars.templates.page(view);
	document.getElementById('page').innerHTML = html;

	// Display lateral tree
	html = Handlebars.templates.tree(view.tree);
	document.getElementById('tree').innerHTML = html;

	// Update menu view
	checkHeight();

	// Add a cross //--> TODO: finish it
	var toggleBrowser = document.getElementById('toggleBrowser');
	if (toggleBrowser) {
		toggleBrowser.addEventListener('click', function(evt) {
			document.getElementById('tree').style.display = 'none';
		});
	}

	// Change the location history
	var actualFile = window.location.pathname.substring(1);
	if (actualFile !== name) {
		var title = name.split('/').splice(-1);
		document.title = 'Easydoc - ' + name;
		window.history.pushState({}, title, name);
	}

	// Change links behaviour
	var links = document.querySelectorAll('a');
	for (var i in links) {
		var link = links.item(i);
		if(!link.parentNode) return;
		var href = link.getAttribute('href');
		var newLink = link.cloneNode(true);
		newLink.addEventListener('click', function(evt) {
			evt.preventDefault();
			var href = evt.target.getAttribute('href');
			setDocument(href);
		}, false);
		link.parentNode.replaceChild(newLink, link);
	}
	return false;
}

/**
 *
 */
var checkHeight = function(evt) {
	var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
	var scrollBottom = scrollTop + document.documentElement.clientHeight;
	if (scrollTop > 150) {
		document.getElementById('table-of-contents').classList.add('scrolled');
	} else {
		document.getElementById('table-of-contents').classList.remove('scrolled');
	}

	var links = document.querySelectorAll('#table-of-contents a');
	for (var i in links) {
		var link = links.item(i);
		var anchorElt = document.querySelector(link.getAttribute('href'));
		if ((anchorElt.offsetTop - scrollTop) > 0 && (anchorElt.offsetTop + anchorElt.offsetHeight) < scrollBottom) {
			link.classList.add('viewed');
		} else {
			link.classList.remove('viewed');
		}
	};
}

// Startup-app on document loaded
document.addEventListener('DOMContentLoaded', initApp);

// Update menus against scroll position
window.addEventListener('scroll', checkHeight, false);