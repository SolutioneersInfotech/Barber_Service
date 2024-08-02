const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Make sure to import jsonwebtoken
const FormDataModel = require('../models/FormData');

const home = async (req, res) => {
    try {
        res.status(200).send('Welcome to barber home page');
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal Server Error');
    }
}

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await FormDataModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json("Already registered");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new FormDataModel({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({
            msg: "Registered successfully",
            token: await user.generateToken(),
            userId: user._id.toString(),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal Server Error');
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await FormDataModel.findOne({ email });
        if (!user) {
            return res.status(404).json('User not found');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json('Incorrect password');
        }
        
        res.status(200).json({
            msg: "Login successfully", 
            token: await user.generateToken(),
            userId: user._id.toString(),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal Server Error');
    }
};

module.exports = { register, login, home };






// const bcrypt = require('bcryptjs');
// const FormDataModel = require('../models/FormData');

// const home=async(req,res)=>{
//     try {
//         res.status(200).send('Welcome to barber home page');
//     } catch (error) {
//         console.log(error);
//     }
// }


// const register = async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         const existingUser = await FormDataModel.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json("Already registered");
//         }

//         // const hashedPassword = await bcrypt.hash(password, 10);
//         // const user = new FormDataModel({ name, email, password: hashedPassword });
//         // await user.save();
//         const userCreated=await FormDataModel.create({
//             name,
//             email,
//             password,
//         });

//         res.status(201).json({
//             msg:"Registered_successfully", 
//             token:await userCreated.generateToken(),
//         userId: userCreated._id.toString(),
//     });
//     } catch (error) {
//         res.status(500).json('Internal Server Error');
//     }
// };

// const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await FormDataModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json('User not found');
//         }

//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json('Incorrect password');
//         }
        
//         res.status(201).json({
//             msg:"Login_successfully", 
//             token:await user.generateToken(),
//             userId: user._id.toString(),
        
//         });
//     } catch (error) {
//         res.status(500).json('Internal Server Error');
    
//     }
// };

//  module.exports = { register, login ,home};


// const bcrypt = require('bcryptjs');
// const FormDataModel = require('../models/FormData');

// const register = async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         // Check if user already exists
//         const existingUser = await FormDataModel.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json("Already registered");
//         }

//         // Hash the password before saving it
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new FormDataModel({ name, email, password: hashedPassword });
//         await user.save();

//         res.status(201).json("Registered successfully");
//     } catch (error) {
//         console.error('Registration error:', error);  // Log the error for debugging
//         res.status(500).json('Internal Server Error');
//     }
// };

// const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Find user by email
//         const user = await FormDataModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json('User not found');
//         }

//         // Compare the provided password with the hashed password
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json('Incorrect password');
//         }

//         res.json("Success");
//     } catch (error) {
//         console.error('Login error:', error);  // Log the error for debugging
//         res.status(500).json('Internal Server Error');
//     }
// };

// module.exports = { register, login };


// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');  // Import the jsonwebtoken package
// const FormDataModel = require('../models/FormData');

// const register = async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         // Check if user already exists
//         const existingUser = await FormDataModel.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json("Already registered");
//         }

//         // Hash the password before saving it
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new FormDataModel({ name, email, password: hashedPassword });
//         await user.save();

//         res.status(201).json("Registered successfully");
//     } catch (error) {
//         console.error('Registration error:', error);  // Log the error for debugging
//         res.status(500).json('Internal Server Error');
//     }
// };

// const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Find user by email
//         const user = await FormDataModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json('User not found');
//         }

//         // Compare the provided password with the hashed password
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json('Incorrect password');
//         }

//         // Generate a JWT token
//         const token = jwt.sign(
//             { id: user._id, email: user.email },  // Payload
//             'Wdfd55sdsf',  // Replace with your secret key
//             { expiresIn: '1h' }  // Token expiration time
//         );



//         res.json({ token },'login suceesfully');  // Send the token to the client
//     } catch (error) {
//         console.error('Login error:', error);  // Log the error for debugging
//         res.status(500).json('Internal Server Error');
//     }
// };

// module.exports = { register, login };






// const jwt = require('jsonwebtoken');
// const FormDataModel = require('../models/FormData');
// require('dotenv').config(); // Load environment variables

// // User Registration
// const register = async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         // Check if user already exists
//         const existingUser = await FormDataModel.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ error: "User already registered" });
//         }

//         // Create and save the new user
//         const user = new FormDataModel({ name, email, password });
//         await user.save();

//         res.status(201).json({ message: "Registered successfully" });
//     } catch (error) {
//         console.error('Registration error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// // User Login
// const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Find user by email
//         const user = await FormDataModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Compare provided password with stored hashed password
//         const isMatch = await user.compare(password);
//         if (!isMatch) {
//             return res.status(401).json({ error: 'Incorrect password' });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             { id: user._id, email: user.email },
//             process.env.JWT_SECRET, // Secret key from environment variables
//             { expiresIn: '1h' }    // Token expiration time
//         );

//         res.json({ token });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// module.exports = { register, login };


