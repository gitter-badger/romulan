//////////////////////////////////////////////////////////////////
// WATERLINE CONFIG
//////////////////////////////////////////////////////////////////

// Require any waterline compatible adapters here
var diskAdapter = require('sails-disk');

module.exports = {
  // Setup Adapters
  // Creates named adapters that have have been required
  adapters: {
    disk: diskAdapter,
  },

  // Build Connections Config
  // Setup connections using the named adapter configs
  connections: {
    myLocalDisk: {
      adapter: 'disk'
    },
  }
};
