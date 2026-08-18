const transporter = require("../config/emailConfig");

const sendForgotPasswordEmail = async (req, user, resetLink) => {

  // console.log(user);
  
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Abhaya Password Reset",
    text: "",
    html: `
        <h3>Hello ${user.fullName}</h3>
        <p>Click the link below to reset your password.</p>

        <a href=${resetLink}
    style="display:inline-block;
           background-color:rgb(11, 130, 228);
           color:white;
           padding:12px 24px;
           text-decoration:none;
           border-radius:5px;">
    Reset Password
</a>
        <p>Thank You,</p>
        <p>Team Abhaya</p>`
  });

};

module.exports = sendForgotPasswordEmail;
