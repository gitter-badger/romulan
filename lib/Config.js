var configPlatforms = require(appRoot + '/config/platforms');

module.exports = {
    setup: function() {
        return Promise.each(configPlatforms, platform => {
            return models.collections.platform
                .findOrCreate({
                    alias: platform.alias
                }, platform)
        });
    }
};
