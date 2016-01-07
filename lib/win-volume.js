var exec = require('child_process').exec;
var util = require('util');

function execute(command, callback) {
    exec(command, function(error, stdout, stderr) {
        callback(stdout);
    });
};

function parseGuid(str) {
    return str.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/i)[0];
}

function parsePath(str) {
    return str.slice(48);
}

exports.buildPath = function(guid, path) {
    return util.format('\\\\?\\Volume{%s}\\%s', guid, path);
}

exports.fileInfo = function(path) {
    return {
        guid: parseGuid(path),
        path: parsePath(path),
        letter: null
    };
}

exports.getVolumes = function() {
    return new Promise(function(resolve, reject) {
        var mount_points = [];

        execute("mountvol", function(data) {
            var lines = data.split("\n");
            var i = 0;

            while (i < lines.length) {
                line = lines[i].trim();

                if (_(line).startsWith('\\')) {
                    mount_points.push({
                        "guid": parseGuid(line),
                        "letter": lines[i + 1].trim()
                    });
                }

                i++;
            }

            resolve(mount_points);
        });
    });
};
