var File = require(appRoot + '/lib/File');
var winVolumes = require(appRoot + '/lib/win-volume');
var helpers = require(appRoot + '/lib/helpers');
var humid = require('humid');

module.exports = {
    setup: () => Promise.each(Object.keys(global.config.platforms), alias => {
        newObj = global.config.platforms[alias];
        newObj.alias = alias;

        return models.collections.platform
            .findOrCreate({
                alias: alias
            }, newObj)
    }),

    scan: function(platform) {
        var alias = _.keys(platform)[0];

        if (!_.has(platform[alias], 'paths')) {
            // console.log('no paths for', alias, 'have been defined')
            return Promise.reject;
        }

        if (alias === "steam-win") {
            return humid.getSteamApps(platform[alias].paths)
                .mapSeries(item => Promise
                    .props({
                        software: models.collections.software.findOrCreate({
                            uid: "steam://rungameid/" + item.appid
                        }),
                        game: models.collections.game.findOrCreate({
                            name: item.name
                        }),
                        platform: models.collections.platform.findOne({
                            alias: alias
                        })
                    })
                    .then(results => {
                        results.software.games.add(results.game.id);
                        results.software.platform = results.platform.id;
                        return results.software
                            .save()
                            .fail(console.log);
                    })
                    .catch(console.log)
                )
        } else {
            var scanFiles = File.scan.bind(null, platform[alias].paths, platform[alias].extensions);
            var platformResult;

            return models.collections.platform
                .findOne({
                    alias: alias
                })
                .then(res => {
                    platformResult = res;
                })
                .then(scanFiles)
                .map(linkVolumePath)
                .map(linkPathFileMeta)
                .map(filemeta => models.collections.software
                    .linkFilemetaPlatform(platformResult, filemeta)
                )
                .catch(console.log);
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
