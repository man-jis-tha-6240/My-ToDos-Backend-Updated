const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.SECRET_KEY
const fetchUser = require('../middleware/fetchUser')
router.post('/createuser', [
	body('name', 'Enter valid name').isLength({ min: 3 }),
	body('email', 'Enter valid email id').isEmail(),
	body('password', 'Password shoud be alphanumeric and 8 characters long').isAlphanumeric().isLength({ min: 8 })
], async (req, res) => {
	let success = false;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	try {
		let user = await User.findOne({ email: req.body.email })
		if (user) {
			return res.status(400).json({ error: "a user with this email already exists" })
		}
		const salt = await bcrypt.genSalt(10);
		const secpass = await bcrypt.hash(req.body.password, salt);
		user = await User.create({
			name: req.body.name,
			email: req.body.email,
			password: secpass,
		});
		const data = {
			user: {
				id: user.id
			}
		}
		const authtoken = jwt.sign(data, JWT_SECRET);
		success = true;
		res.json({ success, authtoken });
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Some error occured');
	}

})
router.post('/login', [
	body('email', 'Enter valid email').isEmail(),
	body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
	let success = false;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(500).send({ errors: errors.array() });
	}
	const { email, password } = req.body;
	try {
		let user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json('Please try to login with correct credentials')
		}
		const passwordCompare = await bcrypt.compare(password, user.password);
		if (!passwordCompare) {
			success = false
			return res.status(400).json({ success, error: "Please try to login with correct credentials" });
		}
		const data = {
			user: {
				id: user.id
			}
		}
		const authtoken = jwt.sign(data, JWT_SECRET);
		successs = true;
		res.json({ successs, authtoken });
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Internal server error');
	}
})
router.post('/getuser', fetchUser, async (req, res) => {
	try {
		let userId = req.user.id;
		let user = await User.findById(userId).select('-password')
		res.send(user)
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Internal server error');
	}
})
module.exports = router