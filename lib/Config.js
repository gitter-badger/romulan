var configPlatforms = require(appRoot + '/config/platforms');
var configUser = require(path.join(path.datadir('romulan'), '/config'));

module.exports = {
    setup: () => {
        global.config = configUser;

        global.config.platforms = _.merge(
            configPlatforms,
            global.config.platforms
        )
    }
};
