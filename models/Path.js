module.exports = {
    identity: 'path',
    attributes: {
        name: {
            'type': 'string',
            //unique: true,
        },

        // Associations (up)
        filemeta: {
            model: 'filemeta'
        },

        software: {
            collection: 'software',
            via: 'containers',
        },

        // Associations (down)
        volume: {
            model: 'volume',
        },
    },

    createPathWithVolumeGuid: function(path, volumeGuid) {
        return models.collections.volume
            .findOne({
                guid: volumeGuid
            })
            .then(function(volume) {
                return models.collections.path
                    .findOrCreate({
                        name: path,
                        volume: volume.id
                    })
            })
    },

    getFullPath: function(id) {
        return models.collections.path
            .findOne(id)
            .populate('volume')
            .then(function(result) {
                var fullPath = require('util').format('\\\\?\\Volume{%s}%s', result.volume.guid, result.name);
                return Promise.resolve(fullPath);
            })
    }
};
