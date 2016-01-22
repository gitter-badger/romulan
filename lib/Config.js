var configUser = require(path.join(path.datadir('romulan'), '/config'));

var Config = {
    init: (configObject) => {
        global.config = {};
        global.config.platforms = require(appRoot + '/config/platforms');

        if (configObject !== null) {
            global.config = _.merge(
                global.config,
                configObject,
                configUser
            )
        }

        return Promise.resolve();
    }
};


module.exports = Config;
