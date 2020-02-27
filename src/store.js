const { v4: uuidv4 } = require('uuid');

const bookmarks = [
	{
		id: uuidv4(),
		title: 'thinkful',
		url: 'www.thinkful.com',
		description: 'Think outside the classroom',
		rating: 5,
	},
];

module.exports = { bookmarks };
