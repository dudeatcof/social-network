const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('');
const { check, validatorCheck, validationResult } = require('express-validator');

// Bring in User Model
const User = require('../../models/User')

// @route   POST api/users
// @desc    To register user
// @access  Public
router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
        'password',
        'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
], 
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;

    try {
    // See if user exists
    let user = await User.findOne({ email });

    if(user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Get users gravatar
    const avatar = gravatar.url(email, {
        // size
        s: '200',
        // rating
        r: 'pg',
        // default image
        d: 'mm'
    })

    // Create a new instance of a user - we have to call user.save() in order
    // to save it to the db
    user = new User({
        name,
        email,
        avatar,
        password
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Return jsonwebtoken
    const payload = {
        user: {
            id: user.id
        }
    }

    jwt.sign(payload, )
} catch(err) {
    console.error(err.message);
    res.status(500).send('Server error'); 
}
});

module.exports = router;