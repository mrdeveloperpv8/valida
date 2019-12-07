const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema({
	bankName: {
		type: String,
		required: true
	},

	agency: {
		type: String,
		required: true
	},

	operation: {
		type: String
	},

	account: {
		type: String,
		required: true
	},

	holder: {
		type: String,
		required: true
	},

	main: {
		type: Boolean,
		required: true,
		default: false
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Bank", BankSchema);
