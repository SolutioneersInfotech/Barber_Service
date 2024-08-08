const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Customize error messages for specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error: ' + err.message;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    } else if (err.name === 'MongoError' && err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate key error';
    }

    res.status(statusCode).json({ message });
};

module.exports = errorHandler;