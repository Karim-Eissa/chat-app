import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../lib/mailer.js";
import sendResponse from "../utils/responseHandler.js";
import { validateSignup, validateLogin, validateProfileUpdate } from "../utils/validation.js";

export default {
    signup_post: async (req, res) => {
        let { fullName, email, password } = req.body;
        try {
            const validationError = await validateSignup(fullName, email, password);
            if (validationError) return sendResponse(res, 400, false, validationError);

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const verificationToken = crypto.randomBytes(32).toString("hex");

            const newUser = new User({
                fullName,
                email,
                password: hashedPassword,
                verificationToken,
            });

            await newUser.save();
            await sendVerificationEmail(email, verificationToken);

            sendResponse(res, 201, true, "User created. Check email for verification link.");
        } catch (error) {
            console.log("Error in signup controller", error.message);
            sendResponse(res, 500, false, "Internal server error");
        }
    },

    login_post: async (req, res) => {
        let { email, password } = req.body;
        try {
            const user = await validateLogin(email, password);
            if (typeof user === "string") return sendResponse(res, 400, false, user);

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) return sendResponse(res, 400, false, "Invalid credentials");

            generateToken(user._id, res);
            sendResponse(res, 200, true, "Login successful", {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
            });
        } catch (error) {
            console.log("Error in login", error.message);
            sendResponse(res, 500, false, "Internal server error");
        }
    },

    logout_post: (req, res) => {
        try {
            res.cookie("jwt", "", { maxAge: 0 });
            sendResponse(res, 200, true, "Logged out successfully");
        } catch (error) {
            console.log("Error in logout controller", error.message);
            sendResponse(res, 500, false, "Internal Server Error");
        }
    },

    verifyEmail_get: async (req, res) => {
        const { token } = req.params;
        try {
            const user = await User.findOne({ verificationToken: token });
            if (!user) return sendResponse(res, 400, false, "Invalid or expired token");

            user.isVerified = true;
            user.verificationToken = undefined;
            await user.save();

            res.redirect(`${process.env.ORIGIN}/login`);
        } catch (error) {
            console.log("Error in email verification", error.message);
            sendResponse(res, 500, false, "Internal server error");
        }
    },

    updateProfile_put: async (req, res) => {
        try {
            const { profilePic } = req.body;
            const userId = req.user._id;
            const validationError = validateProfileUpdate(profilePic);
            if (validationError) return sendResponse(res, 400, false, validationError);

            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { profilePic: uploadResponse.secure_url },
                { new: true }
            );

            if (!updatedUser) return sendResponse(res, 404, false, "User not found");

            sendResponse(res, 200, true, "Profile updated successfully", updatedUser);
        } catch (error) {
            console.log("Error in update profile", error.message);
            sendResponse(res, 500, false, "Internal Server Error");
        }
    },

    checkAuth_get: (req, res) => {
        try {
            sendResponse(res, 200, true, "Authenticated user", req.user);
        } catch (error) {
            console.log("Error in checkAuth controller", error.message);
            sendResponse(res, 500, false, "Internal Server Error");
        }
    }
};
