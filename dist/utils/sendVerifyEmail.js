"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendVerifyMail = (req, name, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionData = req.session;
        const otp = sessionData.otp;
        console.log(otp + "node mailer" + email);
        sessionData.otpGeneratedTime = Date.now();
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            tls: {
                rejectUnauthorized: false,
            },
            auth: {
                user: "zapmedia2001@gmail.com",
                pass: process.env.NODEMAILER,
            },
        });
        const mailOptions = {
            from: "zapmedia2001@gmail.com",
            to: email,
            subject: "For verification purpose",
            html: `<html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
            text-align: center;
          }
          p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .otp {
            background-color: #f8f8f8;
            padding: 10px 20px;
            border-radius: 4px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
          }
          .cta-button {
            display: block;
            width: fit-content;
            margin: 0 auto;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            text-align: center;
          }
          .cta-button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Verification</h1>
          <p>Hello ${name},</p>
          <p>Please enter this OTP to verify your email:</p>
          <div class="otp">${otp}</div>
          <p>If you did not request this, please ignore this email.</p>
          <a href="#" class="cta-button">Verify Email</a>
        </div>
      </body>
      </html>`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Send mail");
                console.log(error);
            }
            else {
                console.log("Email has been sent:", info.response);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = sendVerifyMail;
