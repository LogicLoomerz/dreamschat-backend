const Joi = require("joi");
const { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } = require("../utils/status-codes");
const { isTemporaryEmail, hashOrVerifyPassword, generateToken, getMailOptions, getTransport } = require("../utils/auth-utils");
const { userModel } = require("../models/user-model");

exports.signup = async (req, res) => {
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).pattern(passwordPattern).required().messages({'string.pattern.base': 'Password must contain at least one number, one uppercase, one lowercase and one special character.'}),
        confirmPassword: Joi.string().min(8).required(),
        terms: Joi.boolean().valid(true).required().messages({'any.only': 'Terms and Conditions must be accepted'})
    });

    const { error, value } = schema.validate(req.body, {abortEarly: false})

    // If error in form validation
    if(error) {
        let errorMessage = [];
        error.details.forEach(detail => {
            errorMessage.push(detail.message);
        })
        return res.status(BAD_REQUEST).send({ message: errorMessage});
    }

    // Checking if the email is  from a valid provider
    if(isTemporaryEmail(value.email)) {
        return res.status(BAD_REQUEST).send({message: "Invalid email provider"})
    }

    // Checking that the passwords match
    if(value.password !== value.confirmPassword) {
        return res.status(BAD_REQUEST).send({ message: 'Passwords do not match'})
    }

    const hashedPassword = await hashOrVerifyPassword(value.password);

    let user = await userModel.findById({_id: value.email});

    // Checking if user already exists
    if(user) {
        return res.status(BAD_REQUEST).send({ message: 'Email address is already in use'});
    }

    try {
        // Create new user and save it to database
        user = new userModel({
            _id: value.email,
            firstName: value.firstName,
            lastName: value.lastName,
            password: hashedPassword
        });

        await user.save();

    } catch (error) {
        console.error(error);
        return res.status(INTERNAL_SERVER_ERROR).send({message: "Error while saving user"})
    }

    const accessToken = generateToken(value.email, user, true);

    return res.status(OK).header("Authorization", `Bearer ${accessToken}`).send({message: "User registered successfully", token: `Bearer ${accessToken}`});
}
exports.login = async (req, res) => {
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).pattern(passwordPattern).required().messages({'string.pattern.base': 'Password must contain at least one number, one uppercase, one lowercase and one special character.'})
    });

    const { error, value } = schema.validate(req.body, {abortEarly: false});

    // Check for empty email and password
    if (!value.email || !value.password) {
        return res.status(BAD_REQUEST).send({ message: 'Email and password are required' });
    }

    // If error in form validation
    if(error) {
        let errorMessage = [];
        error.details.forEach(detail => {
            errorMessage.push(detail.message);
        })
        return res.status(BAD_REQUEST).send({ message: errorMessage });
    }

    // Checking if the email is  from a valid provider
    if(isTemporaryEmail(value.email)) {
        return res.status(BAD_REQUEST).send({message: "Invalid email provider"})
    }

    let user = await userModel.findById({_id: value.email});

    try {
        // Checking if user does not exists
        if(!user) {
            return res.status(BAD_REQUEST).send({ message: 'User not found'});
        }

        const hashedPassword = user.password;

        const verifyPassword = await hashOrVerifyPassword(value.password, hashedPassword);

        if(!verifyPassword) {
            return res.status(UNAUTHORIZED).send({ message: 'Wrong password'});
        }
        const accessToken = generateToken(value.email, user);
        res.status(OK).header('Authorization', `Bearer ${accessToken}`).send({message: "Successful", token: `Bearer ${accessToken}`})
    } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    }
}
exports.forgotPassword = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    // If error in form validation
    if (error) {
        let errorMessage = [];
        error.details.forEach(detail => {
            errorMessage.push(detail.message);
        });
        return res.status(BAD_REQUEST).send({ message: errorMessage });
    }

    // Checking if the email is  from a valid provider
    if(isTemporaryEmail(value.email)) {
        return res.status(BAD_REQUEST).send({message: "Invalid email provider"})
    }

    const user = await userModel.findById({ _id: value.email });

    if (!user) {
        return res.status(UNAUTHORIZED).send({ message: "User is not registered" });
    }

    try {
        const resetToken = generateToken(value.email, user);

        const resetLink = `${process.env.FE_HOST}?token=${resetToken}`;

        const mailRequest = getMailOptions(value.email, user.firstName, resetLink);

        await getTransport().sendMail(mailRequest);

        return res.status(OK).send({ message: `Password reset email has been sent.`, sentEmail: true });

    } catch (error) {
        // Add this line before sending the response
        console.log(error);
        return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Failed to send email.', error });
    }
};

