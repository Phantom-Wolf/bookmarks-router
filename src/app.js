// imports

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const bookmarkRouter = require("../src/bookmarks/bookmarks-router");
const validateBearerToken = require("./validate-bearer-token");

const app = express();

// middleware
app.use(validateBearerToken);
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

// body

app.use("/api/bookmarks", bookmarkRouter);

app.get("/", (req, res) => {
	res.send("Hello, boilerplate");
});

// error handling

app.use(function errorHandler(error, req, res, next) {
	let response;
	if (NODE_ENV === "production") {
		response = {
			error: {
				message: "server error",
			},
		};
	} else {
		console.log(error);
		response = {
			message: error.message,
			error,
		};
	}
	res.status(500).json(response);
});

module.exports = app;
