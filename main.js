require('dotenv').config()
const oauth2Client = require('./libs/oauth2')
const {template} = require('./views/')
const nodemailer = require('nodemailer')
const {
    GOOGLE_REFRESH_TOKEN,
    GOOGLE_SENDER_EMAIL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET } = process.env;

// set credentials by refresh token
oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

async function sendEmail(to, subject, html) {
    const accesToken = await oauth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: GOOGLE_SENDER_EMAIL,
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            refreshToken: GOOGLE_REFRESH_TOKEN,
            accessToken: accesToken
        }
    });

    transport.sendMail({ to, subject, html });
}

sendEmail('200401141@student.umri.ac.id', 'testing mail from node', template)