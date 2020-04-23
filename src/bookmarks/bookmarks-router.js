// imports

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { isWebUri } = require("valid-url");
const logger = require("../logger");
const xss = require("xss");
const { bookmarks } = require("../store");
const BookmarksService = require("./bookmarks-service");
const path = require("path");

// middleware

const bookmarksRouter = express.Router();
const jsonParser = express.json();

const serializeBookmark = (bookmark) => ({
	id: bookmark.id,
	url: xss(bookmark.url),
	title: xss(bookmark.title),
	description: xss(bookmark.description),
	rating: bookmark.rating,
});

// body

bookmarksRouter
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
		const { title, url, description, rating } = req.body;
		const newBookmark = {
			title,
			url,
			description,
			rating,
		};

		for (const [key, value] of Object.entries(newBookmark))
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
		console.log(newBookmark, "preservice bookmark body");
		BookmarksService.insertBookmark(req.app.get("db"), newBookmark)
			.then((bookmark) => {
				console.log(bookmark, "bookmark promise body");
				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `${bookmark.id}`))
					.json(serializeBookmark(bookmark));
			})
			.catch(next);
	});

bookmarksRouter
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
	})
	.patch(jsonParser, (req, res, next) => {
		const { title, url, description, rating } = req.body;
		const bookmarkToUpdate = {
			title,
			url,
			description,
			rating,
		};

		const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length;
		if (numberOfValues === 0) {
			return res.status(400).json({
				error: {
					message: `Request body must contain either 'title', 'url', 'description' or 'rating'`,
				},
			});
		}

		BookmarksService.updateBookmark(req.app.get("db"), req.params.bookmark_id, bookmarkToUpdate)
			.then((numRowsAffected) => {
				res.status(204).end();
			})
			.catch(next);
	});

module.exports = bookmarkRouter;
