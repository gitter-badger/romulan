"use strict";

var fs      = require('fs'),
    Promise = require('bluebird'),
    walk    = require('walk'),
    _       = require('lodash'),
    crypto  = require('crypto'),
    path    = require('path');

Promise.promisifyAll(fs);

exports.getMd5 = function(file) {
    return new Promise(function(resolve, reject) {
        // change the algo to sha1, sha256 etc according to your requirements
        var algo = 'md5';
        var shasum = crypto.createHash(algo);
        var s = fs.ReadStream(file);

        s.on('data', function(d) { shasum.update(d); });
        s.on('end', function() {
            resolve(shasum.digest('hex'));
        });
    });
}

exports.Scan = function(platformPath, allowedExtensions) {
    var foundFiles = [];


    function fileHandler(allowedExtensions, root, fileStat, next) {
        var fileInfo = {};

        fileInfo['fullpath'] = path.join(root, fileStat.name);

        // fileInfo['basename'] = getBasename(fileInfo.fullpath);
        // fileInfo['scrubbedname'] = scrubName(fileInfo.basename);
        // fileInfo['ext'] = getExt(fileInfo.fullpath);
        var ext = getExt(fileInfo.fullpath);

        if(_.contains(allowedExtensions, ext)) {
        //       md5(fileInfo.fullpath)
        //       .then(function(md5) {
        //           fileInfo['md5'] = md5;
                  foundFiles.push(fileInfo);
        //       })
        //       .then(next);
        }
        // else {
          next();
        // }
    }

    function getBasename(fullpath) {
        return path.basename(fullpath, path.extname(fullpath))
    }

    function scrubName(basename) {
        return basename.replace(/(?:\ {1,}|[^a-zA-Z0-9])/gi, ' ')
    }

    function getExt(filename) {
        return path.extname(filename).substr(1);
    }

    return new Promise(function(resolve, reject) {
        var walker = walk.walk(platformPath, { followLinks: false });
        walker.on("file", fileHandler.bind(null, allowedExtensions));
        walker.on("end", resolve.bind(null, foundFiles));
    });
};
