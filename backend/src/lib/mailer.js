import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,  
        pass: process.env.EMAIL_PASSWORD, 
    },
});

export const sendVerificationEmail = async (email, token) => {
    const link = `${process.env.BACKEND}/api/auth/verify/${token}`;  

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<h2>Welcome to the Chat App!</h2>
               <p>Click the link below to verify your email:</p>
               <a href="${link}" target="_blank">Click here</a>`,
    };

    await transporter.sendMail(mailOptions);
};
export const sendPasswordRecoveryEmail = async (email, token) => {
    const link = `${process.env.ORIGIN}/reset-pass/${token}`;  

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Recover Your Account",
        html: `<h2>Forgot your password?</h2>
               <p>No worries at all! Click the link below to set your new password:</p>
               <a href="${link}" target="_blank">Click here</a>
               <p>This link will expire soon!</p>`,
    };

    await transporter.sendMail(mailOptions);
};
