class AppError extends Error{ // appError class inherit from Error
    constructor(message , statusCode){
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this , this.constructor);
    }
}

module.exports = AppError;