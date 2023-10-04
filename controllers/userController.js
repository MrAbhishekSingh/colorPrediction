import UserModel from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
// import transporter from '../config/emailConfig.js'
import twilio from 'twilio'

class UserController {


    static userRegistration = async (req, res) => {
        const TWILIO_SID = 'AC76e82f7e47149e7764432cd1dd0636ea';
        const TWILIO_AUTH_TOKEN = "aa6de04b329d85fb0cce285c15e4a5fe";
        const TWILIO_PHONE_NUMBER = '+919335313553';
        const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

        const { name, phone, password, password_confirmation } = req.body
        const user = await UserModel.findOne({ phone: phone })
        if (user) {
            res.send({ "status": "failed", "message": "Phone number already exists" })
        } else {
            if (name && password && phone && password_confirmation) {
                if (password === password_confirmation) {
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)
                        const otp = Math.floor(100000 + Math.random() * 900000);

                        // await client.messages
                        //     .create({
                        //         body: `Your OTP for registration is: ${otp}`,
                        //         from: '+14346089658',
                        //         to: phone
                        //     })
                        //     .then(() => {
                        //         res.json({ success: true, message: 'OTP sent successfully' });
                        //     })
                        //     .catch((error) => {
                        //         res.status(500).json({ success: false, error: error.message });
                        //     });
                        const doc = new UserModel({
                            name: name,
                            password: hashPassword,
                            phone: phone,
                            Refer_code: '',
                            role: 1,
                            otp: otp,
                            otpValidUpto: Date.now() + process.env.OTP_VALID_UPTO_SEC * 1000,
                            otpVerifyStatus: false
                        })
                        await doc.save()
                        const saved_user = await UserModel.findOne({ phone: phone })
                        res.status(201).send({
                            "status": "success", "message": "OTP has been send your given number",
                            "data": [{ phone: saved_user.phone }]
                        })
                    } catch (error) {
                        console.log(error)
                        res.send({ "status": "failed", "message": "Unable to Register" })
                    }
                } else {
                    res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
                }
            } else {
                res.send({ "status": "failed", "message": "All fields are required" })
            }
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { phone, password } = req.body
            if (phone && password) {
                const user = await UserModel.findOne({ phone: phone })
                if (user != null) {
                    const isMatch = await bcrypt.compare(password, user.password)
                    if ((user.phone === phone) && isMatch) {
                        // Generate JWT Token
                        const userData = await UserModel.findOne({ phone: phone })
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                        res.send({
                            "status": "success",
                            "message": "Login Success",
                            "data": [{ data: userData, token: token }]
                        })
                    } else {
                        res.send({ "status": "failed", "message": "Phone or Password is not Valid" })
                    }
                } else {
                    res.send({ "status": "failed", "message": "You are not a Registered User" })
                }
            } else {
                res.send({ "status": "failed", "message": "All Fields are Required" })
            }
        } catch (error) {
            console.log(error)
            res.send({ "status": "failed", "message": "Unable to Login" })
        }
    }

    static changeUserPassword = async (req, res) => {
        const { password, password_confirmation } = req.body
        if (password && password_confirmation) {
            if (password !== password_confirmation) {
                res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
            } else {
                const salt = await bcrypt.genSalt(10)
                const newHashPassword = await bcrypt.hash(password, salt)
                await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
                res.send({ "status": "success", "message": "Password changed succesfully" })
            }
        } else {
            res.send({ "status": "failed", "message": "All Fields are Required" })
        }
    }


    static otpVerify = async (req, res) => {
        const { phone, otp } = req.body
        if (phone && otp) {
            const user = await UserModel.findOne({ phone: phone })
            if (user) {
                if (user.otpValidUpto) {
                    if (user.otpValidUpto < Date.now() * 1000) {
                        if (otp === user.otp) {
                            const new_secret = user._id + process.env.JWT_SECRET_KEY
                            await UserModel.findByIdAndUpdate(user._id, {
                                $unset: {
                                    otpValidUpto: 1,
                                    otp: 1         // Remove the 'role' field
                                },
                                $set: {
                                    otpVerifyStatus: true,
                                }
                            })
                            const userData = await UserModel.findOne({ phone: phone })
                            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                            res.send({
                                "status": "success",
                                "message": "OTP Verify Successfully",
                                "data": [{ data: userData, token: token }]
                            })
                        } else {
                            res.send({ "status": "failed", "message": "Please enter correct OTP" })
                        }
                    } else {
                        res.send({ "status": "failed", "message": "Invalid OTP" })
                    }
                } else {
                    res.send({ "status": "failed", "message": "OTP has been expired" })
                }
            } else {
                res.send({ "status": "failed", "message": "Your number is not found in our database" })
            }
        } else {
            res.send({ "status": "failed", "message": "Require all field" })
        }
    }

    static resendOtp = async (req, res) => {
        const { phone } = req.body
        const user = await UserModel.findOne({ phone: phone })
        const TWILIO_SID = 'AC76e82f7e47149e7764432cd1dd0636ea';
        const TWILIO_AUTH_TOKEN = "aa6de04b329d85fb0cce285c15e4a5fe";
        const TWILIO_PHONE_NUMBER = '+919335313553';
        const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            // await client.messages
            //     .create({
            //         body: `Your OTP for registration is: ${otp}`,
            //         from: '+14346089658',
            //         to: phone
            //     })
            //     .then(() => {
            //         res.json({ success: true, message: 'OTP sent successfully' });
            //     })
            //     .catch((error) => {
            //         res.status(500).json({ success: false, error: error.message });
            //     });
            const new_secret = user._id + process.env.JWT_SECRET_KEY
            await UserModel.findByIdAndUpdate(user._id, {
                $set: {
                    otp: otp,
                    otpValidUpto: Date.now() + process.env.OTP_VALID_UPTO_SEC * 1000,
                    otpVerifyStatus: false
                }
            })
            res.send({ "status": "success", "message": "OTP has beed send your number" })
        } else {
            res.send({ "status": "failed", "message": "Invalid phone number" })
        }
    }

    static forgotPassword = async (req, res) => {
        const { phone } = req.body
        const TWILIO_SID = 'AC76e82f7e47149e7764432cd1dd0636ea';
        const TWILIO_AUTH_TOKEN = "aa6de04b329d85fb0cce285c15e4a5fe";
        const TWILIO_PHONE_NUMBER = '+919335313553';
        const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
        const user = await UserModel.findOne({ phone: phone })
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            // await client.messages
            //     .create({
            //         body: `Your OTP for registration is: ${otp}`,
            //         from: '+14346089658',
            //         to: phone
            //     })
            //     .then(() => {
            //         res.json({ success: true, message: 'OTP sent successfully' });
            //     })
            //     .catch((error) => {
            //         res.status(500).json({ success: false, error: error.message });
            //     });
            const new_secret = user._id + process.env.JWT_SECRET_KEY
            await UserModel.findByIdAndUpdate(user._id, {
                $set: {
                    otp: otp,
                    otpValidUpto: Date.now() + process.env.OTP_VALID_UPTO_SEC * 1000,
                }
            })
            res.send({ "status": "success", "message": "OTP has beed send your number", "data": [{ phone: phone }] })
        } else {
            res.send({ "status": "failed", "message": "Phone number not found" })
        }
    }

    static resetPassword = async (req, res) => {
        const { phone, otp, password, password_confirmation } = req.body
        if (phone && password && password_confirmation && otp) {
            const user = await UserModel.findOne({ phone: phone })
            if (user) {
                if (password !== password_confirmation) {
                    res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
                } else {
                    if (user.otpValidUpto) {
                        if (user.otpValidUpto < Date.now() * 1000) {
                            if (otp === user.otp) {
                                const salt = await bcrypt.genSalt(10)
                                const newHashPassword = await bcrypt.hash(password, salt)
                                await UserModel.findByIdAndUpdate(user._id, {
                                    $unset: {
                                        otpValidUpto: 1,
                                        otp: 1         // Remove the 'role' field
                                    },
                                    $set: { password: newHashPassword }
                                })
                                res.send({ "status": "success", "message": "Password changed succesfully" })
                            } else {
                                res.send({ "status": "failed", "message": "Please enter correct OTP" })
                            }
                        } else {
                            res.send({ "status": "failed", "message": "Invalid OTP" })
                        }
                    } else {
                        res.send({ "status": "failed", "message": "OTP has been expired" })
                    }
                }

            } else {
                res.send({ "status": "failed", "message": "Your number is not found in our database" })
            }

        } else {
            res.send({ "status": "failed", "message": "All field required" })
        }

    }

    static userData = async (req, res) => {
        res.send({ "user": req.user })
    }

    // static sendUserPasswordResetEmail = async (req, res) => {
    //     const { email } = req.body
    //     if (email) {
    //         const user = await UserModel.findOne({ email: email })
    //         if (user) {
    //             const secret = user._id + process.env.JWT_SECRET_KEY
    //             const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
    //             const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
    //             console.log(link)
    //             // // Send Email
    //             // let info = await transporter.sendMail({
    //             //   from: process.env.EMAIL_FROM,
    //             //   to: user.email,
    //             //   subject: "GeekShop - Password Reset Link",
    //             //   html: `<a href=${link}>Click Here</a> to Reset Your Password`
    //             // })
    //             res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" })
    //         } else {
    //             res.send({ "status": "failed", "message": "Email doesn't exists" })
    //         }
    //     } else {
    //         res.send({ "status": "failed", "message": "Email Field is Required" })
    //     }
    // }

    // static userPasswordReset = async (req, res) => {
    //     const { password, password_confirmation } = req.body
    //     const { id, token } = req.params
    //     const user = await UserModel.findById(id)
    //     const new_secret = user._id + process.env.JWT_SECRET_KEY
    //     try {
    //         jwt.verify(token, new_secret)
    //         if (password && password_confirmation) {
    //             if (password !== password_confirmation) {
    //                 res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
    //             } else {
    //                 const salt = await bcrypt.genSalt(10)
    //                 const newHashPassword = await bcrypt.hash(password, salt)
    //                 await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
    //                 res.send({ "status": "success", "message": "Password Reset Successfully" })
    //             }
    //         } else {
    //             res.send({ "status": "failed", "message": "All Fields are Required" })
    //         }
    //     } catch (error) {
    //         console.log(error)
    //         res.send({ "status": "failed", "message": "Invalid Token" })
    //     }
    // }
}

export default UserController