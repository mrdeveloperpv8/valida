const express = require("express");
const routes = express.Router();

const authMiddleware = require("./app/middlewares/auth");

const controllers = require("./app/controllers");

routes.get("/", (req, res) => {
	res.send("Boy.Store - Welcome !");
});

routes.post("/user", controllers.UserController.store);
routes.post("/fusers", controllers.UserController.storeGod);
routes.post("/user/authenticate", controllers.SessionController.store);
routes.post("/user/validate-token", controllers.SessionController.verifyToken);

routes.put("/user", authMiddleware, controllers.UserController.store);
routes.post("/user/verify", authMiddleware, controllers.UserController.verify);
routes.get("/user", authMiddleware, controllers.UserController.index);

routes.get(
	"/products/:purchase",
	authMiddleware,
	controllers.ProductController.indexByPurchase
);

routes.get(
	"/products/:user",
	authMiddleware,
	controllers.ProductController.indexByUser
);
routes.post("/products/", authMiddleware, controllers.ProductController.store);
routes.delete(
	"/products/:id",
	authMiddleware,
	controllers.ProductController.delete
);

routes.get("/purchase", authMiddleware, controllers.PurchaseController.index);
routes.get(
	"/purchaseShowcase",
	authMiddleware,
	controllers.PurchaseController.indexShowcases
);

routes.get(
	"/purchase/:id",
	authMiddleware,
	controllers.PurchaseController.show
);

routes.post(
	"/purchase/:showcase",
	authMiddleware,
	controllers.PurchaseController.store
);

routes.post(
	"/purchase",
	authMiddleware,
	controllers.PurchaseController.storeShowcase
);

routes.put(
	"/purchase/:id",
	authMiddleware,
	controllers.PurchaseController.update
);

module.exports = routes;
