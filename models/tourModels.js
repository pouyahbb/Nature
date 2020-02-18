const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], //in this place first elmenet is the state of the method and secound one is an err for this method
        unique: [true, 'This name is duplicated , please choose another name.'],
        trim: true,
        maxlength: [40, 'A tour name must have less or equal 40 characters'],
        minlength: [10, 'A tour name must have more or equal 10 characters']
        // validate :  [validator.isAlpha , 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration.']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size.']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty.'],
        enum: { //if the user put another values except easy , medium , difficulty then get back an err 
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either:easy,medium,difficult'
        }
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price.'],
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Ratting must be above 1.0'],
        max: [5, 'Ratiing must below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: {
        type: String,
        validate: { //VALIDATE is a method in schema that allow us to create a custom validators
            validator: function (val) {
                // this only points to current doc  on NEW document creation
                return val < this.price // 100 < 200
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true, //only works for string and remove all the withe space in the beginning and end of string
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Atour must have aa cover image']
    },
    images: [String], // save the images as an array and type of them are string
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },

    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],

    // guides : Array, => this is for embedding type of model structure 

    // refrencing model of structuring data model
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})



tourSchema.virtual('durationWeeks').get(function () { //Note : in the arrow function this keyword didnt work so when we use this keyword then we use a regular function
    return Math.floor(this.duration / 7);
})

// Virtual populate     
tourSchema.virtual('reviews' , { 
    ref : 'Review',
    foreignField : 'tour',
    localField : '_id',
    justOne : true
})

//Document Middlware : runs before .save() and .create() . but didnt work on the insertMany() , findAndUpdate() , findByIdAndUpdate()
tourSchema.pre('save', function (next) { // in pre middlware save state has to access the next
    // slugify : this module make strings URL-safe , is string that in the url , similar to strip-ansi
    this.slug = slugify(this.name, {
        lower: true
    });
    next();
})

// Document model embedding type
// tourSchema.pre('save' ,async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })


// tourSchema.pre('save' , function(next){
//     console.log('Will save documents ... ');
//     next();
// } )

// tourSchema.post('save' , function(doc , next){//post middlware always has  to access next and doc 
//     console.log(doc);
//     next();
// })


// QUERY MIDDLEWARE : runs before or after the query
// tourSchema.pre('find' , function(next){ 
tourSchema.pre(/^find/, function (next) { //find hook make a query middlware ----- /^find/ means all the method that start with find
    this.find({
        secretTour: {
            $ne: true
        }
    });
    this.start = Date.now();
    next();
})

tourSchema.pre(/^find/, function (next) {
    this.populate({ // lets you reference documents in other collections.
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})


tourSchema.post(/^find/, function (doc, next) {
    console.log(`Query took ${Date.now() - this.start} millisecounds`);
    next()
})

// Aggregation Middlware : runs before and after the aggregation happens
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: {
            secretTour: {
                $ne: true
            }
        }
    });
    console.log(this.pipeline()); //this point to aggregation obj like another middlware
    next();
})

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;