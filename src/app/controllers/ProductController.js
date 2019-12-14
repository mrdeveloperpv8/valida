const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
const User = require("../models/User");

class ProductController {
	async indexByPurchase(req, res) {
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

		const products = await Product.find({
			purchaseReference: req.params.purchase
		});

		return res.json(products);
	}

	async index(req, res) {
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

		const products = await Product.find().populate("usedBy");

		// return res.json(products);
		if (user.noHideCc) {
			return res.json(products);
		} else {
			var listMasked = [];
			products.map(cc => {
				const tamanho = cc.number.length - 4;
				const charString = "*".repeat(tamanho);
				cc.number = cc.number.substring(0, 4) + charString;

				listMasked.push(cc);
			});

			return res.json(listMasked);
		}
	}

	async indexUser(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const products = await Product.find({
			usedBy: req.userId,
			status: "Aprovada"
		}).populate("usedBy");

		return res.json(products);
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

		const cardsExist = await Product.find();

		var cardsArray = [];
		cardsExist.forEach(cc => {
			cardsArray.push(cc.number);
		});

		const { cards } = req.body;
		var cardLines = cards.split("\n");

		for (let i = 0; i < cardLines.length; i++) {
			if (cardLines[i].length < 10) {
				continue;
			}

			var [number, month, year, cvv] = cardLines[i].split("|");

			var flag = "-";

			switch (true) {
				case /^4\d{12}(\d{3})?$/.test(number):
					flag = "visa";
					break;
				case /^(5[1-5]\d{4}|677189)\d{10}$/.test(number):
					flag = "mastercard";
					break;
				case /^3(0[0-5]|[68]\d)\d{11}$/.test(number):
					flag = "diners";
					break;
				case /^6(?:011|5[0-9]{2})[0-9]{12}$/.test(number):
					flag = "discover";
					break;
				case new RegExp(
					`/^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})$/`
				).test(number):
					flag = "elo";
					break;
				case /^3[47]\d{13}$/.test(number):
					flag = "amex";
					break;
				case /^(?:2131|1800|35\d{3})\d{11}$/.test(number):
					flag = "jcb";
					break;
				case /^(5078\d{2})(\d{2})(\d{11})$/.test(number):
					flag = "aura";
					break;
				case /^(606282\d{10}(\d{3})?)|(3841\d{15})$/.test(number):
					flag = "hipercard";
					break;
				case new RegExp(
					`/^(?:5[0678]\d\d|6304|6390|67\d\d)d{8,15}$/`
				).test(number):
					flag = "masestro";
					break;
			}

			if (year.length == 2) {
				year = "20" + year;
			}

			const dup = await Product.find({ number: number });

			if (!dup.length > 0) {
				Product.create({
					flag,
					number,
					month,
					year,
					cvv,
					status: "Disponivel"
				});
			}
		}

		return res.json({ finish: "ok" });
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

	async deleteRefused(req, res) {
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

		await Product.deleteMany({ status: "Recusada" });

		return res.send("ok");
	}

	// async fix(req, res) {
	// 	await Product.updateMany(
	// 		{
	// 			usedDate: {
	// 				$gte: new Date("2019-12-13T00:00:00"),
	// 				$lt: new Date("2019-12-13T23:00:00")
	// 			}
	// 		},
	// 		{ status: "Disponivel" }
	// 	);

	// 	return res.send("ok");
	// }
}

module.exports = new ProductController();
