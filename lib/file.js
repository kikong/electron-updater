var fs = process.versions.electron ? require('original-fs') : require('fs'),
	path = require('path'),
	directory = require('./directory.js')

function readJson(name, callback) {
	fs.readFile(name, {encoding: 'utf8'}, function (err, data) {
		if(err) return callback(err)
		try {
			var j = JSON.parse(data)
			callback(null, j)
		} catch (e) {
			callback(e)
		}
	})
}

function writeJson(name, obj, callback) {
	var data = JSON.stringify(obj)
	var dir = path.dirname(name)
	directory.create(dir, function (err) {
		if(err) return callback(err)
		fs.writeFile(name, data, {encoding: 'utf8'}, callback)	
	})
}

function touch(name, callback) {
	var dir = path.dirname(name)
	directory.create(dir, function (err) {
		if(err) return callback(err)
		fs.open(name, 'a', function (err, fd) {
			if(err) return callback(err)
			fs.close(fd, callback)
		})
	})
}

function copy(source, dest, callback) {
	var sourceStream = fs.createReadStream(source)
	var destStream = fs.createWriteStream(dest)
	sourceStream
		.pipe(destStream)
		.on('finish', callback)
}

module.exports = {
	readJson: readJson,
	writeJson: writeJson,
	touch: touch,
	copy: copy
}