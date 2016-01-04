var Waterline = require('waterline');

// Instantiate a new instance of the ORM
var orm = new Waterline();
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
var config = require('../config/waterline');

Promise.promisifyAll(orm);

//////////////////////////////////////////////////////////////////
// WATERLINE
//////////////////////////////////////////////////////////////////

function addToOrm(model) {
    var model = require('../models/' + model);
    model.connection = 'myLocalDisk';
    orm.loadCollection(Waterline.Collection.extend(model));
}

function initializeOrm() {
    return orm.initializeAsync(config)
        .then(function(m) {
            global.models = m;
            return Promise.resolve(models);
        });
}

module.exports = (function() {
    return fs.readdirAsync('./models')
        .each(addToOrm)
        .then(initializeOrm)
        .then(function() {
            return Promise.resolve(orm);
        })
})();
