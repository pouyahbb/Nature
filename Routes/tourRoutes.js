const express = require('express');
const fs = require('fs');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('./../controllers/ReviewController');

const router = express.Router();

// Param middleware
// router.param('id' , tourController.CheckID)//val parameter is the actually holde the id parameter


// These two line code are the same with above router , this is better than above 4,5 lines

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router.route('/')
    .get(authController.protect ,
         tourController.getAllTours)
    .post(tourController.CreateTour);
 
router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.UpdateTour)
    .delete(authController.protect ,
         authController.restrictTo('admin' , 'lead-guide'),
         tourController.DeleteTour);



// Nested routes : POST /tour/2112edwopqs/reviews
                // GET /tour/121wqlsoprt/reviews
                // GET /tour/12290ds/reviews/133rhvbow

router.route('/:tourId/reviews')
            .post(authController.protect ,
            authController.restrictTo('user') , 
            reviewController.createReview)


module.exports = router;