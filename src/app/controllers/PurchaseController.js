const Purchase = require("../models/Purchase");
const User = require("../models/User");

class PurchaseController {
	async index(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		let purchases = null;

		if (user.level == 17) {
			purchases = await Purchase.find();
		} else {
			purchases = await Purchase.find({ purchaser: user });
		}

		return res.json(purchases);
	}

	async show(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const purchase = await Purchase.find({
			purchaser: user,
			id: req.params.id
		});

		return res.json(purchase);
	}

	async store(req, res) {
		const user = await User.findById(req.userId);
		const showcase = await Purchase.findById(req.params.showcase);

		if (user.level == 17) {
			const purchase = await Purchase.create(req.body);
			return res.json(purchase);
		}

		if (!user || !showcase) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const dataCode = `${user}-${price}+${ammount}.${Date.now}`;
		const code = await bcrypt.hash(dataCode, 3);

		const { paymentMethodNumber, paymentMethod } = req.body;
		const purchase = await Purchase.create({
			title: showcase.title,
			description: showcase.description,
			purchaser: user,
			code: code,
			price: showcase.price,
			ammount: showcase.ammount,
			available: 0,
			paymentMethodNumber: paymentMethodNumber,
			paymentMethod: paymentMethod,
			statusNumber: 20,
			status: "Pendente",
			showcase: false
		});

		return res.json(purchase);
	}

	async update(req, res) {
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

		const { available, statusNumber, status } = req.body;

		const purchase = await Purchase.findByIdAndUpdate(
			req.params.id,
			{ available, statusNumber, status },
			{ new: true }
		);

		return res.json(purchase);
	}
}

module.exports = new PurchaseController();
