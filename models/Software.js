var path = require('path');

module.exports = {
  identity: 'software',
  attributes: {
    version: {
      'type': 'string',
			required: false,
    },
    uid: {
      'type': 'string',
      required: true,
      minLength: 32,
      maxLength: 32
    },

		// Associations (up)
    games: {
      collection: 'game',
      via: 'software',
      required: false,
    },

    // Associations (down)
    containers: {
      collection: 'path',
      via: 'software',
      required: false,
    },

    filemeta: {
      model: 'filemeta',
      // via: 'software',
      // required: false,
    },

    platform: {
      model: 'platform',
			required: false,
    },

    parent: {
      model: 'software',
			'required': false,
    },
  },

  findWithoutGames: function() {
      return models.collections.software
      .find()
      .populate('games')
      .then(function(software) {
          return _.map(software, function(s) {
              if (_.isEmpty(s.games)) return s;
          });
      });
  },

  getFirstFileBasename: function(id) {
      return models.collections.software
      .findOne(id)
      .then(function(sw) {
          return models.collections.path
          .findOne(sw.filemeta);
      })
      .then(function(pathResult) {
          return path.parse(pathResult.name).name;
      });
  }
};
