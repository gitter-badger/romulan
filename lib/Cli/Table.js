var cliTable = require('cli-table');
var helpers = require(appRoot + '/lib/helpers');

var Table = {};
/**
 * Show an array of cells as an ascii table
 * @param  {array} data array of strings
 * @return {Promise<String>} A promise to the table output.
 */
Table.characterize = function(data) {
    table = new cliTable();

    _.map(data, function(o, i) {
        o.name = o.name || "unknown";
        table.push([i + 1, helpers.percent(o.score), o.name]);
    });

    console.log(table.toString());
}

Table.games = function(data) {
   table = new cliTable();

   _.map(data, function(o, i) {
    //    o.name = o.name || "unknown";
       table.push([o.id, o.name, o.platform]);
   });

   console.log(table.toString());
}

module.exports = Table;
