"use strict";

var fs = require('fs'),
    Promise = require('bluebird'),
    walk = require('walk'),
    _ = require('lodash'),
    path = require('path');

Promise.promisifyAll(fs);

function Scan(platformPath, allowedExtensions) {
    this.foundFiles = [];
    var that = this;

    this.fileHandler = function(allowedExtensions, root, fileStat, next) {
        var fileInfo = {};

        fileInfo['fullpath'] = path.join(root, fileStat.name);
        var ext = getExt(fileInfo.fullpath);

        if (_.contains(allowedExtensions, ext)) {
            that.foundFiles.push(fileInfo);
        }
        next();
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
};

exports.scan = function(platformPath, allowedExtensions) {
    return Promise.map(platformPath, function(pp) {
        return new Promise(function(resolve, reject) {
            var scan = new Scan(platformPath, allowedExtensions);
            var walker = walk.walk(pp, {
                followLinks: false
            });
            walker.on("file", scan.fileHandler.bind(null, allowedExtensions));
            walker.on("end", resolve.bind(null,
                scan.foundFiles
            ));
        });
    });
};
