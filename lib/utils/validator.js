const Joi = require('joi');

const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

exports.signupSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(passwordPattern).required().messages({'string.pattern.base': 'Password must contain at least one number, one uppercase, one lowercase and one special character.'}),
    confirmPassword: Joi.string().min(8).required(),
    terms: Joi.boolean().valid(true).required().messages({'any.only': 'Terms and Conditions must be accepted'})
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(passwordPattern).required().messages({'string.pattern.base': 'Password must contain at least one number, one uppercase, one lowercase and one special character.'})
});

exports.forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

exports.changePasswordSchema = Joi.object({
    password: Joi.string().min(8).required().pattern(passwordPattern).messages({'string.pattern.base': 'Password must contain at least one number, one uppercase, one lowercase and one special character.'}),
    confirmPassword: Joi.string().min(8).required()
});

exports.updateProfileSchema = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    phoneNumber: Joi.string().max(20),
    nickName: Joi.string(),
    // picture: Joi.string().valid('image/jpeg', 'image/jpg', 'image/png'),
    location: Joi.string(),
    bio: Joi.string().max(255),
    facebookLink: Joi.string().uri().custom((value, helpers) => {
        if(!value.includes('facebook.com')) {
            return helpers.error('any.invalid')
        } return value
    }),
    twitterLink: Joi.string().uri().custom((value, helpers) => {
        if(!value.includes('twitter.com')) {
            return helpers.error('any.invalid')
        } return value
    }),
    instagramLink: Joi.string().uri().custom((value, helpers) => {
        if(!value.includes('instagram.com')) {
            return helpers.error('any.invalid')
        } return value
    }),
    linkedinLink: Joi.string().uri().custom((value, helpers) => {
        if(!value.includes('linkedin.com')) {
            return helpers.error('any.invalid')
        } return value
    }),
    youtubeLink: Joi.string().uri().custom((value, helpers) => {
        if(!value.includes('facebook.com')) {
            return helpers.error('any.invalid')
        } return value
    })
})