var express = require('express');
var fs = require('fs');
var http = require('http');
var util = require('util');
var pandoc = require("pdc");
var path = require('path');
var mu = require('mu2');
var os = require('os');
var exec = require('child_process').exec;

module.exports = function (options) {

	var ext = /\.m(ar)?k?d(own)?$/;

	var assets = path.join(options.root, '_assets');

	// Checks the page template existence. 
	// Do not mind asynchronism, because if the check failed, program will exit.
	var pageTemplate = path.join(assets, 'page.tpl');
	var searchTemplate = path.join(assets, 'search.tpl');
	fs.exists(pageTemplate, function(exists) {
		if(!exists) {
			console.error('No page.tpl template found inside the root folder. Please provide one');
			process.exit(1);
		}
		fs.exists(searchTemplate, function(exists) {
			if(!exists) {
				console.error('No search.tpl template found inside the root folder. Please provide one');
				process.exit(1);
			}
		});
	});

	/* ## errorPage()
	 * Displays an HTTP error response. If an error is provided, the error is 
	 * displayed with a 500 error code, otherwise it's a empty 404 error.
	 * 
	 * - _res_: Http response
	 * - _err_: Error message. Facultative.
	 */
	var errorPage = function(res, err) {
		if (err) {
			res.send(err, {'Content-Type': 'text/plain'}, 500);
		} else {
			res.send(404);
		}
	};

	/* ## getName()
	 * Gets the friendly name of a file:
	 *  - Removes extension
   *  - Removes the XXX__ in front of the filename, that is used to sort
	 * 
	 * - _filePath_: The handled file path
	 * 
	 * _returns_ the friendly name
	 */
	var getName = function(filePath) {
		return filePath.replace(new RegExp('\\..*$'), '').replace(/^.*__/,'');
	};

	/* ## makeSummary()
	 * List the different markdown file (detected from their extension), and 
	 * returns a list of their names.
	 *
	 * - _callback_: A callback function that will received as first argument an error 
	 * (if somthing goes wrong) and as second argument an array (that may be empty) 
	 * containing the list of existing markdown templates (strings).
	 */
	var makeSummary = function(callback) {
		// Read folder's content
		fs.readdir(options.root, function(err, files) {
			if (err) {
				// Cannot read the folder. Exit.
				return callback(err, []);
			}
			// Filter the _assets sub-folder
			callback(null, files.filter(function(val) {
				return val !== '_assets';
			}).sort());
		});
	};

	/* ## search()
	 * Performs a local-drive search by executing an os-specific command.
	 * Uses grep on linux, and findstr on windaube.
	 * 
	 * - _callback_: A callback function that will received as first argument an error 
	 * (if somthing goes wrong) and as second argument an array (that may be empty) 
	 * containing object with the following properties
	 *   - _file_: file path, relative to root folder.
	 *   - _hits_: array of search occurence (strings). 
	 */
	var search = function(searched, callback) {
		var root = path.resolve(options.root);
		// Search command is platform dependant.
		// use grep on linux, and findstr on windaube.
		var command = os.platform() === 'win32' ? 
				'findstr /spin /c:"'+searched+'" '+ path.join(root, '*.*') :
				'grep -rin "'+searched+'" '+root;
		// Exec the command line.
		exec(command, function (err, stdout, stderr) {
			if (err) {
				// A 1 error code means no results.
				if (err.code === 1) {
					err = null;
				}
				return callback(err, []);
			}
			// Each line an occurence.
		  var lines = stdout.toString().split(root);
		  // Remove files that are not markdown.
		  lines = lines.filter(function(val) {
				return val.trim().length > 0;
			});
	    // Regroups by files
	    var grouped = {};
	    for(var i = 0; i < lines.length; i++) {
	    	var numStart = lines[i].indexOf(':');
	    	var numEnd = lines[i].indexOf(':', numStart+1);
	    	
	    	// Remove leading \
	    	var fileName = lines[i].substring(1, numStart);
	    	if (!(fileName in grouped)) {
	    		grouped[fileName] = [];
	    	}
	    	grouped[fileName].push(lines[i].substring(numEnd+1));
	    }
	    // Sort by relevance
	    var files = [];
	    for(var key in grouped) {
	    	files.push({
	    		file: key, 
	    		hits: grouped[key]
	    	});
	    }
	    callback(null, files.sort(function(a, b) {
	    	return b.hits.length - a.hits.length;
	    }));
		});
	};

	/* ## displayPage()
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
	var displayPage = function(filePath, res) {
		fs.exists(filePath, function(exists) {
			if (!exists) {
				console.error(filePath+' does not exists !');
				return errorPage(res);
			}
			
			// Check the extension
			if (path.extname(filePath).match(ext)) {
				// For markdown, read the file entirely.
				fs.readFile(filePath, function (err, content) {
					if (err) {
						// Cannot read the file. Exit.
						console.error('Cannot read file '+filePath+': '+err);
						return errorPage(res, err);
					}

					// In dev mode, clear cache immediately.
					if (!options.cache) {
						mu.clearCache(pageTemplate);
					}
					
					// Compute summary.
					makeSummary(function(err, pages) {
						if (err) {
							// Cannot read the file. Exit.
							console.error('Cannot read folder '+options.root+': '+err);
							return errorPage(res, err);
						}
						// Parse the page mustache template.
						var mapPage = function(val) {
							return {
								url: val,
								name: getName(val)
							};
						};
						pandoc(content.toString(), 'markdown', 'html', function(err, result) {
							if (err) throw err;

							var tmpl = mu.compileAndRender(pageTemplate, {
								// Insert inside the page the interpreted markdown content.
								title: options.title,
								content: result,
								pages: pages.map(mapPage)
							});
							util.pump(tmpl, res);
						});
					});
				});
			} else {
				// Serve static content with a stream reader.
				var stream = fs.createReadStream(filePath);
				stream.pipe(res);
			}
		});
	};

	/* # Http server
	 *
	 * The http server that will serve static content.
	 */
	var app = express();

	
	app.configure(function(){
	    app.use(express.methodOverride());
	    app.use(express.bodyParser());
	});

	/* # GET /
	 * Try to display the index.md page.
	 */
	app.get('/', function(req, res) {
		makeSummary(function(err, pages) {
      if (err) {
              // Cannot read the file. Exit.
              console.error('Cannot read folder '+options.root+': '+err);
              return errorPage(res, err);
      }
      displayPage(path.join(options.root, pages[0]), res);
    });
	});

	/* # GET /*
	 * Displays the page corresponding to the url path.
	 */
	app.get('/*', function(req, res){
		// Check the file path existence.
		displayPage(path.join(options.root, req.url.replace(/%20/g, ' ')), res);
	});

	/* # POST /search
	 * Performs the search on files.
	 * The searched query is contained in the "searched" body parameter.
	 */
	app.post('/search', function(req, res){
		var searched = req.body.searched;
		// Do not search blank or empty strings.
		if (searched.trim().length === 0) {
		}
		
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
	});

	var server = http.createServer(app);
	server.listen(options.port, options.host, function(err) {
		if (err) {
			console.error('Cannot start server on '+options.host+':'+options.port+':\n'+err);
		}
		if (!options.cache) {
			console.warn('<WARN> No template cache: do not use in production !!');
		}
		console.info('Server started on '+options.host+':'+options.port+' to serve root folder "'+options.root+'"');
		if (options.onStart instanceof Function) {
			options.onStart();
		}
	});

	return server;
};
