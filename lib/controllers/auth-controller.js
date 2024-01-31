const { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } = require("../utils/status-codes");
const { isTemporaryEmail, hashOrVerifyPassword, generateToken, getMailOptions, getTransport } = require("../utils/auth-utils");
const { userModel } = require("../models/user-model");
const { forgotPasswordSchema, loginSchema, signupSchema, changePasswordSchema } = require("../utils/validator");

// @route   POST api/v1.0/auth/signup
exports.signup = async (req, res) => {
    const { error, value } = signupSchema.validate(req.body, {abortEarly: false})

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

    let user = await userModel.findOne({email: value.email});

    // Checking if user already exists
    if(user) {
        return res.status(BAD_REQUEST).send({ message: 'Email address is already in use'});
    }

    try {
        // Create new user and save it to database
        user = new userModel({
            email: value.email,
            firstName: value.firstName,
            lastName: value.lastName,
            password: hashedPassword
        });

        await user.save();

    } catch (error) {
        console.error(error);
        return res.status(INTERNAL_SERVER_ERROR).send({message: "Failed to save user"})
    }

    const accessToken = generateToken(user._id, true);

    return res.status(OK).send({message: "User registered successfully", token: accessToken});
}

// @route   POST api/v1.0/auth/login
exports.login = async (req, res) => {
    const { error, value } = loginSchema.validate(req.body, {abortEarly: false});

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

    let user = await userModel.findOne({email: value.email});

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
        const accessToken = generateToken(user._id);
        res.status(OK).send({message: "Successful", token: accessToken})
    } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    }
}

// @route   POST api/v1.0/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    const { error, value } = forgotPasswordSchema.validate(req.body, { abortEarly: false });

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

    const user = await userModel.findOne({ email: value.email });

    if (!user) {
        return res.status(UNAUTHORIZED).send({ message: "User is not registered" });
    }

    try {
        const resetToken = generateToken(user._id);

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

// @route   PUT api/v1.0/auth/change-password
exports.changePassword = async (req, res) => {
    const { error, value } = changePasswordSchema.validate(req.body, {abortEarly: false})

    // If error in form validation
    if(error) {
        let errorMessage = [];
        error.details.forEach(detail => {
            errorMessage.push(detail.message);
        })
        return res.status(BAD_REQUEST).send({ message: errorMessage});
    };

    // Checking that the passwords match
    if(value.password !== value.confirmPassword) {
        return res.status(BAD_REQUEST).send({ message: 'Passwords do not match' })
    };

    const hashedPassword = await hashOrVerifyPassword(value.password);

    const _id = req.user._id;

    let user = await userModel.findOne({_id: _id});

    // Checking if user already exists
    if(!user) {
        return res.status(UNAUTHORIZED).send({ message: 'User is not authorized'});
    }

    try {
        user.password = hashedPassword;

        await user.save()

        return res.status(OK).send({message: "User password changed"});
    } catch (error) {
        console.error(error);
        return res.status(INTERNAL_SERVER_ERROR).send({message: "Internal server error"})
    }
}