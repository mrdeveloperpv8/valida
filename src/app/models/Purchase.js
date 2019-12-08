const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},

	description: {
		type: String,
		required: true
	},

	purchaser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},

	code: {
		type: String
	},

	price: {
		type: Number,
		required: true
	},

	ammount: {
		type: Number,
		required: true
	},

	available: {
		type: Number
	},

	paymentMethodNumber: {
		type: Number,
		required: true,
		default: 1
	},

	paymentMethod: {
		type: String,
		required: true,
		default: "Deposito Bancário"
	},

	statusNumber: {
		type: Number,
		required: true,
		default: 20
	},

	attachment: {
		type: String
	},

	status: {
		type: String,
		required: true,
		default: "Pendente"
	},

	showcase: {
		type: Boolean,
		required: true,
		default: false
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Purchase", PurchaseSchema);
