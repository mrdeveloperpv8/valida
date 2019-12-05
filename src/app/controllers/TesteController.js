const User = require("../models/User");

class UserController {
	async testar(req, res) {
		return res.json(user);
	}
}

module.exports = new UserController();
