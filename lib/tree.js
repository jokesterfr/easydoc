var fs = require('fs');
var path = require('path');

/**
 * List the different markdown file (detected from their extension), and 
 * returns a list of their names.
 */
module.exports = function tree(dir, root){
	if(!dir) return {};
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
			var res = tree(path.join(dir,file), root);
			results.children.push(res);
		} else {
			results.children.push({
				'name': file,
				'url': path.relative(root, path.join(dir,file))
			});
		}
	});
	return results;
}