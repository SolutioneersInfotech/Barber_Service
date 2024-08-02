// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // Define the schema
// const FormDataSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     }
// });

// // Hash password before saving
// FormDataSchema.pre('save', async function (next) {
//     const user = this;
//     if (!user.isModified('password')) {
//             next();
//     }
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hash_password = await bcrypt.hash(user.password, salt);
//         user.password = hash_password;
//         next();
//     } catch (error) {
//         next(error);
//     }
// });


// //json web token

// FormDataSchema.methods.generateToken= async function(){
//     try {
//         return jwt.sign({
//             userId:this._id.toString(),
//             email:this.email,
            
//         },
//         process.env.JWT_SECRET_KEY,
//         {
//             expiresIn:'30d'
//         }
//     );
//     } catch (error) {
//         console.error(error);
//     }
// }
// // // Method to compare passwords
// // FormDataSchema.methods.comparePassword = async function (candidatePassword) {
// //     try {
// //         return await bcrypt.compare(candidatePassword, this.password);
// //     } catch (error) {
// //         throw new Error('Error comparing passwords');
// //     }
// // };

// // Create and export the model
// const FormDataModel = mongoose.model('User', FormDataSchema);
// module.exports = FormDataModel;


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Ensure this import is present

const FormDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
});

FormDataSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

FormDataSchema.methods.generateToken = async function () {
    try {
        return jwt.sign({
            userId: this._id.toString(),
            email: this.email,
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30d'
        });
    } catch (error) {
        console.error(error);
    }
}

const FormDataModel = mongoose.model('User', FormDataSchema);
module.exports = FormDataModel;
