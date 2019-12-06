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

		const users = await User.find();

		return res.json({ users });
	}

	async ammount(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		return res.json({ ammount: user.balance });
	}

	async verify(req, res) {
		const { id } = req.body;

		const user = await User.findById(id);

		if (!user) {
			return res.status(400).json({
				error: "Parece que houve um problema.",
				verify: false
			});
		}

		return res.json({
			verify: user.level == 17
		});
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
