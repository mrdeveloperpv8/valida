const Purchase = require("../models/Purchase");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Coinpayments = require("coinpayments");

class PurchaseController {
	async index(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		let purchases = null;

		var purchasesBtc = await Purchase.find({
			paymentMethod: "BTC - Bitcoin"
		});

		purchasesBtc.map(async purchase => {
			const client = new Coinpayments({
				key:
					"75a30d14cbe00ee0012dcbbd2df9e8aea4899899e5e8e0739ee076a2ecfba9c1",
				secret:
					"Fc587d2a5724e8E6Ee8Bd130586871058d151343E89F153D03c097A00571f3bE"
			});

			await client
				.getTx({ txid: purchase.btcPaymentId })
				.then(async result => {
					if (result.status == 1) {
						await Purchase.findByIdAndUpdate(purchase._id, {
							status: "Aprovado",
							btcPaymentStatus: result.status
						}).then(async () => {
							const userPurchase = await User.findById(
								purchase.purchaser
							);

							await User.findByIdAndUpdate(userPurchase.id, {
								balance: userPurchase.balance + purchase.ammount
							});
						});
					}

					await Purchase.findByIdAndUpdate(purchase._id, {
						btcTimeExpire: result.time_expires
					});
				});
		});

		if (user.level == 17) {
			purchases = await Purchase.find(
				{
					showcase: false,
					purchaser: { $ne: null }
				},
				{ attachmentBase: 0 }
			).populate("purchaser");
		} else {
			purchases = await Purchase.find(
				{ purchaser: user },
				{ attachmentBase: 0 }
			);
		}

		return res.json(purchases);
	}

	async indexShowcases(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const purchases = await Purchase.find({ showcase: true });
		return res.json(purchases);
	}

	async show(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		var purchasesBtc = await Purchase.find({
			paymentMethod: "BTC - Bitcoin"
		});

		purchasesBtc.map(async purchase => {
			const client = new Coinpayments({
				key:
					"75a30d14cbe00ee0012dcbbd2df9e8aea4899899e5e8e0739ee076a2ecfba9c1",
				secret:
					"Fc587d2a5724e8E6Ee8Bd130586871058d151343E89F153D03c097A00571f3bE"
			});

			await client
				.getTx({ txid: purchase.btcPaymentId })
				.then(async result => {
					if (result.status == 1) {
						await Purchase.findByIdAndUpdate(purchase._id, {
							status: "Aprovado",
							btcPaymentStatus: result.status
						}).then(async () => {
							const userPurchase = await User.findById(
								purchase.purchaser
							);

							await User.findByIdAndUpdate(userPurchase.id, {
								balance: userPurchase.balance + purchase.ammount
							});
						});
					}

					await Purchase.findByIdAndUpdate(purchase._id, {
						btcTimeExpire: result.time_expires
					});
				});
		});

		const purchases = await Purchase.find(
			{
				purchaser: user
			},
			{ attachmentBase: 0 }
		).sort({ createdAt: 1 });

		return res.json(purchases);
	}

	async base64(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const purchase = await Purchase.findById(req.body.purchase);

		return res.json(purchase.attachmentBase);
	}

	async cancelPurchase(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const purchase = await Purchase.findById(req.params.id).populate(
			"purchaser"
		);

		if (user.level !== 17) {
			if (purchase.purchaser.id !== req.userId) {
				return res.status(400).json({
					error: "Parece que você não pode fazer isso."
				});
			}
		}

		const purchasesUpdated = await Purchase.findByIdAndUpdate(purchase.id, {
			status: "Cancelado"
		});

		return res.json(purchasesUpdated);
	}

	async status(req, res) {
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

		var purchase = null;

		switch (req.body.code) {
			case 1:
				{
					purchase = await Purchase.findByIdAndUpdate(req.params.id, {
						status: "Aprovado"
					});

					const userPurchase = await User.findById(
						purchase.purchaser
					);

					await User.findByIdAndUpdate(userPurchase.id, {
						balance: userPurchase.balance + purchase.ammount
					});
				}
				break;
			case 2:
				purchase = await Purchase.findByIdAndUpdate(req.params.id, {
					status: "Recusado"
				});
				break;
		}

		return res.json(purchase);
	}

	async sendAttachment(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const purchase = await Purchase.findById(req.params.id).populate(
			"purchaser"
		);

		if (user.level !== 17) {
			if (purchase.purchaser.id !== user.id) {
				return res.status(400).json({
					error: "Parece que você não pode fazer isso."
				});
			}
		}
		const { attachment } = req.body;

		const purchasesUpdated = await Purchase.findByIdAndUpdate(purchase.id, {
			attachment: true,
			attachmentBase: attachment,
			status: "Analise"
		});

		return res.json(purchasesUpdated);
	}

	async store(req, res) {
		const user = await User.findById(req.userId);
		const showcase = await Purchase.findById(req.params.showcase);

		if (user.level == 17 && !showcase) {
			const purchase = await Purchase.create(req.body);
			return res.json(purchase);
		}

		if (!user && !showcase) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const dataCode = `${user}-${showcase.price}+${showcase.price}.${Date.now}`;
		const code = await bcrypt.hash(dataCode, 3);

		const { paymentMethod } = req.body;

		var btcPaymentId = null;
		var btcPaymentUrl = null;
		var btcPaymentStatus = 0;

		if (paymentMethod == "BTC - Bitcoin") {
			const client = new Coinpayments({
				key:
					"75a30d14cbe00ee0012dcbbd2df9e8aea4899899e5e8e0739ee076a2ecfba9c1",
				secret:
					"Fc587d2a5724e8E6Ee8Bd130586871058d151343E89F153D03c097A00571f3bE"
			});

			const optionsTransaction = {
				currency1: "BRL",
				currency2: "BTC",
				amount: showcase.price,
				buyer_email: user.email,
				address: "12QzCy4Cy6eH8yfSje3oVSBAaqZJMd7hB7"
			};

			await client.createTransaction(optionsTransaction).then(result => {
				btcPaymentId = result.txn_id;
				btcPaymentStatus = 0;
				btcPaymentUrl = result.checkout_url;
			});
		}

		const purchase = await Purchase.create({
			title: showcase.title,
			description: showcase.description,
			purchaser: user,
			code: code,
			price: showcase.price,
			ammount: showcase.ammount,
			available: 0,
			paymentMethod: paymentMethod,
			status: "Pendente",
			showcase: false,
			btcPaymentId: btcPaymentId,
			btcPaymentStatus: btcPaymentStatus,
			btcPaymentUrl: btcPaymentUrl
		});

		return res.json(purchase);
	}

	async storeShowcase(req, res) {
		const user = await User.findById(req.userId);

		const { title, description, price, ammount, paymentMethod } = req.body;

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

		const dataCode = `${user}-${price}+${ammount}.${Date.now}`;
		const code = await bcrypt.hash(dataCode, 3);

		const purchase = await Purchase.create({
			title: title,
			description: description,
			code: code,
			price: price,
			ammount: ammount,
			available: 0,
			paymentMethod: paymentMethod,
			status: "Pendente",
			showcase: true
		});

		return res.json(purchase);
	}

	async updateClient(req, res) {
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

		const { available, status } = req.body;

		const purchase = await Purchase.findByIdAndUpdate(
			req.params.id,
			{ available, status },
			{ new: true }
		);

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

		const purchase = await Purchase.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);

		return res.json(purchase);
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

		await Purchase.findByIdAndDelete(req.params.id);

		return res.send();
	}
}

module.exports = new PurchaseController();
