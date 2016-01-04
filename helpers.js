var crypto = require('crypto'),
    fs = require('fs');

exports.md5 = function(file) {
    return new Promise(function(resolve, reject) {
        // change the algo to sha1, sha256 etc according to your requirements
        var algo = 'md5';
        var shasum = crypto.createHash(algo);
        var s = fs.ReadStream(file);

        s.on('data', function(d) {
            shasum.update(d);
        });
        s.on('end', function() {
            resolve(shasum.digest('hex'));
        });
        s.on('error', reject);
    });
}

exports.percent = function(num) {
    return (num * 100).toFixed(0) + "%";
}
