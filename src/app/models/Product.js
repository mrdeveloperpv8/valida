const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
	flag: {
		type: String,
		required: true
	},

	number: {
		type: Number,
		required: true
	},

	month: {
		type: Number,
		required: true
	},

	year: {
		type: String,
		required: true
	},

	cvv: {
		type: Number,
		required: true
	},

	statusNumber: {
		type: Number,
		required: true,
		default: 0
	},

	status: {
		type: String,
		required: true,
		default: "Disponivel"
	},

	usedBy: {
		type: mongoose.Schema.Types.ObjectId
	},

	usedDate: {
		type: Date
	},

	purchaseReference: {
		type: mongoose.Schema.Types.ObjectId
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Product", ProductSchema);
