var Platform = require(appRoot + '/lib/Platform');
var characterize = require('characterize');

module.exports = {
    /**
     * Scan for new games.
     * @constructor
     */
    scan: () => Promise.each(Object.keys(global.config.platforms), alias => {
        var platform = _.pick(global.config.platforms, alias);
        return Platform.scan(platform);
    }),

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
