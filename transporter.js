import transporter from "./config/mailConfig.js";
import dotenv from 'dotenv'
dotenv.config()

await transporter.sendMail({

from:
process.env.MAIL_USER,

to:
process.env.MAIL_USER,

subject:
"Test",

text:
"Mail working"

});

console.log(
"Mail sent"
);