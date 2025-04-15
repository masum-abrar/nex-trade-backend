import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
//

const transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  // port: 465,
  auth: {
    user: process.env.GMAIL_ID,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  secure: true,
  pool: true,
  service: "gmail",
});

const sendEmail = async (user_email, subject, body) => {
  var mailOptions = {
    from: process.env.GMAIL_ID,
    to: user_email,
    subject: subject,
    //   text: `Hi user, thank you for your order.`,
    html: body,
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return res.status(500).json(jsonResponse(false, error, null));
    } else {
      console.log("Email sent: " + info.response);
      return res.status(200).json(jsonResponse(true, "Email is sent!", null));
    }
  });
};

export default sendEmail;
