module.exports = {
    identity: 'media',
    attributes: {
        width: {
            'type': 'int',
            required: false,
            defaultsTo: null,
        },
        height: {
            'type': 'int',
            required: false,
            defaultsTo: null,
        },
        // length: {
        //   'type': 'int',
        // 	required: false,
        //   defaultsTo: null,
        // },
        ratio: {
            'type': 'float',
            required: false,
            defaultsTo: null,
        },
        resolution: {
            'type': 'float',
            required: false,
            defaultsTo: null,
        },
        source: {
            'type': 'url',
            required: false,
            defaultsTo: null,
        },
        type: {
            'type': 'string',
            required: false,
            defaultsTo: null,
        },
        // format: {
        //   'type': 'string',
        // 	required: false,
        //   defaultsTo: null,
        // },

        // Associations (up)
        games: {
            collection: 'game',
            via: 'media',
            required: false,
        },
    }
};
