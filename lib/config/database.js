const mongoose = require("mongoose");

exports.connectDatabase = () =>  {
    // Connect to MongoDB database using Mongoose
    mongoose
    .set("strictQuery", false)
    .connect(process.env.MONGOD_URI)
    .then(() => {
        console.log(`Connected to Database`);
    })
    .catch(error => {
        console.log(`Error connecting to the database: ${error}`);
    })
}