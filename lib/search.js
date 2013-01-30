/******************************************************************************
 *                                                                            *
 * Performs a local-drive search by executing an os-specific command.         *
 * Uses grep on linux, and findstr on windaube.                               *
 *                                                                            *
 * @param keywords {String} search keywords parameters                        *
 * @param callback {Function} A callback function that will received          *
 * as first argument an error  (if somthing goes wrong) and as second         *
 * argument an array (that may be empty) containing object with the           *
 * following properties:                                                      *
 *   file {Path} relative path to root folder                                 *
 *   hits {String Array} search occurences                                    *
 *                                                                            *
/*****************************************************************************/

var os = require('os');
var exec = require('child_process').exec;

module.exports.search = function(keywords, callback) {
	var root = path.resolve(options.root);

	// Search command is platform dependant.
	// use grep on linux, and findstr on windaube.
	var command = os.platform() === 'win32' ? 
			'findstr /spin /c:"'+keywords+'" '+ path.join(root, '*.*') :
			'grep -rin "'+keywords+'" '+root;

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

		// Callback
		callback(null, files.sort(function(a, b) {
			return b.hits.length - a.hits.length;
		}));
	});
};