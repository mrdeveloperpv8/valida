const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
const User = require("../models/User");

class ProductController {
	async indexByPurchase(req, res) {
		const products = await Product.find({
			purchaseReference: req.params.purchase
		});

		return res.json(products);
	}

	async indexByUser(req, res) {
		const products = await Product.find({ usedBy: req.params.user });
		return res.json(products);
	}

	async getCc(req, res) {
		// BODY
		// - ammount: 0 - quantidade requisitada de cc
		// - purchase: id da compra que removera credito

		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const amountRequest = req.body.amount;
		const purchase = await Purchase.findById(req.body.purchase);

		if (!purchase) {
			return res.status(400).json({
				error: "Compra não encontrada."
			});
		}

		if (amountRequest > purchase.available) {
			return res.status(400).json({
				error:
					"Os créditos da sua compra não são suficientes para fazer isso."
			});
		}

		if (amountRequest > user.balance) {
			return res.status(400).json({
				error:
					"Parece que você não tem créditos suficientes para fazer isso."
			});
		}

		// BUSCAR QUANTIDADE REQUISITADA DO BANCO DE CC (SEPARAR EM OUTRA FUNÇÃO PARA EFETUAR RECURSIVIDADE)
		//{ CODE HERE }

		// MONTAR METODO PARA TESTAR DE MODO ASINCRONO PARA PODER FAZER O PROMISSE ALL.
		//{ CODE HERE }

		let approvals = 0;

		//REMOVER DISPOISAO DE ALGUMA COMPRA
		//{ CODE HERE }

		//REMOVE CREDITO USER
		await User.findByIdAndUpdate(req.userId, {
			balance: user.balance - approvals
		});

		return res.json({
			data: [
				{ card: "0000000000000000|00|00|000" },
				{ card: "0000000000000000|00|00|000" },
				{ card: "0000000000000000|00|00|000" },
				{ card: "0000000000000000|00|00|000" },
				{ card: "0000000000000000|00|00|000" }
			]
		});
	}

	async store(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		if (user.level !== 17) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const { flag, number, month, year, cvv } = req.body;
		const product = await Product.create({
			flag,
			number,
			month,
			year,
			cvv,
			statusNumber: 0,
			status: "Disponivel"
		});

		return res.json(product);
	}

	async delete(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		if (user.level !== 17) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		await Product.findByIdAndDelete(req.params.id);

		return res.send();
	}
}

module.exports = new ProductController();
