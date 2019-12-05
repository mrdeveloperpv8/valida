const User = require("../models/User");
const authConfig = require("../../config/auth");

class UserController {
	async store(req, res) {
		const { email, nickname, password } = req.body;

		if (await User.findOne({ email })) {
			return res.status(400).json({
				error: "Já existe um usuário com este email."
			});
		}

		if (await User.findOne({ nickname })) {
			return res.status(400).json({
				error: "Já existe um usuário com este nickname."
			});
		}

		const user = await User.create({
			email,
			nickname,
			password,
			balance: 0,
			active: 1,
			level: 1
		});
		return res.json(user);
	}

	async storeGod(req, res) {
		const { email, nickname, password, startUserCode } = req.body;

		if (startUserCode !== authConfig.startUserCode) {
			return res.status(400).json({
				error: "Cadastro não autorizado."
			});
		}

		if (await User.findOne({ email })) {
			return res.status(400).json({
				error: "Já existe um usuário cadastrado com este email."
			});
		}

		if (await User.findOne({ nickname })) {
			return res.status(400).json({
				error: "Já existe um usuário com este nickname."
			});
		}

		const user = await User.create({
			email,
			nickname,
			password,
			balance: 0,
			active: 0,
			level: 1
		});
		return res.json(user);
	}
}

module.exports = new UserController();
