appRoot = require('app-root-path');

var mocha = require('mocha');
var expect = require('chai').expect;
var Promise = require('bluebird');

var Romulan = require(appRoot + '/index');
var romulan;

describe('Romulan', () => {
    describe('Models', () => {
        beforeEach(function(done) {
            romulan = new Romulan({
                database: appRoot + '/.tmp/database.db'
            });

            return romulan.ready.then(done);
        });

        describe('Game model', () => {
            it('should start with 0 entries', () => {
                return romulan.models.collections.game.find()
                    .then(things => expect(things.length).to.equal(0))
            });
        });

        describe('Platform model', () => {
            it('should start with more than 0 entries', () => {
                return romulan.models.collections.platform.find()
                    .then(things => expect(things.length).to.be.above(0))
            });
        });
    });
});
