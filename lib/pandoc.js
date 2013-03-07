/******************************************************************************
 *                                                                            *
 * Calls Pandoc to convert markdown into HTML5/JSON                           *
 * Principle here is to parse the important data into a js object,            *
 * keeping the HTML formating of the TOC and BODY...                          *
 * ie `pandoc -f markdown -t json` does not fit our need at all.              *
 *                                                                            *
 * This works has been inspired from `pdc` nodejs module:                     *
 * @see https://github.com/pvorb/node-pandoc                                  *
 *                                                                            *
 * @author Clément Désiles <main@jokester.fr>                                 *
 * @date 2013/02/24                                                           *
 *                                                                            *
 *****************************************************************************/
var spawn = require('child_process').spawn;
var path = require('path');
var pandocTPL = path.join(__dirname, 'pandoc.easydoc.tpl');

/**
 * @class Pandoc
 */
var Pandoc = {

	/**
	 * Convert a markdown file into object
	 * by calling Pandoc
	 *
	 * @param srcfile {Path} source file
	 * @param callback {Function}
	 * @return {Object} file object containing
	 * 		body: document body, html5 formatted
	 * 		toc: document table of contents, html5 formated
	 * 		title: document title
	 * 		date: date of writing the document
	 * 		lang: document language
	 * 		authors: list of document author(s)
	 */
	convert: function( srcfile, callback ){
		if (!srcfile || !callback) return;

		var args = [
			'-f', 'markdown',
			'--template='+pandocTPL,
			'--table-of-contents',
			'--smart',
			'--standalone',
			'--columns=80',
			'--email-obfuscation=javascript',
			srcfile
		];

		var result = '';
		var err = '';
		var process = spawn('pandoc', args);
		process.stdout.on('data', function (data) {
			result += data;
		});

		process.stderr.on('data', function (data) {
			err += data;
		});

		// Check errors and callback
		process.on('exit', function (errcode) {
			if (errcode != 0) err = 'pandoc exited with code '+errcode;
			if (err) { 
				return callback(err);
			}

			// No error, parse content
			var results = result.split('#easy-doc-block-cut-tag#');

			// Send a JSON object back
			var resObject = {
				body: results[0],
				toc: results[1],
				title: results[2],
				date: results[3],
				lang: results[4],
				authors: results.splice(5)
			};
			callback(null, resObject);
		});
	}
};

module.exports = Pandoc;