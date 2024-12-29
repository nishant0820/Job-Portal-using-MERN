import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const {fullname, email, phoneNumber,password,role} = req.body;
        if(!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        };
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                message: "User already exists",
                success: false
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role
        })
    } catch (error) {

    }
}

export const login = async (req, res) => {
    try {
        const {email, password, role} = req.body;
        if(!email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        };
        const user = await User.findone({email});
        if (!user) {
            return res.status(400).json({
                message: "User does not exist",
                success: false
            })
        };
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect Password",
                success: false
            })
        };
        // check role is correct or not
        if(role != user.role){
            return res.status(400).json({
                message: "Account does not exist with this role",
                success: false
            })
        };

        const tokenData = {
            userId : user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {expiresIn: "1d"});
        return res.status(200).cookie("token", token, {
            maxAge: 1*24*60*60*1000,
            httpOnly: true,
            sameSite: 'strict'
        })
    } catch (error) {

    }
}