const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const FormDataSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true, // Ensure this is set to true
        validate: {
            validator: function(v) {
                return v.length === 10; // Validate phone number length
            },
            message: 'Phone number must be 10 digits long.'
        }
    },
    password: {
        type: String,
        required: true,
    }
});

// FormDataSchema.pre('save', async function (next) {
//     const user = this;
//     if (!user.isModified('password')) {
//           next();
//     }
//     try {
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(user.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

FormDataSchema.methods.generateToken = async function () {
    try {
        return jwt.sign(
        {
            userId: this._id.toString(),
            email: this.email,
        },
         process.env.JWT_SECRET_KEY, 
         {
            expiresIn: '30d'
        });
    } catch (error) {
        console.error(error);
    }
}

const FormDataModel = mongoose.model('User', FormDataSchema);
module.exports = FormDataModel;
