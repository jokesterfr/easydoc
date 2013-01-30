/******************************************************************************
 *                                                                            *
 *                                                                            *
 *                                                                            *
 *                                                                            *
 * @original-author feugy <>
 * @
 *                                                                            *
 *****************************************************************************/

// Includes
// ------------------------------------
var path = require('path');

// Exports
// ------------------------------------
module.exports = function (options){

	/**
	 * @class httpHandlers
	 */
	var httpHandlers = function(){

		/*
		 * Send back a HTTP error response.
		 * If an error is provided, the error is sent with a 500 error code,
		 * otherwise it's a empty 404 error.
		 * 
		 * @param res - Http response
		 * @param err - Error message. Facultative.
		 * @return none
		 */
		var error = function(res, err) {
			if (err) {
				return res.send(err, {'Content-Type': 'text/plain'}, 500);
			}
			return res.send(404);
		};


		/**
		 * Return the default `public` index
		 *
		 * @param req {HTTP Request}
		 * @param res {HTTP Response}
		 * @return none
		 */
		function getPublicDefault(req, res){
			req.url = '/public/index.html';
			getPublic(req, res);
		}

		/**
		 * Return the requested `public` file
		 *
		 * @param req {HTTP Request}
		 * @param res {HTTP Response}
		 * @return none
		 */ 
		function getPublic(req, res){
			// Clean spaces
			req.url = req.url.replace(/%20/g, ' ');

			// Send ressource
			getPage(path.join(__dirname, '..', req.url), res);
		}

		/**
		 * Return a documentation related file
		 *
		 * @param req {HTTP Request}
		 * @param res {HTTP Response}
		 * @return none
		 */
		function getDoc(req, res){
			// Clean spaces
			req.url = req.url.replace(/%20/g, ' ');

			// Send documentation ressource
			getPage(path.join(__dirname, '..', req.url), res);
		}

		/* 
		 * Performs the search on files.
		 * The searched query is contained in the "searched" body parameter.
		 *
		 * @param req {HTTP Request}
		 * @param res {HTTP Response}
		 * @return none
		 */
		function search(req, res){
			var searched = req.body.searched;
			// Do not search blank or empty strings.
			if (searched.trim().length === 0) {	}
			
			// Performs a search on files.
			search(searched, function(err, results) {
				if (err) {
					console.error('Cannot perform search of '+ searched +': '+err);
					return errorPage(res, err);
				}
				// In dev mode, clear cache immediately.
				if (!options.cache) {
					mu.clearCache(searchTemplate);
				}
				// Parse the page mustache template.
				var mapHit = function(value){
					return {val:value};
				};
				var mapResult = function(result) {
					return {
						url: result.file,
						name: getName(result.file),
						hits: result.hits.map(mapHit)
					};
				};
				var tmpl = mu.compileAndRender(searchTemplate, {
				    title: options.title,
					results: results.map(mapResult),
					searched: searched
				});
				util.pump(tmpl, res);
			});
		}

			/*
		 * Gets the friendly name of a file:
		 * @return {String} friendly name
		 */
		var getName = function(filePath) {
			return filePath.replace(new RegExp('\\..*$'), '');
		};

		/**
		 * List the different markdown file (detected from their extension), and 
		 * returns a list of their names.
		 */
		var tree = function(dir) {
			var root = path.resolve(options.root);
			if(!dir) dir = root;
			var results = {
				name: path.basename(dir),
				children: [],
				url: path.relative(root, dir)
			};
			var list = fs.readdirSync(dir);
			if (!list || !list.length) { return []; }
			list.forEach(function(file) {
				var stat = fs.statSync(path.join(dir,file));
				if (stat && stat.isDirectory()) {
					var res = tree(path.join(dir,file))
					results.children.push(res);
				} else {
					results.children.push({
						'name': file,
						'url': path.relative(root,path.join(dir,file)),
					});
				}
			});
			return results;
		};

		/**
		 * Read on the hard-drive the requested file,.
		 * If it's a markdown file, interpret it, and insert it into a mustache template.
		 * The makeSummary() method is also involved.
		 *
		 * Otherwise, return the existing static file.
		 * 
		 * The hole thing is returned into the http response.
		 * 
		 * The template is only once compiled unless the --no-cache argument is specified
		 *
		 * - _filePath_: relative path to the displayed markdown page.
		 * - _res_: The HTTP response used to display the page. 
		 */
		var getPage = function(filePath, res) {
			fs.exists(filePath, function(exists) {
				if (!exists) {
					console.error(filePath+' does not exists !');
					return handlers.http.error(res);
				}
				
				// Check the extension
				if (path.extname(filePath).match(ext)) {
					// For markdown, read the file entirely.
					fs.readFile(filePath, function (err, content) {
						if (err) {
							// Cannot read the file. Exit.
							console.error('Cannot read file '+filePath+': '+err);
							return handlers.http.error(res, 'Internal error [easydoc.js:166]');
						}

						// In dev mode, clear cache immediately.
						if (!options.cache) {
							mu.clearCache(pageTemplate);
						}

						// Render page with pandoc
						pandoc(content.toString(), 'markdown', 'html', function(err, result) {
							if (err) throw err;
							var sumContent = JSON.stringify( tree() );
							var tmpl = mu.compileAndRender(pageTemplate, {
								// Insert inside the page the interpreted markdown content.
								title:   options.title,
								content: result,
								summary: sumContent
							});
							util.pump(tmpl, res);
						});
					});
				} else {
					// Serve static content with a stream reader.
					var stream = fs.createReadStream(filePath);
					stream.pipe(res);
				}
			});
		};


		return {
			error:error,
			getPublicDefault:getPublicDefault,
			getPublic:getPublic,
			getDoc:getDoc
		}
	};

	/**
	 * @class websocketHandlers
	 */
	var websocketHandlers = function(){

	}

	// Return public scope
	return {
		http: httpHandlers,
		ws:   websocketHandlers
	}

};

