module.exports = {
    identity: 'game',
    attributes: {
        name: {
            'type': 'text',
            unique: true
        },
        software: {
            collection: 'software',
            via: 'games'
        },
        media: {
            collection: 'media',
            via: 'games'
        },
    }
};
