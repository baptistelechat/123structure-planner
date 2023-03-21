import { Request, Response } from "express";
import User from "../models/user.models";
import bcrypt from "bcrypt";
import validator from "validator";
import { sign } from "jsonwebtoken";

// Generate JWT
const generateToken = (_id: string) => {
  const jwtSecret = process.env.JWT_SECRET as string;
  return sign({ _id }, jwtSecret, { expiresIn: "3d" });
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "⛔ All fields must be filled" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "⛔ Incorrect email" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "⛔ Incorrect password" });
    }

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      email,
      password: user.password,
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      company: user.company,
    });
  } catch (error: any) {
    res.status(400).json({ error: "⛔ " + error.message });
  }
};

// SignIn User
export const signUpUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role, company } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "⛔ All fields must be filled" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "⛔ Email is not valid" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ error: "⛔ Password not strong enough" });
    }

    const exist = await User.findOne({ email });

    if (exist) {
      return res.status(400).json({ error: "⛔ Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hash,
      firstName,
      lastName,
      role,
      company,
    });

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      email,
      password: hash,
      token,
      firstName,
      lastName,
      role,
      company,
    });
  } catch (error: any) {
    res.status(400).json({ error: "⛔ " + error.message });
  }
};
