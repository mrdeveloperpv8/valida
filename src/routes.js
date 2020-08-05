const express = require("express");
const routes = express.Router();
const controllers = require("./app/controllers");

routes.get("/", (req, res) => {
	res.send("4Tz - Tecnologia é fácil, difícil são as pessoas.");
});

routes.get("/check", controllers.CheckController.validar);

module.exports = routes;
