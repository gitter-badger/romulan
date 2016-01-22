module.exports = {
    identity: 'software',
    attributes: {
        version: {
            'type': 'string',
            required: false,
        },
        uid: {
            'type': 'string',
            required: true,
            // minLength: 32,
            // maxLength: 32
        },

        // Associations (up)
        games: {
            collection: 'game',
            via: 'software',
            required: false,
        },

        // Associations (down)
        containers: {
            collection: 'path',
            via: 'software',
            required: false,
        },

        filemeta: {
            model: 'filemeta',
            // via: 'software',
            // required: false,
        },

        platform: {
            model: 'platform',
            required: false,
        },

        parent: {
            model: 'software',
            'required': false,
        },
    },

    moveToVolume: function(softwareObj, volumeObj) {
        return models.collections.filemeta.findOne(softwareObj.filemeta).populate('paths')
            .then(function(filemeta) {
                var oldPath = null;
                var newPath = null;

                console.log(filemeta);

                return models.collections.volume
                    .findOne(filemeta.paths[0].volume)
                    .then(function(volume) {
                        oldPath = path.join(volume.letter, filemeta.paths[0].name);
                        newPath = path.join(volumeObj.letter, filemeta.paths[0].name);
                    })
                    // TODO: Quick hack to get the first path for game
                    // currently doesn not support duplicate files
                    .then(function() {
                        return models.collections.path.update(filemeta.paths[0].id, {
                                volume: volumeObj.id
                            })
                            .then(function() {
                                return Promise.resolve({
                                    old: oldPath,
                                    new: newPath
                                });
                            })
                    })
            })
    },

    findWithoutGames: function() {
        return models.collections.software
            .find()
            .populate('games')
            .then(function(software) {
                return _.map(software, function(s) {
                    if (_.isEmpty(s.games)) return s;
                });
            });
    },

    getFirstFileBasename: function(id) {
        return models.collections.software
            .findOne(id)
            .then(function(sw) {
                console.log(sw)
                return models.collections.path
                    .findOne(sw.filemeta);
            })
            .then(function(pathResult) {
                return global.path.parse(pathResult.name).name;
            })
            .catch(console.log);
    },

    linkFilemetaPlatform(platform, filemeta) {
        return models.collections.software
            .findOrCreate({
                uid: filemeta.md5
            })
            .then(function(software) {
                software.filemeta = filemeta.id;
                software.platform = platform.id;
                return software.save();
            });
    }
};
