var winVolumes = require(appRoot + '/lib/win-volume');

module.exports = {
    scan: x => winVolumes.getVolumes()
        .each(vol => models.collections.volume
            .findOrCreate({
                guid: vol.guid
            }, vol)
        )
};
