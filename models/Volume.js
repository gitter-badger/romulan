module.exports = {
  identity: 'volume',
  attributes: {
    guid: {
      'type': 'string',
	 		'required': true,
	 		'unique': true,
    },
    name: {
      'type': 'string',
	 		'required': false,
	 		'unique': false,
    },
    // letter: {
    //   'type': 'string',
    //   // equired': true,
    //   // nique': true,
    // }
  }
};
