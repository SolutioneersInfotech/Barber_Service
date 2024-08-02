const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/db.js');
const errorHandler = require('./middleware/errorhandling.js');
const authRoutes = require('./routes/auth.js');
const otpRoutes = require('./routes/otp_routes.js');
const cookieSession=require('cookie-session')
const passport=require("passport")
const session = require('express-session')
const facebookStrategy=require("passport-facebook").strategy



dotenv.config();
connectDB();

const app = express();

// Middleware for parsing request bodies
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: false })); // Parses URL-encoded bodies

// app.use(
//     cookieSession({
//         name: 'session',
//         keys: ['somecookiesession'],
//         maxAge: 24 * 60 * 60 * 100 // 1 day
//     })
// );

// CORS configuration
// app.use(cors({
//     origin: 'http://localhost:5173',
//     methods: 'GET, POST, PUT, DELETE, PATCH, HEAD',
//     credentials: true,
// }));
// app.use(passport.initialize())
// app.use(passport.session())
// app.use(session({secret:"thisissecretkey"}))

// passport.Strategy(new facebookStrategy({
//     clientID: process.env.FACEBOOK_CLIENT_ID,
//     clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//     callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//     profilefiels:['id','Displayname','name','gender','picture-type(large','email']
//     }, (accessToken, refreshToken, profile, cb) => {
//         console.log(profile)
//         return cb(null, profile);
        
// }))
// Serve static files from the "public" directory
app.use(express.static('public'));

// Middleware for error handling
app.use(errorHandler);


// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
