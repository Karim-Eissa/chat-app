import User from "../models/user.model.js";

export const validateSignup = async (fullName, email, password) => {
    email = email.toLowerCase();

    if (!fullName || !email || !password) {
        return "All fields are required";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters";
    }
    if (!/^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/.test(fullName)) {
        return "Username can only contain letters, numbers, and single periods (no spaces or special characters)";
    }

    const userNameExists = await User.findOne({ fullName });
    if (userNameExists) return "This username is taken";

    const userExists = await User.findOne({ email });
    if (userExists) return "Email already exists";

    return null; // No validation errors
};

export const validateLogin = async (email, password) => {
    email = email.toLowerCase();

    if (!email || !password) {
        return "Email and password are required";
    }

    const user = await User.findOne({ email });
    if (!user) {
        return "Invalid credentials";
    }
    if (!user.isVerified) {
        return "Please verify your email before logging in.";
    }

    return user; // Return user for password validation
};

export const validateProfileUpdate = (profilePic) => {
    if (!profilePic) {
        return "Profile Picture is Required";
    }
    return null;
};
