const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj , ...allowedFields)=>{
    const newObj = {};

    Object.keys(obj).forEach(el =>{
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })

    return newObj
}

exports.getAllUsers =catchAsync(async(req , res)=>{
    const users = await User.find();

    res.status(200).json({
        status : 'Success', 
        results : users.length,
        data : {
            users
        }
    })
})

exports.updateMe = catchAsync(async(req , res , next)=>{

    // 1) create error if user POSTs password data 
    if(req.body.password || req.body.passwordConfrim){
        return next(new AppError('This route is not password updates . Please used /updateMyPassword' , 400));
    }

    // 2) filtered out unwanted fieldas names that are not allowed to be update
    const filterdBody = filterObj(req.body , 'name' , 'email'); //all body filterd except name and email
    
    // 3) Update user document  
    const updateUser = await User.findByIdAndUpdate(req.user.id , filterdBody , {
        new : true , 
        runValidators : true
    })

    res.status(200).json({
        status : 'Success',
        data : {
            user : updateUser
        }
    })
})


exports.deletMe  = catchAsync(async (req , res , next)=>{
    await User.findByIdAndUpdate(req.user.id , {active : false});

    res.status(204).json({
        status : 'Success',
        data : null
    })
})

exports.getUsers = (req , res)=>{
    res.status(500).json({
        status : 'Error',
        message : 'This route is not yet defined'
    })
}
exports.CreateUser = (req , res)=>{
    res.status(500).json({
        status : 'Error',
        message : 'This route is not yet defined'
    })
}
exports.updateUsers = (req , res) =>{
    res.status(500).json({
        status : 'Error',
        message : 'This route is not yet defined'
    })
}
exports.deleteUser =(req , res)=>{
    res.status(500).json({
        status : 'Error',
        message : 'This route is not yet defined'
    })
}