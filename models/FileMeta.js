module.exports = {
    identity: 'filemeta',
    attributes: {
        md5: "string",
        crc32: "string",
        size: "int",

        // Associations (up)
        software: {
            model: 'software',
            // via: 'filemeta'
        },

        // Associations (down)
        paths: {
            collection: 'path',
            via: 'filemeta'
        },
    }
};
