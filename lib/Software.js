var Platform = require(appRoot + '/lib/Platform');
var characterize = require('characterize');
var configUser = require(appRoot + '/config.user');

module.exports = {
    scan: x => Promise.each(configUser.platforms, Platform.scan),

    /**
     * Identify a game from a provider.
     * Requires the characterize module
     * @constructor
     */
    identify: (provider, providerId, softwareId) => characterize
        .get(provider, providerId)
        .then(gameMeta => models.collections.game.findOrCreate({
            name: gameMeta.name
        }))
        .then(game => models.collections.software
            .findOne(softwareId)
            .then(function(software) {
                software.games.add(game.id);
                return software.save();
            })
        )
};
