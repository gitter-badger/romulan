var Waterline = require('waterline');

// Instantiate a new instance of the ORM
var orm = new Waterline();
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
var appRoot = require('app-root-path');
var config = require(appRoot + '/config/waterline');

Promise.promisifyAll(orm);

//////////////////////////////////////////////////////////////////
// WATERLINE
//////////////////////////////////////////////////////////////////

function addToOrm(model) {
    var model = require(appRoot + '/models/' + model);
    model.connection = 'myLocalDisk';
    orm.loadCollection(Waterline.Collection.extend(model));
}

function initializeOrm() {
    return orm.initializeAsync(config);
}

module.exports = (function() {
    return fs.readdirAsync(appRoot + '/models')
        .each(addToOrm)
        .then(initializeOrm)
        // .then(function() {
        //     return Promise.resolve(orm);
        // })
})();
