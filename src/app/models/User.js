const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth");

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},

	nickname: {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},

	password: {
		type: String,
		required: true
	},

	wpp: {
		type: String,
		required: true
	},

	fbUrl: {
		type: String,
		required: true
	},

	balance: {
		type: Number,
		default: 0
	},

	level: {
		type: Number,
		default: 1
	},

	active: {
		type: Boolean,
		default: false
	},

	premium: {
		type: Boolean,
		default: false
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

UserSchema.pre("save", async function(next) {
	if (!this.isModified("password")) {
		return next();
	}

	this.password = await bcrypt.hash(this.password, 9);
});

UserSchema.methods = {
	compareHash(password) {
		return bcrypt.compare(password, this.password);
	}
};

UserSchema.statics = {
	generateToken({ id }) {
		return jwt.sign({ id }, authConfig.secret, {
			expiresIn: authConfig.ttl
		});
	}
};

module.exports = mongoose.model("User", UserSchema);
