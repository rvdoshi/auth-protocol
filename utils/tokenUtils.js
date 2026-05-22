import jwt from "jsonwebtoken";
import authConfig from "../config/authConfig.js";

export const generateAccessToken =
(payload)=>{

return jwt.sign(

payload,

process.env
.JWT_ACCESS_SECRET,

{

expiresIn:
authConfig.accessTokenExpiresIn

}

);

};

// export const generateRefreshToken =
// (payload)=>{

// return jwt.sign(

// payload,

// process.env
// .JWT_REFRESH_SECRET,

// {

// expiresIn:
// "7d"

// }

// );

// };
