const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sumi.923@rediffmail.com',
        subject: 'Thanks for Joining in',
        text: `Welcome to app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelationMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sumi.923@rediffmail.com',
        subject: 'We will miss you',
        text: `Thanks, ${name} for being with us. Hope to see you soon.`
    })
}

module.exports = {
    sendWelcomeMail,
    sendCancelationMail
}