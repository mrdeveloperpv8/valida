const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth");

class SessionController {
	async store(req, res) {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({
				error: "Usuário não encontrado."
			});
		}

		if (!(await user.compareHash(password))) {
			return res.status(400).json({
				error: "Senha incorreta."
			});
		}

		if (!user.active) {
			return res.status(400).json({
				error: "Usuário desativado."
			});
		}

		return res.json({
			data: {
				id: user.id,
				nickname: user.nickname,
				level: user.level,
				balance: user.balance,
				email: user.email
			},
			token: User.generateToken(user)
		});
	}

	async verifyToken(req, res) {
		try {
			const token =
				req.body.token ||
				req.query.token ||
				req.headers["authorization"];
			await jwt.verify(token, authConfig.secret);

			res.send({
				valid: true,
				message: "Token is valid"
			});
			return;
		} catch (err) {
			return res.status(401).send({
				valid: false,
				message: "Token not valid"
			});
		}
	}
}

module.exports = new SessionController();
