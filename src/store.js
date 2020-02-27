const uuid = require('uuid/v4');

const bookmarks = [
	{
		id: uuid(),
		title: 'thinkful',
		url: 'www.thinkful.com',
		description: 'Think outside the classroom',
		rating: 5,
	},
];

module.exports = { bookmarks };
