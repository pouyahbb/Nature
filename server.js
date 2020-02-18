// NOTE FOR OUR package.JSON => if we want run npm with npm run start:prod , then we should install the win-node-env package
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException' , err=>{ //this is for Async function's err
    console.log(err.name , err.message);
    console.log('UNCAUGHT EXCEPTION! 😰 . Shutting down...');
    server.close(()=>{
        process.exit(1);
    })
})

dotenv.config({
    path: './config.env'
})
const app = require('./app');


const DBAtlas = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const DBRobo = 'mongodb://localhost:27017/natours';

//if we want to connect atlas we should write like this :
mongoose.connect(DBAtlas, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('DB connect to atlas'))

// mongoose.connect(DBRobo ,{ //these method always are same so in other project  we can copy there 3 line and replace in the our new project
//     useNewUrlParser : true , 
//     useCreateIndex : true , 
//     useFindAndModify : false
// }).then( ()=>console.log('DB connect to robo!'));

// ------------------Creating a simiple tour model-----------
//go to models/tourModels.js

const port = process.env.PORT || 3000;


// console.log(process.env);

const server = app.listen(port, '127.0.0.1', () => {
    console.log(`Server running on port ${port}`);
});

process.on('unhandledRejection' , err =>{ // this is for sync function's err (uhandle)
    console.log(err.name , err.message);
    console.log(`UNHANDLED REJECTION!😰. Shutting down...`)
    server.close(()=>{
        process.exit(1); // 0 stands for success and 1 stands for uncalled exception
    })
})


// Importing develop data => go to dev-data/data/import-dev-data.js file

// -------Making the better API ---------
//the query string start with ? in the api ==> go to tourController 


// should look 11 in section 11