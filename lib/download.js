var util = require('util')
    http = require('http')
    https = require('https')

function get(url, callback) {
    var maxRedirect = 10;
    var redirects = 0;
    function _get(location) {
        (location.indexOf('https') === 0 ? https : http)
            .get(location, function (res) {
                if(res.statusCode > 300 && res.statusCode <= 308) {
                    // redirection
                    if (redirects > maxRedirect) {
                        callback(new Error('Too many redirects: ' + url ))
                    } else {
                        redirects++;
                        _get(res.headers.location)
                    }
                } else if(res.statusCode === 200) {
                    callback(null, res)
                } else {
                    var e = new Error('Download failed.')
                    e.code = res.statusCode
                    e.url = url
                    e.headers = res.headers
                    callback(e, res)
                }
            })
            .on('error', callback)
    }

    _get(url)
}

function getJson(url, callback) {
    get(url, function (err, res) {
        var json = ''
        res.setEncoding('utf8')
        res.on('data', function (data) {
            json += data
        })
        res.on('end', function () {
            var obj = JSON.parse(json)
            if (err) {
                err.data = obj
                return callback(err)
            } else {
                return callback(null, obj)
            }
        })
        res.on('error', callback)
    })
}

module.exports = {
    get: get,
    getJson: getJson
}