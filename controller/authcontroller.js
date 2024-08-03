const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const FormDataModel = require('../models/FormData.js');
const { validateEmail, validatePhoneNumber } = require('../utils/validators'); // Custom validators

const home = async (req, res) => {
    try {
        res.status(200).send('Welcome to the barber home page');
    } catch (error) {
        console.error('Home route error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const register = async (req, res) => {
    const { email, phone, password } = req.body;

    // Check if all fields are provided
    if (!email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email and phone number
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePhoneNumber(phone)) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }

    try {
        // Check if the user with the same email or phone already exists
        const existingUser = await FormDataModel.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            let message = '';
            if (existingUser.email === email) {
                message += 'Email already registered. ';
            }
            if (existingUser.phone === phone) {
                message += 'Phone number already registered.';
            }
            return res.status(400).json({ error: message.trim() });
        }

        // Hash the password and save the user
        // const hashedPassword = await bcrypt.hash(password, 10);
        // const usercreate = new FormDataModel({ email, phone, password: hashedPassword });
        const usercreate = new FormDataModel({ email, phone, password });

        await usercreate.save();

        // Generate token for the user
        

        res.status(201).json({
            message: 'Registered successfully',
            token: await usercreate.generateToken(),
            userId: usercreate._id.toString(),
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Find the user by email
        const userexist = await FormDataModel.findOne({ email });
        if (!userexist) {
            return res.status(404).json({ error: 'User not found' });
        }

        if(password===userexist.password)
            {
                res.status(200).json({
                message: 'Login successful',
                token:await userexist.generateToken(),
                userId: userexist._id.toString(),
            });

        }
        else{
            res.status(401).json({ error: 'Invalid password' });
        }
        // Check if the password is correct
        // const passwordMatch = await bcrypt.compare(password, userexist.password);
        // if (!passwordMatch) {
            
        //     return res.status(401).json({ error: 'Incorrect password', msg:userexist.password , ps:password});
        // }

        // Generate token for the user
        

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { register, login, home };
