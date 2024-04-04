const nodemailer = require('nodemailer');


const sendEmail = async options => {
  const transporter= nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:"dailyshortsvlogs777@gmail.com",
      pass:"awaiskhaliq12345"
    }
  });
  const mailOptions = {
    from:'dailyshortsvlogs777@gmail.com',
    to:options.email,
    subject:options.subject, 
    text:options.message
  };

 await transporter.sendMail(mailOptions)
}

module.exports = sendEmail