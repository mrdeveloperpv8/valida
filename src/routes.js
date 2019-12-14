const express = require("express");
const routes = express.Router();

const authMiddleware = require("./app/middlewares/auth");

const controllers = require("./app/controllers");

routes.get("/", (req, res) => {
	res.send("Boy.Store - Welcome !");
});

routes.post("/user", controllers.UserController.store);
routes.post("/user/authenticate", controllers.SessionController.store);
routes.post("/user/validate-token", controllers.SessionController.verifyToken);

routes.put("/user", authMiddleware, controllers.UserController.store);
routes.get(
	"/checkPremium",
	authMiddleware,
	controllers.UserController.checkPremium
);

routes.post(
	"/test",
	authMiddleware,
	controllers.TesteController.test.bind(controllers.TesteController)
);

routes.post("/active/:id", authMiddleware, controllers.UserController.active);
routes.post("/premium/:id", authMiddleware, controllers.UserController.premium);
routes.post(
	"/updateBalance",
	authMiddleware,
	controllers.UserController.updateBalance
);
routes.post("/user/verify", authMiddleware, controllers.UserController.verify);
routes.get("/user", authMiddleware, controllers.UserController.index);
routes.delete("/user/:id", authMiddleware, controllers.UserController.delete);
routes.get(
	"/userAmmount/:id",
	authMiddleware,
	controllers.UserController.ammount
);

routes.get("/logout", controllers.UserController.logout);

routes.get(
	"/products/:purchase",
	authMiddleware,
	controllers.ProductController.indexByPurchase
);

routes.get(
	"/refusedList",
	authMiddleware,
	controllers.ProductController.refusedList
);

routes.get(
	"/productsUser",
	authMiddleware,
	controllers.ProductController.indexUser
);

routes.get(
	"/totalizadores",
	authMiddleware,
	controllers.UserController.totalizadores
);

routes.get("/products", authMiddleware, controllers.ProductController.index);

routes.post("/products", authMiddleware, controllers.ProductController.store);

routes.post(
	"/productsRefused",
	authMiddleware,
	controllers.ProductController.deleteRefused
);

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

routes.delete(
	"/purchase/:id",
	authMiddleware,
	controllers.PurchaseController.delete
);

routes.post(
	"/purchase/:showcase",
	authMiddleware,
	controllers.PurchaseController.store
);

routes.post("/base64", authMiddleware, controllers.PurchaseController.base64);

routes.post(
	"/purchase",
	authMiddleware,
	controllers.PurchaseController.storeShowcase
);

routes.post(
	"/cancelPurchase/:id",
	authMiddleware,
	controllers.PurchaseController.cancelPurchase
);

routes.post(
	"/sendAttachment/:id",
	authMiddleware,
	controllers.PurchaseController.sendAttachment
);

routes.put(
	"/purchase/:id",
	authMiddleware,
	controllers.PurchaseController.update
);

routes.post(
	"/status/:id",
	authMiddleware,
	controllers.PurchaseController.status
);

routes.put(
	"/purchaseClient/:id",
	authMiddleware,
	controllers.PurchaseController.updateClient
);

routes.get("/bank", authMiddleware, controllers.BankController.index);
routes.get("/bankMain", authMiddleware, controllers.BankController.bankMain);
routes.post("/bank", authMiddleware, controllers.BankController.store);
routes.put("/bank/:id", authMiddleware, controllers.BankController.update);
routes.delete("/bank/:id", authMiddleware, controllers.BankController.delete);
routes.put("/setMain/:id", authMiddleware, controllers.BankController.setMain);

module.exports = routes;
