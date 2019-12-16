const User = require("../models/User");
const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const authConfig = require("../../config/auth");

class UserController {
	async store(req, res) {
		const { email, nickname, password, wpp, fbUrl } = req.body;

		if (await User.findOne({ email })) {
			return res.status(400).json({
				error: "Já existe um usuário com este email."
			});
		}

		if (await User.findOne({ nickname })) {
			return res.status(400).json({
				error: "Já existe um usuário com este nick."
			});
		}

		const user = await User.create({
			email,
			wpp,
			fbUrl,
			nickname,
			password,
			balance: 0,
			active: 1,
			level: 1
		});
		return res.json(user);
	}

	async logout(req, res) {
		req.userId = null;
		req.headers.authorization = null;

		return res.send("OK");
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

	async totalizadores(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const totalUsers = await User.countDocuments();
		const totalCompras = await Purchase.countDocuments({ showcase: false });
		const totalComprasPagamento = await Purchase.countDocuments({
			showcase: false,
			status: "Pendente"
		});
		const totalAprovada = await Product.countDocuments({
			status: "Aprovada"
		});

		const totalRecusada = await Product.countDocuments({
			status: "Recusada"
		});

		const totalDisponivel = await Product.countDocuments({
			status: "Disponivel"
		});

		return res.json({
			totalAguardadnoPagemento: totalComprasPagamento,
			totalAprovadas: totalAprovada,
			totalRecusadas: totalRecusada,
			totalDisponiveis: totalDisponivel,
			totalCompras: totalCompras,
			totalMembros: totalUsers
		});
	}

	async active(req, res) {
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

		const userFind = await User.findById(req.params.id);

		const userModified = await User.findByIdAndUpdate(
			req.params.id,
			{ active: !userFind.active },
			{
				new: true
			}
		);

		return res.json(userModified);
	}

	async premium(req, res) {
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

		const userFind = await User.findById(req.params.id);

		const userModified = await User.findByIdAndUpdate(
			req.params.id,
			{ premium: !userFind.premium },
			{
				new: true
			}
		);

		return res.json(userModified);
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

	async updateBalance(req, res) {
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

		const { userId, balance } = req.body;

		const userModified = await User.findByIdAndUpdate(userId, {
			balance: balance
		});

		return res.json(userModified);
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

	async checkPremium(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que houve um problema.",
				verify: false
			});
		}

		return res.json({
			verify: user.premium
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

		await Purchase.deleteMany({ purchaser: req.params.id });
		await Product.deleteMany({ usedBy: req.params.id });
		await User.findByIdAndDelete(req.params.id);

		return res.send();
	}
}

module.exports = new UserController();
