#!/usr/bin/env node

global.appRoot = require('app-root-path');
global._ = require('lodash');
global.Promise = require('bluebird');



var Romulan = function() {
    this.ready = Promise;
    this.models = null;
    this.root = this;

    this.Software = require(appRoot + '/lib/Software');
    this.Config = require(appRoot + '/lib/Config');
    this.Volume = require(appRoot + '/lib/Volume');

    this.init = function() {
        return require(appRoot + '/lib/orm').then(m => {
            global.models = this.models = m;
        });
    };

    // /**
    //  * Move software to a different volume
    //  * @constructor
    //  */
    this.move = function(pathId, volumeId) {
        return this.ready.return('not implimented..');

        // function moveGame(softwareId, volumeName) {
        //     return Promise.all([
        //             models.collections.software.findOne(softwareId),
        //             models.collections.volume.findOne({
        //                 name: volumeName
        //             }),
        //         ])
        //         .spread(models.collections.software.moveToVolume)
        //         .then(function(results) {
        //             // TODO: Move the file BEFORE changing the DB
        //             return new Promise(function(resolve, reject) {
        //                 // Do no overwrite the file!
        //                 if (results.old == results.new) return reject(new Error);
        //
        //                 var destDir = path.dirname(results.new);
        //                 var source = fs.createReadStream(results.old);
        //                 if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);
        //                 var dest = fs.createWriteStream(results.new);
        //
        //                 source.pipe(dest);
        //                 source.on('end', resolve);
        //                 source.on('error', reject);
        //             })
        //         });
        // }
    };

    /**
     * Build database from semi-constants from the host (such as connected disk
     * devices) and the default configuration platfrom
     * @constructor
     */
    this.setup = function() {
        return this.ready
            .then(this.Volume.scan)
            .then(this.Config.setup)
            // .then(nameVolumes)
    }

    /**
     * Scan for new games.
     * @constructor
     */
    this.scan = function() {
        var configUser = require(appRoot + '/config.user');

        return this.ready
            .then(this.Software.scan);
    };

    /**
     * Find all games.
     * @constructor
     */
    this.find = function() {
        return this.ready
            .then(() => {
                return models.collections.game
                    .find()
                    .populate('software')
            });
    }

    this.ready = this.init();
}

module.exports = Romulan;
