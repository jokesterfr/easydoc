/******************************************************************************
 *                                                                            *
 * HTTP REST and WebSocket services                                           *
 *                                                                            *
 * @original-author feugy <damien.feugas@gmail.com>                           *
 * @author Jokester <main@jokester.fr>                                        *
 * @date 2013/02/04                                                           *
 *                                                                            *
 *****************************************************************************/

// Includes
// ------------------------------------
var fs = require('fs');
var path = require('path');
var tree = require('./tree.js');
var util = require('util');
var ext = /\.m(ar)?k?d(own)?$/;
var pandoc = require('./pandoc.js');
var mimetypes = require('./mimetypes.js');

// Exports
// ------------------------------------
module.exports = function (options) {

	/**
	 * @class httpHandlers
	 */
	var httpHandlers = {

		/*
		 * Send back a HTTP error response.
		 * If an error is provided, the error is sent with a 500 error code,
		 * otherwise it's a empty 404 error.
		 * 
		 * @param res - Http response
		 * @param err - Error message. Facultative.
		 * @return none
		 */
		error: function(res, err) {
			if (err) {
				return res.send(err, {'Content-Type': 'text/plain'}, 500);
			}
			return res.send(404);
		},

		/**
		 * Return the requested `options.app` file
		 *
		 * @param req {HTTP Request}
		 * @param res {HTTP Response}
		 * @return none
		 */ 
		getApp: function(req, res) {
			// Clean spaces
			req.url = req.url.replace(/%20/g, ' ');

			// Send ressource
			httpHandlers.getPage(path.join(__dirname, '..', req.url), res);
		},

		/**
		 * Return the default `options.app` index
		 *
		 * @param req {HTTP Request}
		 * @param res {HTTP Response}
		 * @return none
		 */
		getAppDefault: function(req, res) {
			var page = path.join(__dirname, '..', options.app, 'index.html');
			httpHandlers.getPage(page, res);
			/*
			res.writeHead(302, {
				'Location': '/'+options.app+'/index.html'
			});
			res.end();
			*/
		},

		/**
		 * Return a documentation related file
		 *
		 * @param req {HTTP Request}
		 * @param res {HTTP Response}
		 * @return none
		 */
		getDoc: function(req, res) {
			// Clear part of the request route
			// (because options.root should define it)
			req.url = req.url.replace(/^\/myeasydoc/,'');
			// Clean spaces
			req.url = req.url.replace(/%20/g, ' ');

			// Send documentation ressource
			var page = path.join(__dirname, '..', options.root, req.url);
			httpHandlers.getPage(page, res);
		},

		/* 
		 * Performs the search on files.
		 * The searched query is contained in the "searched" body parameter.
		 *
		 * @param req {HTTP Request}
		 * @param res {HTTP Response}
		 * @return none
		 */
		search: function(req, res) {
			var searched = req.body.searched;
			// Do not search blank or empty strings.
			if (searched.trim().length === 0) {	}
			
			// Performs a search on files.
			search(searched, function(err, results) {
				if (err) {
					console.error('Cannot perform search of '+ searched +': '+err);
					return httpHandlers.errorPage(res, err);
				}

				// Parse the page mustache template.
				var mapHit = function(value) {
					return {val:value};
				};
				var mapResult = function(result) {
					return {
						url: result.file,
						name: getName(result.file),
						hits: result.hits.map(mapHit)
					};
				};

				var tmpl = {
				    title: options.title,
					results: results.map(mapResult),
					searched: searched
				};
				util.pump(tmpl, res);
			});
		},

		/*
		 * Gets the friendly name of a file:
		 * @return {String} friendly name
		 */
		getName: function(filePath) {
			return filePath.replace(new RegExp('\\..*$'), '');
		},	

		/**
		 * Read on the requested file.
		 * If it's a markdown file, convert it to HTML and calculate 
		 * the associated file tree.
		 * Otherwise, return the existing static file.
		 * 
		 * The template is only once compiled unless the --no-cache argument is specified
		 *
		 * @param filePath {String} relative path to the displayed markdown page.
		 * @param res {Object} The HTTP response used to display the page. 
		 * @return none
		 */
		getPage: function(filePath, res) {
			fs.stat(filePath, function(err, stat) {
				// Check error
				if (err || !stat) {
					console.error('Cannot stat:', filePath);
					return httpHandlers.error(res);
				}

				// If it is a directory check it's index 
				if (stat.isDirectory()) {
					var dirIndex = path.join(filePath, 'index.md');
					return httpHandlers.getPage( dirIndex, res);
				}

				fs.exists(filePath, function(exists) {
					if (!exists) {
						console.error(filePath+' does not exists !');
						return httpHandlers.error(res);
					}
					// Check the extension
					if (path.extname(filePath).match(ext)) {
				
						// Convert the markdown source into our custom JSON
						pandoc.convert(filePath, function(err, result) {
							if (err) return httpHandlers.error(err);
							
							// Send a JSON object back
							result.fileName = path.basename(filePath, '.md');
							result.tree = tree(path.dirname(filePath), options.root);
							res.writeHead( 200, { 'Content-Type': 'application/json' } );
							res.end( JSON.stringify(result) );
						});					

					} else {
						// Serve static content with a stream reader.
						var stream = fs.createReadStream(filePath);
						var contentType = mimetypes.get(path.extname(filePath).substr(1));
						res.writeHead(200, { 'Content-Type': contentType });
						stream.pipe(res);
					}
				});
			});
		}
	};

	/**
	 * @class wsHandlers
	 */
	var wsHandlers = {

	}

	// Return public scope
	return {
		http: httpHandlers,
		ws:   wsHandlers
	}

};

