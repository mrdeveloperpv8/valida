const Bank = require("../models/Bank");
const User = require("../models/User");

class BankController {
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

		const bank = await Bank.find();

		return res.json(bank);
	}

	async bankMain(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		if (!user.premium) {
			return res.status(400).json({
				error: "Parece que você não pode fazer isso."
			});
		}

		const bank = await Bank.find({ main: true });

		return res.json(bank[0]);
	}

	async update(req, res) {
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

		const bank = await Bank.findByIdAndUpdate(req.params.id, req.body, {
			new: true
		});

		return res.json(bank);
	}

	async store(req, res) {
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

		const { bankName, agency, operation, account, holder } = req.body;
		const bank = await Bank.create({
			bankName,
			agency,
			operation,
			account,
			holder,
			main: false
		});

		return res.json(bank);
	}

	async setMain(req, res) {
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
		// await Bank.updateMany({}, { $set: { main: false } });
		await Bank.updateMany({}, { main: false });
		const bank = await Bank.findByIdAndUpdate(
			req.params.id,
			{ main: true },
			{
				new: true
			}
		);

		return res.json(bank);
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

		await Bank.findByIdAndDelete(req.params.id);

		return res.send();
	}
}

module.exports = new BankController();
