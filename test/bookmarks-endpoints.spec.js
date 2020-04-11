// imports

const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks-fixtures');

// body

let db;

before('make knex instance', () => {
	db = knex({
		client: 'pg',
		connection: process.env.TEST_DB_URL,
	});
	app.set('db', db);
});

after('disconnect from db', () => db.destroy());

before('initial cleaning of the table before any testing', () =>
	db('bookmarks').truncate()
);

afterEach('cleanup table after each test', () => db('bookmarks').truncate());

describe(`GET /bookmarks`, () => {
	context('Given there are bookmarks in the database', () => {
		const testBookmarks = makeBookmarksArray();

		beforeEach('insert bookmarks', () => {
			return db.into('bookmarks').insert(testBookmarks);
		});

		it('responds with 200 and all of the bookmarks', () => {
			return supertest(app).get('/bookmarks').expect(200, testBookmarks);
		});
	});

	context(`Given no bookmarks`, () => {
		it(`responds with 200 and an emply list`, () => {
			return supertest(app).get('/bookmarks').expect(200, []);
		});
	});
});

describe(`GET /bookmarks/:bookmarks_id`, () => {
	context('Given there are bookmarks in the database', () => {
		const testBookmarks = makeBookmarksArray();

		beforeEach('insert bookmarks', () => {
			return db.into('bookmarks').insert(testBookmarks);
		});

		it('responds with 200 and the specified bookmark', () => {
			const bookmarkId = 2;
			const expectedBookmark = testBookmarks[bookmarkId - 1];
			return supertest(app)
				.get(`/bookmarks/${bookmarkId}`)
				.expect(200, expectedBookmark);
		});
	});

	context(`Given no bookmarks`, () => {
		it(`respond with 404`, () => {
			const bookmarkId = 123456;
			return supertest(app)
				.get(`/bookmarks/${bookmarkId}`)
				.expect(404, { error: { message: `Bookmark doesn't exist` } });
		});
	});
});
