var fs = require('fs');
var walk = require('walk');

Promise.promisifyAll(fs);

module.exports = {
    scan: function(paths, exts) {
        return Promise.map(paths, foundPath => {
            return new Promise((resolve, reject) => {
                var scan = new Scan(paths, exts);
                var walker = walk.walk(foundPath, {
                    followLinks: false
                });

                walker.on("file", scan.fileHandler.bind(null, exts));
                walker.on("end", resolve.bind(null,
                    scan.foundFiles
                ));
            });
        })
        .then(_.compact)
        .then(_.flatten);

    }
};


function Scan(platformPath, allowedExtensions) {
    this.foundFiles = [];
    var that = this;

    this.fileHandler = function(allowedExtensions, root, fileStat, next) {
        var fileInfo = {};

        fileInfo['fullpath'] = path.join(root, fileStat.name);
        var ext = getExt(fileInfo.fullpath);

        if (_.contains(allowedExtensions, ext)) {
            that.foundFiles.push(fileInfo['fullpath']);
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
