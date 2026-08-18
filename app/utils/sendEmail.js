const transporter = require("../config/emailconfig")
const Role = require('../models/role');

const sendEmail = async (req, user, randomPassword) => {

  const role = await Role.findById(user.roleId);

  const verificationLink =
    `http://localhost:3006/auth/login`;

  let emailHtml;

  if (role.roleName === "police") {
    emailHtml = `
    <h1>Welcome to Abhaya</h1>

    <h2 style="color:#28a745;">Congratulations!<h2>

            <p>Your registration has been successfully completed. A warm welcome from the entire team of Abhaya!</p>

            <h2>Your Login Credentials:</h2>

            <p><strong>Email:</strong> ${user.email}</p>

            <p><strong>Password:</strong> ${randomPassword}</p>

            <a href="${verificationLink}"
    style="display:inline-block;
           background-color:rgb(11, 130, 228);
           color:white;
           padding:12px 24px;
           text-decoration:none;
           border-radius:5px;">
    Login To Your Account
</a>

        <p>Thank You,</p>
        <p>Team Abhaya</p>`
  } else {
    emailHtml = `
    <h1>Welcome to Abhaya</h1>

    <h2 style="color:rgb(7, 164, 41);">Congratulations!<h2>

            <p>Your registration has been successfully completed. A warm welcome from the entire team of Abhaya!</p>

            <h2>Your Login Credentials:</h2>

            <p><strong>Email:</strong> ${user.email}</p>

            <a href="${verificationLink}"
    style="display:inline-block;
           background-color:rgb(11, 130, 228);
           color:white;
           padding:12px 24px;
           text-decoration:none;
           border-radius:5px;">
    Login To Your Account
</a>

        <p>Thank You,</p>
        <p>Team Abhaya</p>`
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Verify your account",
    text: "",
    html: emailHtml

  })
}


module.exports = sendEmail;