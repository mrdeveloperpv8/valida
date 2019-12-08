const express = require("express");
const mongoose = require("mongoose");
const databaseConfig = require("./config/database");
const cors = require("cors");
const bodyParser = require("body-parser");

class App {
	constructor() {
		this.express = express();
		this.isDev = process.env.NODE_ENV !== "production";

		this.database();
		this.middlewares();
		this.routes();
	}

	database() {
		mongoose.connect(databaseConfig.uri, {
			useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
	}

	middlewares() {
		this.express.use(bodyParser.json({ limit: "20mb" }));
		this.express.use(express.json());
		this.express.use(cors());
	}

	routes() {
		this.express.use(require("./routes"));
	}
}

module.exports = new App().express;
