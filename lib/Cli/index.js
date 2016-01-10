var commander = require('commander');
// var Promise = require('bluebird');
var Romulan = require('../../index.js');
var prompt = Promise.promisifyAll(require('prompt'));
var characterize = require('characterize');
var Table = require('./Table');

var Cli = function() {
    /**
     * Builds the command line interpreter and executes based on syntax.
     * @constructor
     */
    this.init = () => {
        this.romulan = new Romulan();

        // commander
        //     .command('move <path> <volume>')
        //     .alias('mv')
        //     .description('move a path to a volume')
        //     .action(root.move);

        commander
            .command('setup')
            .description('run the setup process')
            .action(this.setup);

        commander
            .command('scan')
            .description('scan folders for new games')
            .action(this.scan);

        commander
            .command('identify <software>')
            .alias('id')
            .description('Fetch metadata of software')
            .action(this.identify);

        commander
            .command('list')
            .alias('ls')
            .description('list all games in library')
            .action(this.list);

        commander.parse(process.argv);
    }

    // this.move = () => {
    //     console.log('moving..');
    //
    //     this.romulan.move(1, 2)
    //         // .then(console.log);
    // };

    this.setup = () => {
        console.log('setup..');

        this.romulan.setup()
            // .then(console.log);
    };

    this.scan = () => {
        console.log('scanning..');

        return this.romulan.ready
            .then(this.romulan.Software.scan);
    };

    /**
     * Begins interactive process for users to enter or obtain metadata about a
     * particular piece of software.
     * @constructor
     * @param {object} bigGameObj - An object that contans: the basename of the file
     * scanned, its platform (db entry) and its software (db entry)
     */
    this.identify = (softwareId) => {
        return this.romulan.ready
        .then(() => Promise.props({
            software: models.collections.software.findOne(softwareId).populate('platform'),
            // basename: models.collections.software.getFirstFileBasename(softwareId),
            basename: models.collections.software.getFirstFileBasename(softwareId),
        }))
        .tap(nameWithPlatform)
        .then(results => {
            var provider = 'thegamesdb'

            return characterize.find(provider, {
                    name: results.basename,
                    platform: results.software.platform.alias
                })
                .tap(Table.characterize)
                .then(search => promptForChoice()
                    .then(input => {
                        var providerId = search[input.number - 1].id;
                        return this.romulan.Software.identify(provider, providerId, softwareId);
                    }))
        })
        .catch(console.log)
    };


    this.list = () => this.romulan.find()
        .map(game => {
            return Promise.props({
                id: game.id,
                name: game.name,
                platform: models.collections.platform
                    .findOne(game.software[0].platform)
                    .then(platform => platform.name || "unknown")
            })
        })
        .tap(Table.games)
        .catch(console.log);


    this.init();
}

var nameWithPlatform = results => {
    console.log(results.basename, ' - ', results.software.platform.name)
};

module.exports = Cli;

// /**
//  * Prompts the user to enter a name for a given volume
//  * @constructor
//  * @param {object} volumeObj - an entry of a `volume` in the databse
//  */
// function promptForVolumeName(volumeObj) {
//     return new Promise(function(resolve, reject) {
//         console.log(volumeObj);
//
//         return prompt.getAsync(['name'])
//             .then(function(input) {
//                 return models.collections.volume.update(volumeObj.id, input)
//             })
//             .then(resolve)
//             .catch(reject)
//     });
// }

var promptForChoice = prompt.getAsync.bind(null, {
    properties: {
        number: {
            pattern: /^[0-9]*$/,
            message: 'Must be a number',
            required: true
        }
    }
})
