const crypto = require('crypto') //No nees install
const mongooes = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongooes.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name ']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
    },

    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },

    password: {
        type: String,
        minlength: 8,
        required: [true, 'Please provide a password'],
        select: false // this one never allow to show up 
    },
    passwordConfrim: {
        type: String,
        required: [true, 'Please confrim your password'],
        validate: {
            // This only work on CREATE and  SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type : Boolean,
        default : true , 
        // select : false
    }
});


userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12 
    this.password = await bcrypt.hash(this.password, 12); //if hashing the password with larer than 12 cost , then will take a few time to decoding the password and hashing that because when increase that number , increase the complexity of hashing the password

    // Delete password confrim field
    this.passwordConfrim = undefined;

    next();
})

userSchema.pre(/^find/ ,  function(next){
    // This points to the current query
    this.find({active : { $ne : false }}); 
    next();
})
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {

    return await bcrypt.compare(candidatePassword, userPassword)
}

// ----------------------------IT work but maybe in feuture make a trouble------------------
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimeStamp
    }

    // False means NOT changed
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');//randomBytes give number of character 
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };
  
const User = mongooes.model('User', userSchema);
module.exports = User;