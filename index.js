#!/usr/bin/env node

var Waterline = require('waterline');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
var prompt = Promise.promisifyAll(require('prompt'));
var Table = require('cli-table');
var commander = require('commander');
var characterize = require('characterize');

var winVolumes = require('./utilities/win-volume');
var configWaterline = require('./config/waterline');
var Scan = require('./utilities/scan').Scan;
var getMd5 = require('./utilities/scan').getMd5;

global.models = null;
global._ = require('lodash');

// Instantiate a new instance of the ORM
var orm = new Waterline();
var table = new Table();
Promise.promisifyAll(orm);

//////////////////////////////////////////////////////////////////
// WATERLINE
//////////////////////////////////////////////////////////////////

function addToOrm(model) {
    var model = require('./models/' + model);
    model.connection = 'myLocalDisk';
    orm.loadCollection(Waterline.Collection.extend(model));
}

function initializeOrm() {
    return orm.initializeAsync(configWaterline)
    .then(function(m) {
        global.models = m;
        return Promise.resolve(models);
    });
}

//////////////////////////////////////////////////////////////////
// LOCAL
//////////////////////////////////////////////////////////////////

function showData(results) {
    return models.collections.filemeta
        .find()
        .then(console.log);
}

//////////////////////////////////////////////////////////////////
// VOLUME
//////////////////////////////////////////////////////////////////

function createVolumes(obj) {
    return winVolumes.getVolumes().each(function(vol) {
        return models.collections.volume
            .findOrCreate({guid: vol.guid}, vol)
    })
}

//////////////////////////////////////////////////////////////////
// PLATFORM
//////////////////////////////////////////////////////////////////

function findOrCreatePlatforms(obj) {
    var configPlatforms = require('./config/platforms');

    return Promise.each(configPlatforms, function(platform) {
        return models.collections.platform
            .findOrCreate({alias: platform.alias}, platform)
    })
}

//////////////////////////////////////////////////////////////////
// FILES
//////////////////////////////////////////////////////////////////

function linkFilemetaSoftwarePlatform(platformResult, fileMetaResult) {
    return models.collections.software
    .findOrCreate({uid: fileMetaResult.md5})
    .then(function(softwareRecord) {
        softwareRecord.filemeta = fileMetaResult.id;
        softwareRecord.platform = platformResult.id;
        return softwareRecord.save();
    });
}

function linkPathFileMeta(path) {
    return models.collections.path.getFullPath(path.id)
    .then(getMd5)
    .then(function(md5Result) {
        return models.collections.filemeta
        .findOrCreate({md5: md5Result}, {md5: md5Result})
    });
}

function linkVolumePath(result) {
    myPath = winVolumes.fileInfo(result.fullpath);
    return models.collections.path
    .createPathWithVolumeGuid(myPath.path, myPath.guid);
}

function refreshLibrary() {
    var configUser = require('./config.user');

    return Promise.each(configUser.platforms, function(platformUser) {
        return models.collections.platform
        .findOne({alias: platformUser.alias})
        .then(function(platformResult) {
            return new Scan(platformUser.path, platformResult.extensions)
            .then(_.compact)
            .map(linkVolumePath)
            .map(linkPathFileMeta)
            .map(linkFilemetaSoftwarePlatform.bind(null, platformResult));
        });
    });
};

function createPaths(name, volumeGuid) {
    var platform = {
      name: name,
      volume: volumeGuid
    }

    return models.collections.path
    .findOrCreate({name: platform.path}, platform);
};

function findSoftwareWithoutGames() {
    return models.collections.software
    .findWithoutGames()
    .map(function(sw) {
        if (!_.isEmpty(sw)) {
            return Promise.props({
                basename: models.collections.software.getFirstFileBasename(sw.id),
                software: sw,
                platform: models.collections.platform.findOne(sw.platform),
            });
        }
        return Promise.resolve();
    })
    .then(_.compact);
}

function linkSoftwareToGames(results) {
    if (!_.isEmpty(results)) {
        return Promise.mapSeries(results, promptForNameFromFile);
    }
    else {
        return Promise.resolve();
    }
}

function resultsToTable(item) {
    var table = new Table();

    _.map(item, function(o, i) {
        o.name = (o.name == null) ? o.name : "Unknown"
        table.push([i+1, toPercent(o.score), o.name]);
    });

    return Promise.resolve(table);
}

function toPercent(num) {
    return (num * 100).toFixed(0) + "%";
}

function characterizeToGame(bigGameObj, gameResult) {
    return models.collections.software
    .findOne(bigGameObj.software.id)
    .then(function(software) {
        software.games.add(gameResult.id);
        return software.save()
    })
};

function processUserSelection(characterizeSearchResults, bigGameObj, input) {
    if(!_.isEmpty(input.number)) {
        var id = characterizeSearchResults[input.number - 1].id;

        return characterize.get('thegamesdb', id)
        .then(function(gameMeta) {
            return models.collections.game.findOrCreate({name: gameMeta.name});
        })
        .then(characterizeToGame.bind(null, bigGameObj))
    }
    else {
        return Promise.resolve();
    }
}

function showTable(data) {
    return resultsToTable(data)
    .then(function(table) {
        console.log(table.toString());
        return Promise.resolve(data);
    });
}

function promptForNameFromFile(bigGameObj) {
    return new Promise(function(resolve, reject) {
        console.log(bigGameObj.basename, ' - ', bigGameObj.platform.name);

        return characterize.find('thegamesdb', {
            name: bigGameObj.basename,
            platform: bigGameObj.platform.alias
        })
        .then(showTable)
        .then(function(characterizeSearchResults) {
            return prompt.getAsync(['number'])
            .then(processUserSelection.bind(null, characterizeSearchResults, bigGameObj))
            .then(resolve)
            .catch(reject)
        })
        .catch(reject)
    });
}

function setup() {
    return createVolumes()
    .then(findOrCreatePlatforms)
}

function find() {
    games = models.collections.game
    .find()
    .populate('software')

    return Promise.each(games, function(game) {
        return Promise.all([
            game.id,
            game.name,
            models.collections.platform.findOne(game.software[0].platform).then(function(platform) { return platform.name})
        ])
        .then(function(results) {
            // TODO: quickfix name hack
            // Table() wiggs out if cell is null
            results[1] = results[1] || "unknown" ;
            table.push(results);
            return Promise.resolve();
        })
    })
}

//////////////////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////////////////

function bigInit() {
    return fs.readdirAsync('./models')
    .each(addToOrm)
    .then(initializeOrm)
}

function main() {
    commander
    .command('scan [platform]')
    .description('Scan library for new games')
    .action(function(env, options){
        return setup()
        .then(refreshLibrary)
        .then(findSoftwareWithoutGames)
        .then(linkSoftwareToGames)
    });

    commander
    .command('list [platform]')
    .description('List games in library')
    .action(function(env, options) {
        find()
        .then(function() {
            console.log(table.toString());
        });
    });

    commander.parse(process.argv);
}


bigInit()
.then(main)
