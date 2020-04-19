// imports

const express = require("express");
const {
	v4: uuidv4
} = require("uuid");
const {
	isWebUri
} = require("valid-url");
const logger = require("../logger");
const xss = require("xss");
const {
	bookmarks
} = require("../store");
const BookmarksService = require("./bookmarks-service");

// middleware

const bookmarkRouter = express.Router();
const jsonParser = express.json();

const serializeBookmark = (bookmark) => ({
	id: bookmark.id,
	url: xss(bookmark.url),
	title: xss(bookmark.title),
	description: xss(bookmark.description),
	rating: bookmark.rating,
});

// body

bookmarkRouter
	.route("/")
	.get((req, res, next) => {
		const knexInstance = req.app.get("db");
		BookmarksService.getAllBookmarks(knexInstance)
			.then((bookmark) => {
				res.json(bookmark);
			})
			.catch(next);
	})
	.post(jsonParser, (req, res, next) => {
		const {
			title,
			url,
			description,
			rating
		} = req.body;
		const newBookmark = {
			title,
			url,
			description,
			rating
		};

		for (const [key, value] of Object.entries(newArticle))
			if (value == null)
				return res.status(400).json({
					error: {
						message: `Missing '${key}' in request body`,
					},
				});

		if (!isWebUri(url)) {
			logger.error(`Invalid url '${url}' supplied`);
			return res.status(400).json({
				error: {
					message: `invalid url supplied`,
				},
			});
		}

		if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
			logger.error(`Invalid rating '${rating}' supplied`);
			return res.status(400).json({
				error: {
					message: `Rating must be a number between 0 and 5`,
				},
			});
		}

		BookmarksService.insertBookmark(req.app.get("db"), newBookmark)
			.then((bookmark) => {
				res.status(201).location(`/bookmarks/${bookmark.id}`).json(serializeBookmark(bookmark));
			})
			.catch(next);
	});

bookmarkRouter
	.route("/:bookmark_id")
	.all((req, res, next) => {
		const knexInstance = req.app.get("db");
		BookmarksService.getById(knexInstance, req.params.bookmark_id)
			.then((bookmark) => {
				if (!bookmark) {
					return res.status(404).json({
						error: {
							message: `Bookmark doesn't exist`,
						},
					});
				}
				res.bookmark = bookmark;
				next();
			})
			.catch(next);
	})
	.get((req, res, next) => {
		res.json(serializeBookmark(res.bookmark));
	})
	.delete((req, res, next) => {
		ArticlesService.deleteArticle(req.app.get("db"), req.params.article_id)
			.then(() => {
				res.status(204).end();
			})
			.catch(next);
	});

module.exports = bookmarkRouter;