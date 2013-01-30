var wrench = require('wrench');

var root = '/home/jokester/Workspace/easydoc/docs'; 
var rootChildren = [];
wrench.readdirRecursive(root, function(err, curFiles) {
    if(!err && curFiles) rootChildren.push(curFiles);
});

console.log(rootChildren);

console.log('');
console.log('');

var obj = {
	name:path.basename(start),
 	files:null,
 	folders:null
}

for(i in rootChildren){
	var subPath = rootChildren[i];
	subPath
	var file_ = file.split(path.sep);
}


// ----------------------------------------------------------------

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
			results.children.push({'name': file});
		}
	});
	return results;
};

// la fonction originale
// https://gist.github.com/3718809

var res = tree('/home/jokester/Workspace/easydoc/docs');
console.log(res);
console.log(res.children[2].children);
