const express = require("express");
const mongoose = require("mongoose");
const databaseConfig = require("./config/database");
const cors = require("cors");
const bodyParser = require("body-parser");

class App {
	constructor() {
		this.express = express();
		this.isDev = process.env.NODE_ENV !== "production";

		const server = require("http").Server(this.express);
		this.io = require("socket.io")(server);

		this.middlewares();
		this.routes();
	}

	middlewares() {
		this.express.use((req, res, next) => {
			req.io = this.io;
			return next();
		});

		this.express.use(bodyParser.json({ limit: "20mb" }));
		this.express.use(bodyParser.urlencoded({ extended: false }));
		this.express.use(express.json());
		this.express.use(cors());

		var timeout = require("connect-timeout"); //express v4
		this.express.use(timeout(70000));
	}

	routes() {
		this.express.use(require("./routes"));
	}
}

module.exports = new App().express;
