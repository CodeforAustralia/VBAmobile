let fs = require('fs');

fs.readFile("./myproject.txt", 'UTF-8', function(err, data) {
	console.log(data);
});