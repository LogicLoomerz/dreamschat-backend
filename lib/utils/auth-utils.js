const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const { TEN, ONE } = require("./status-codes");

exports.isTemporaryEmail = (email) => {
    const temporaryEmailProviders = [
        'yopmail.com',
        'guerrillamail.com',
        'tempmail.com',
        'mailinator.com',
        '10minutemail.com',
        'burnermail.io',
        'fakemailgenerator.com',
        'maildrop.cc',
        'getnada.com',
        'dispostable.com',
        'throwawaymail.com',
        'tempail.com',
        'mytemp.email',
        'mailnesia.com',
        'mailcatch.com',
        'mailnull.com',
        'moakt.com',
        'inboxalias.com',
        'spamgourmet.com',
        'anonemail.net',
    ];

    const domain = email.split('@')[ONE];
    return temporaryEmailProviders.some(provider => domain === provider);
}

exports.hashOrVerifyPassword = (password, hashedPassword) => {
  const saltRounds = TEN;

  return new Promise((resolve, reject) => {
    if (hashedPassword) {
      bcrypt.compare(password, hashedPassword, (error, result) => {
        if (error) {
          reject(`Error comparing passwords: ${error}`);
        } else if (result) {
          resolve('Correct');
        } else {
          resolve('Incorrect');
        }
      });
    } else {
      bcrypt.hash(password, saltRounds, (error, passwordHashed) => {
        if (error) {
          reject(`Error hashing password: ${error}`);
        } else {
          resolve(passwordHashed);
        }
      });
    }
  });
};

exports.generateToken = (_id, isNewUser = false) => {
  const expirationDate = new Date();
  const expirationTime = 60;
  expirationDate.setMinutes(new Date().getMinutes() + expirationTime);
  return jwt.sign(
    { _id, expirationDate, isNewUser }, process.env.JWT_KEY
  );
}

exports.getTransport = () =>
  nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    },
  });

exports.getMailOptions = (email, firstName, link) => {
  let body = `
  <h3>Hey Dreamer ${firstName ?? '!'}</h3>
  <p>You requested for a password change and we sent you a link for that. Please ignore if you did not.</p>
  <p><a href='${link}'>Click here</a> to change your password.</p>
  <p>Kindly note that this link expires in 1 hour.</p>
  <p>Dream on!</p>
  <p>The DreamsChat Team!</p>`;

  return {
    body,
    from: process.env.EMAIL_ADDRESS,
    subject: 'Reset Password',
    html: body,
    to: email
  };
};