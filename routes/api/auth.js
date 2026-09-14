const express = require('express');
const router = express.Router();
const bcrypt=require('bcryptjs');

const auth = require('../../middleware/auth');
const User = require('../../models/User');

const jwt=require('jsonwebtoken');
const config=require('config');

const { check, validationResult } = require('express-validator');

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        res.json(user);

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});



// @route   POST api/users
// @desc    Register user
// @access  Public

router.post(
    '/',
    [

        check('email', 'Please include a valid email').isEmail(),

        check(
            'password',
            'Please is required'
        ).exists()
    ],

    async (req, res) => {

        console.log(req.body);

        // Check for validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        try {

            // See if user already exists
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid credentials' }]
                });
            }

            const isMatch=await bcrypt.compare(password,user.password);

            if(!isMatch){
                return res.status(400).
                json({errors:[{msg: "Invalid credentials"}]})
            }


            // Return JSON Web Token

            const payload={
                user:{
                    id:user.id
                }
            }

            jwt.sign(payload,config.get('jwtSecret'),{
                expiresIn:36000
            },(err,token)=>{
                if(err) throw err;
                res.json({token})
            });

        } catch (err) {

            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;

