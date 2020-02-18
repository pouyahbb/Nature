const fs = require('fs');
const Tour = require('./../models/tourModels');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}


// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )


// exports.CheckID = (req, res, next, val) => {
//     console.log(`Tour id id : ${val}`);
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invali id'
//         })
//     }
//     next();
// } if run this code must run line 8 in tourController

// exports.CheckBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'Fail',
//             message: 'Missing name or price'
//         })
//     }
//     next();
// }

exports.getAllTours = catchAsync(async (req, res , next) => {
      
        // ---------------------------REFRENCE-------------------------------
        // ---------making query string--------
        // console.log(req.query , queryOBJ ); // after the question mark in the api address query string comes in
        // there are two ways to work with querys : 1- Filtering , 2 - use mongoose mthod
        // 1 - use filtering : 

        // const query = await Tour.find({ //give us that tours that have duration = 5 and difficulty = 'easy'
        //     duration: 5,
        //     difficulty: 'easy'
        // });

        // 2 - use mongoose method : 

        // const query = await Tour.find()
        //         .where('duration')
        //         .equals(5)
        //         .where('difficulty')
        //         .equals('easy');//also insted of equals we have a bounch of method like lte , lt ,gte , gt ...

        // ------------------------------------------------------------------

        // EXCUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const tours = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
   
});

exports.getTour =catchAsync(async (req, res , next) => { //:id is a variable that comes with : mark
    
        // let id = req.params.id * 1 //params send back endpoint parameters of URL that here is id . and * 1 automaticlly chang the string in the number    
        const tour = await (await Tour.findById(req.params.id))
        // Tour.findOne({_id : req.params.id})

        if(!tour){
           return next(new AppError('No tour found with that ID' , 404));
        }

        res.status(200).json({
            status: 'Success',
            data: {
                tour
            }
        })
    // const tour = tours.find(el => el.id === id);

    // res.status(201).json({
    //     status: 'Success',
    //     data: {
    //         tour
    //     }
    // })

  
});

exports.CreateTour = catchAsync(async (req, res , next) => {

    // const newTour = new Tour({});
    // newTour.save(); => insted of writing these code we use another way in line 61 - 66
    // const readFile = await fs.readFileSync('.')
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'Success',
        data: {
            tour: newTour
        }
    });
});

exports.UpdateTour = catchAsync(async (req, res , next) => {
    
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!tour){
            return next(new AppError('No tour found with that ID' , 404));
         }
 
        res.status(200).json({
            status: 'Success',
            data: {
                tour
            }
        })
})

exports.DeleteTour = catchAsync(async (req, res , next) => {
        const tour = await Tour.findByIdAndRemove(req.params.id);

        if(!tour){
            return next(new AppError('No tour found with that ID' , 404));
         }
 
        res.status(204).json({
            status: 'Success',
            data: null
        })
})

// --------Aggregration pipeline matching and grouping-------

exports.getTourStats = catchAsync(async (req, res , next) => {
        const stats = await Tour.aggregate([{
                $match: {
                    ratingsAverage: {
                        $gte: 4.5
                    }
                } //match : filters the docs stream to allow only matching docs to pass unmodified into the next pipeline stage
            },
            {
                $group: { //Groups input docs by a specified identifier expression and applies the doc expression,if specified , to each group
                    // _id : '$ratingsAverage' ,
                    // _id : '$difficulty',
                    _id: {
                        $toUpper: '$difficulty'
                    },
                    numTours: {
                        $sum: 1
                    }, //add one to each tours
                    numRating: {
                        $sum: '$ratingsQuantity'
                    },
                    avgRating: {
                        $avg: '$ratingsAverage'
                    },
                    avgPrice: {
                        $avg: '$price'
                    },
                    minPrice: {
                        $min: '$price'
                    },
                    maxPrice: {
                        $max: '$price'
                    }
                }
            },
            {
                $sort: {
                    avgPrice: 1
                }
            }
            // {
            // $match : {_id  :{$ne : 'EASY'} }// ne stands for not equal
            // }
        ])
        res.status(200).json({
            stats: 'Success',
            data: {
                stats
            }
        })
})

exports.getMonthlyPlan = catchAsync(async (req, res , next) => {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([{
                $unwind: '$startDates' //Deconstructs an array field from the input documents to output a doc for each element . Each output docs is the input doc with the value of the array field replaced by the element
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $month: '$startDates'
                    },
                    numTourStarts: {
                        $sum: 1
                    },
                    tours: {
                        $push: '$name'
                    }
                }
            },
            {
                $addFields: {
                    month: '$_id'
                }
            },
            {
                $project: {
                    _id: 0 // this mean the id not show up
                }
            },
            {
                $sort: {
                    numTourStarts: -1 //desending 
                }
            },
            {
                $limit: 12
            }
        ])
        res.status(200).json({
            stats: 'Success',
            data: {
                plan
            }
        })
})