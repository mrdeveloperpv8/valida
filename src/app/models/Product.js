const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
	flag: {
		type: String,
		required: true
	},

	number: {
		type: String,
		required: true
	},

	month: {
		type: String,
		required: true
	},

	year: {
		type: String,
		required: true
	},

	cvv: {
		type: String,
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
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},

	usedDate: {
		type: Date
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Product", ProductSchema);
