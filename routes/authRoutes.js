import express from "express";

import {

registerUser,

loginUser,

refreshUser,

verifyMfa,

logoutUser,

forgotPassword,

resetPassword

}
from "../controllers/authController.js";

import validateRequest
from "../middleware/validateRequest.js";

import { registerSchema,loginSchema } from "../validators/authValidation.js";

const router =
express.Router();

router.post(

"/register",

validateRequest(
registerSchema
),

registerUser

);

router.post(

"/login",

validateRequest(
loginSchema
),

loginUser

);

router.post(
"/logout",
logoutUser
);

router.post(
"/refresh",
refreshUser
);

router.post(
"/verify-mfa",
verifyMfa
);

router.post(
"/forgot-password",
forgotPassword
);

router.post(
"/reset-password",
resetPassword
);

export default router;