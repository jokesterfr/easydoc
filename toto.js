var fs = require("fs");
var path = require("path");

var tree = function(dir) {
	var results = {
		name: path.basename(dir),
		children: []
	};

	var list = fs.readdirSync(dir);
	if (!list || !list.length) { return []; }
	list.forEach(function(file) {
		var stat = fs.statSync(dir + '/' + file);
		if (stat && stat.isDirectory()) {
			var res = tree(dir + '/' + file)
			results.children.push(res);
		} else {
			results.children.push({'name': dir + '/' + file});
		}
	});
	return results;
};

// la fonction originale
// https://gist.github.com/3718809

var res = tree('/home/jokester/Workspace/easydoc/docs');
console.log(JSON.stringify(res));

//console.log(res.children[2].children);
