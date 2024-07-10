// src/controllers/auth.mjs
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Users from '../models/Users.js';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */


/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */

export const register = async (req, res) => {
  const { userName, email, password, role } = req.body;
  try {
    const existUser = await Users.exists({email});
    if(existUser) {
        return res.status(401).josn({message: "User already registered with this email id!!!"})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users({ userName, email, password: hashedPassword, role });
    await user.save();
    res.status(201).send('User registered');
  } catch (err) {
    res.status(400).send(err.message);
  }
};


/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Unauthorized
 */

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid email" });
      }
  
      // Compare the passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).send(err.message);
  }
};
