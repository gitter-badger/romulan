module.exports = {
    identity: 'platform',
    attributes: {
        name: {
            'type': 'string',
            'required': false,
            'unique': false
        },
        alias: {
            'type': 'string',
            'unique': true,
            'required': true,
        },
        extensions: {
            'type': 'array',
        },

        // Associations (up)
        software: {
            collection: 'software',
            via: 'platform'
        },
    }
};
