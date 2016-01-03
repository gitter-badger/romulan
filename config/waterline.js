//////////////////////////////////////////////////////////////////
// WATERLINE CONFIG
//////////////////////////////////////////////////////////////////

// Require any waterline compatible adapters here
var diskAdapter = require('sails-disk');
var path = require('path-extra');

module.exports = {
  // Setup Adapters
  // Creates named adapters that have have been required
  // TODO: Appname should be retreived from an app variable
  // TODO: Option to specify database location
  adapters: {
    disk: diskAdapter,
  },

  // Build Connections Config
  // Setup connections using the named adapter configs
  connections: {
    myLocalDisk: {
      adapter: 'disk',
      filePath: path.join(path.datadir('romulan'), '/'),
    },
  }
};
