var File = require(appRoot + '/lib/File');
var winVolumes = require(appRoot + '/lib/win-volume');
var helpers = require(appRoot + '/lib/helpers');

module.exports = {
    scan: function(platform) {
        var config = {
            user: require(appRoot + '/config.user'),
            default: require(appRoot + '/config/platforms'),
        };

        if (_.isObject(platform)) {
            var paths;
            var extensions;
            var configPlatform = _.findWhere(config.user.platforms, {
                alias: platform.alias
            });

            if (!_.isEmpty(configPlatform)) {
                paths = configPlatform.paths;
                extensions = _.findWhere(config.default, {
                    alias: platform.alias
                }).extensions;
            }

            var scanFiles = File.scan.bind(null, paths, extensions);
            var platformResult;


            return models.collections.platform
                .findOne({alias: platform.alias})
                .then(res => {
                    platformResult = res;
                })
                .then(scanFiles)
                .map(linkVolumePath)
                .map(linkPathFileMeta)
                .map(filemeta => {
                    return models.collections.software.linkFilemetaPlatform(platformResult, filemeta)
                });
        }
    }
};

function linkPathFileMeta(pathResult) {
    return models.collections.path.getFullPath(pathResult.id)
        .then(helpers.md5)
        .then(function(md5Result) {
            return models.collections.filemeta
                .findOrCreate({
                    md5: md5Result
                }, {
                    md5: md5Result
                })
        })
        .then(function(filemeta) {
            filemeta.paths.add(pathResult.id);
            return filemeta.save();
        })
}

function linkVolumePath(result) {
    if (_.isString(result)) {
        var myPath = winVolumes.fileInfo(result);
        return models.collections.path
            .createPathWithVolumeGuid(myPath.path, myPath.guid);
    }

    return Promise.reject();
}
