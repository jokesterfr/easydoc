/******************************************************************************
 *                                                                            *
 * Check the CLI inputs                                                       *
 *                                                                            *
 * @author Jokester <main@jokester.fr>                                        *
 * @date 2013/08/21                                                           *
 * @module Check                                                              *
 *                                                                            *
 *****************************************************************************/

var fs = require('fs');
var DOC_REG = /^doc[s]?|DOC[s]?|documentation[s]?|docu[s]?$/;
/**
 * @lends Check
 * @param {Object} input CLI options
 * @param {Function} callback - return checked options
 * @return none
 */
module.exports = function check( cli, callback ) {
	fs.exists(cli.root, function(exists) {
		// Exists
		if (exists && fs.statSync(cli.root).isDirectory()) {
			return callback(cli)
		}

		// Does not exist
		fs.readdir(process.cwd(), function(err, files) {
			if (err) {
				console.error('[Error] incorrect --root argument');
				process.exit(1);
			}

			// Try to get some available `doc` folder
			var availDir = [];
			for (var i in files) {
				var file = files[i];
				if (!fs.statSync(file).isDirectory()) continue;
				if (file.match(DOC_REG)) {
					cli.root = file;
					return check(cli, callback);
				}
				availDir.push(file);
			}

			// Exit with error
			console.error('[Error] incorrect --root argument');
			console.log('please specify where is your documentation, ie:');
			for (var i in availDir) { console.log('  *', availDir[i]) }
			process.exit(1);
		});

	});
}