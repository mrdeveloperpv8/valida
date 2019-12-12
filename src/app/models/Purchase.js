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

	paymentMethod: {
		type: String,
		required: true,
		default: "Deposito Bancário"
	},

	attachment: {
		type: Boolean,
		default: false
	},

	attachmentBase: {
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

	btcPaymentStatus: {
		type: Number
	},

	btcPaymentId: {
		type: String
	},

	btcPaymentUrl: {
		type: String
	},

	btcTimeExpire: {
		type: Number
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Purchase", PurchaseSchema);
