const fs = require('fs').promises;
const path = require('path');
const multer = require('multer')
const { UNAUTHORIZED, BAD_REQUEST } = require("../utils/status-codes");
const { updateProfileSchema } = require("../utils/validator");
const { userModel } = require('../models/user-model');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

exports.updateProfile = upload.single('picture'), async (req, res) => {
    const _id = req.user._id;

    if(!_id) {
        res.status(UNAUTHORIZED).send({message: 'Unauthorized user'});
    }

    const {error, value} = updateProfileSchema.validate(req.body, {abortEarly: false});

    // If error in form validation
    if(error) {
        let errorMessage = [];
        error.details.map(detail => {
            errorMessage.push(detail.message);
        })
        return res.status(BAD_REQUEST).send({ message: errorMessage});
    };

    // Allowed fields for user updates
    const fields = ['firstName', 'lastName', 'nickName', 'phone', 'location', 'bio', 'facebookLink', 'twitterLink', 'instagramLink', 'linkedinLink', 'youtubeLink'];

    const userProfile = {};

    for (const field of fields) {
        if (value[field]) {
            userProfile[field] = value[field]
        }
    }

    try {
        let picture;

        if (req.file) {
            picture = req.file.buffer.toString('base64');
        }

        if (picture) {
            userProfile.picture = picture
        }

        const updatedUser = await userModel.findByIdAndUpdate({_id}, {userProfile}, {new: true})

        if (!updatedUser) {
            return res.status(BAD_REQUEST).send({message: 'User not updated'});
        }

        return res.status(OK).send({message: 'User updated', user: updatedUser});

    } catch (error) {
        console.log(error);
        return res.status(INTERNAL_SERVER_ERROR).send({message: 'Error on the server', error});
    }

}