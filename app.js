const express = require('express');
const app = express();
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); //always we use this module for secure data
const helmet = require('helmet'); //helmet helps you secure your express apps by setting various HTTP headers .it's not a silver bullet ,but it can help , alwayse use this
const mongoSanitize = require('express-mongo-sanitize'); //Data sanitization basiclly means to clean all the data that comes into the app from the malicious code
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoute');

// 1- GLOBAL MIDDLEWARES   
//Set Security HTTP headers
app.use(helmet());

// Development loggin
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); //create a new morgan logger middleware function using the given format and options.The format argument may be a string of a predefined name.
    // morgan allow us ti easyli log request , errors and more to the cinsole.it's easy to use . but still poweful and customizable
}

// Limite request from same API 
const limiter = rateLimit({ // first of all we need to install a module called express-rate-limit , 
    //this rate Limit cout the request from an IP and if the request more then 100 in per hour then block that user IP
    max: 100, //these two make 100 request per hour
    windowMs: 60 * 60 * 1000, //windos Milisecond
    message: 'Too many request from this IP ,  Please try again in an hour'
})

app.use('/api', limiter);


// Body parser , Reading data from body into  req.body
app.use(express.json({
    limit: '10kb'
})); //middleware

// Data Sanitization against NoSQL query injection , always use this  
app.use(mongoSanitize());

// Data Santization against XSS
app.use(xss()); //this one then clean any user input from malicious HTML code 

// Prevent parameter pollution 
app.use(hpp({
    whitelist: ['duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// Serving static files 
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers)
    next();
})

// -------------------------------------------------------------

// app.get('/' , (req , res)=>{
//     // res.status(200).send('Hello from the server side');

//     res.status(200)
//     .json({message : 'Hello from the server side!' ,
//            app : 'Nature'});//json method send a json file
// });

// app.post('/' , (req , res)=>{
//     res.send('You can post to this endpoint...');
// })

// -------------------------------------------------------------

// 2- ROUTE HANDLERS


// 3 - ROUTES
app.use('/api/v1/tours', tourRouter); //create a middleware for this router that the app khnows this router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Mounting router(these two router called mounting router) should come after the routes

app.all('*', (req, res, next) => {
    // next(err);//anything that include to next function as a argument , then node khnow that is a err , so we never assign a argument in the next excluding when handeling a err

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
})

// Error handling middlware: 

app.use(globalErrorHandler)

module.exports = app;

// -----------APIS and RESETFUL API design------------
// api is a piece of software that can be used by another piece of software , in order to allow appliaction to talk each other 

// CRUD operations : CRUD stand of create , read , update and delet method of http request 
// post :fetch the request data that client send to the server, this one use for create opertation
// get : send a response data that client want to achieve that data , this one use for read operation
// put/patch : these two method are similar to post method but the put method putting data that fetch from client side but patch method getting data and find where are data changed and fetch that , these two use for update operation
// delet : delet method is for deletin data and this one use for delet operation 

