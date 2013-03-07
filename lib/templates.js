/******************************************************************************
 *                                                                            *
 * Template compilation and mux                                               *
 *                                                                            *
 * This code has been strongly inpired from the /bin/handlebars cli script,   *
 * from the handlebars project, to handle undocumented (:p) hidden flavours   *
 * of Handlebars pre-compilation.                                             *
 *                                                                            *
 * @author Jokester <main@jokester.fr>                                        *
 * @date 2013/02/17                                                           *
 *                                                                            *
 *****************************************************************************/

// Includes
// ------------------------------------
var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');

// Exports
// ------------------------------------

/** 
 * Compile all the templates located in srcdir
 * into one single js file.
 * Minification is out the scope of this module.
 * @return none
 */
module.exports.compile = function(options) {
	var srcdir = path.join( __dirname, '..', options.app, 'tpl' );
	var dest = path.join( __dirname, '..', options.app, 'build', 'templates.js' );
	var list = fs.readdirSync(srcdir);

	options.handlebars = {
		knownHelpers: {}
		// ,knownHelpersOnly: false,
		// ,data: false,
		// ,partials: {},
		// ,root:false
	};

	var output = fs.createWriteStream(dest, { encoding: 'utf8' } );
	output.write(
		'(function() {\n\tvar template = Handlebars.template, templates' +
		' = Handlebars.templates = Handlebars.templates || {};\n'
	);

	/** 
	 * Process the handlebars precompilation,
	 * this method is called for a single file.
	 *
	 * @param template {String} template path
	 * @return none
	 */
	function processTemplate(template) {
		var tplPath = template,
		stat = fs.statSync(tplPath);
		if (stat.isDirectory()) {
			fs.readdirSync(template).map(function(file) {
				tplPath = path.join(template, file);
				if (/\.handlebars$/.test(tplPath) || fs.statSync(tplPath).isDirectory()) {
					processTemplate(tplPath);
				}
			});
		} else {
			var data = fs.readFileSync(tplPath, 'utf8');

			// Clean the template name	
			template = path.basename(template, '.tpl');
			template = template.replace(/\.handlebars$/, '');

			if (options.handlebars.partials) {
				output.write( 'Handlebars.partials[\'' + template + '\'] = template(' );
				output.write( handlebars.precompile(data, options.handlebars) );
				output.write( ');\n' );
			} else {
				output.write( 'templates[\'' + template + '\'] = template(' );
				output.write( handlebars.precompile(data, options.handlebars) );
				output.write( ');\n' );
			}
		}
	}

	// Call the compilation for each template
	list.forEach(function(template) {
		processTemplate( path.join(srcdir, template) );
	});
	
	// End the file stream
	output.end('})();');
}



// SOME PREVIOUS WORK //

// // Template precompilation
// // ------------------------------------------------------------------------
// var srcdir = path.join(appDir, 'tpl');
// var name, tpl = '';
// var list = fs.readdirSync(srcdir);

// // Asynchronously retrieve template contents
// async.map(list, function(f,cb){
// 	fs.readFile(path.join(srcdir, f), 'utf-8', cb)
// }, function(err, res){
// 	if (err) 
// 		throw err;
// 	else if (!res.length)
// 		return console.log('[Warning] No templates found in '+srcdir);

// 	// Pre-compile each template
// 	for (var i=0, l=list.length; i<l; i++){
// 		name = path.basename(list[i], '.tpl');
// 		if (i>0) tpl +=',';
// 		tpl += name + ':' + handlebars.precompile(res[i]) + '\n'; 
// 	}

// 	// Write the concatenated result
// 	fs.writeFile( 
// 		path.join(appDir, 'build', 'templates.js'), 
// 		'var templates = {\n'+tpl+'\n}',
// 		'utf-8'
// 	);
// });