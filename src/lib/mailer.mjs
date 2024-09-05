import nodemailer from "nodemailer";
export const sendVerificationEmail = async (email, token, firstname) => {
  const verifyUrl = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${token}`;
  //   console.log(verifyUrl);

  // Create a transporter using SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_APP_PASS,
    },
  });
  // Email data
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "Verify your Greenagrichain account",
    html: `
          <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Greenagrichain Account</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        background-image: url("https://i.postimg.cc/s2cFf0F2/login-bg.jpg");
        background-size: cover;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h1,
      h3 {
        color: #333;
      }
      p {
        color: #555;
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
     <h1>Hello ${firstname},</h1>
      <p>
        You've registered an account on Greenagrichain. Before you can start
        using your account, we need to verify that this email address belongs to
        you.
      </p>
      <p>Please click the button below to verify your account:</p>
      <p>
        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            background-color: #806009;
            color: #fff;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
          "
          >Verify Account</a
        >
      </p>
      <p>
        If you didn't create an account with us, you can safely ignore this
        email.
      </p>
      <h3>
        Kind Regards,<br /><a
          href="${process.env.CLIENT_URL}"
          style="color: #806009; text-decoration: none"
          >Greenagrichain</a
        >
      </h3>
    </div>
  </body>
</html>

        `,
  };
  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully to:" + email);
};
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `https://greenagrichain.com/reset-password?token=${token}`;
  // Create a transporter using SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_APP_PASS,
    },
  });
  // Email data
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "Reset your password",
    text: "Reset your password",
    html: `
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset your password</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f5f5f5;
                      margin: 0;
                      padding: 0;
                  }
                  .container {
                      max-width: 600px;
                      margin: 20px auto;
                      padding: 20px;
                      background-color: #fff;
                      border-radius: 5px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  h1, h3 {
                      color: #333;
                  }
                  p {
                      color: #555;
                  }
                  a {
                      color: #007bff;
                      text-decoration: none;
                  }
                  a:hover {
                      text-decoration: underline;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>Hello ${email},</h1>
                  <p>
                      <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Your Password</a>
                  </p>
                  <p>If you did not request this email, you can safely ignore this email.</p>
                  <h3>Kind Regards,<br><a href="${process.env.CLIENT_URL}" style="color: #007bff; text-decoration: none;">Chatz</a></h3>
              </div>
          </body>
          </html>
        `,
  };
  await transporter.sendMail(mailOptions);
};

export const sendOTPEmail = async (email, otp, firstname) => {
  // console.log("about to send otp to:" + email);
  // console.log("otp:" + otp);
  // console.log("firstname:" + firstname);

  // Create a transporter using SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_APP_PASS,
    },
  });
  // Email data
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "Login OTP",
    text: "Login OTP",
    html: `
          <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Greenagrichain login OTP</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    "
  >
    <div
      style="
        max-width: 680px;
        margin: 0 auto;
        padding: 45px 30px 60px;
        background: #f4f7ff;
        background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
        background-repeat: no-repeat;
        background-size: 800px 452px;
        background-position: top center;
        font-size: 14px;
        color: #434343;
      "
    >
      <header>
        <table style="width: 100%">
          <tbody>
            <tr style="height: 0">
              <td>
                <img
                  alt=""
                  src="https://greenagrichain.com/images/greenagrichain-logo.png"
                  height="120px"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </header>

      <main>
        <div
          style="
            margin: 0;
            margin-top: 70px;
            padding: 92px 30px 115px;
            background: #ffffff;
            border-radius: 30px;
            text-align: center;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto">
            <h1
              style="
                margin: 0;
                font-size: 24px;
                font-weight: 500;
                color: #1f1f1f;
              "
            >
              Login OTP
            </h1>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 16px;
                font-weight: 500;
              "
            >
              ${firstname},
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
              Thank you for choosing Greenagrichain Company. Use the following
              OTP to complete login. OTP is valid for
              <span style="font-weight: 600; color: #1f1f1f">10 minutes</span>.
              Do not share this code with others, including Greenagrichain
              employees.
            </p>
            <p
              style="
                margin: 0;
                margin-top: 60px;
                font-size: 40px;
                font-weight: 600;
                letter-spacing: 25px;
                color: #ba3d4f;
              "
            >
              ${otp}
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 90px;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a
            href="mailto:greenagrichain.com@gmail.com"
            style="color: #499fb6; text-decoration: none"
            >greenagrichain.com@gmail.com</a
          >
          or visit our
          <a
            href="https://greenagrichain.com/contact/"
            target="_blank"
            style="color: #499fb6; text-decoration: none"
            >Help Center</a
          >
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          text-align: center;
          border-top: 1px solid #e6ebf1;
        "
      >
        <p
          style="
            margin: 0;
            margin-top: 40px;
            font-size: 16px;
            font-weight: 600;
            color: #434343;
          "
        >
          Archisketch Company
        </p>
        <p style="margin: 0; margin-top: 8px; color: #434343">
          Address 540, City, State.
        </p>
        <div style="margin: 0; margin-top: 16px">
          <a href="" target="_blank" style="display: inline-block">
            <img
              width="36px"
              alt="Facebook"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook"
            />
          </a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px"
          >
            <img
              width="36px"
              alt="Instagram"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram"
          /></a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px"
          >
            <img
              width="36px"
              alt="Twitter"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter"
            />
          </a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px"
          >
            <img
              width="36px"
              alt="Youtube"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube"
          /></a>
        </div>
        <p style="margin: 0; margin-top: 16px; color: #434343">
          Copyright © 2024 Greenagrichain. All rights reserved.
        </p>
      </footer>
    </div>
  </body>
</html>


        `,
  };
  await transporter.sendMail(mailOptions);
};
