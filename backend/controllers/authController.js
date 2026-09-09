const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// REGISTER
// ===============================

const register = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const [existingUser] =
            await db.promise().query(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const [result] =
            await db.promise().query(
                `INSERT INTO users
                (name, email, password, role)
                VALUES (?, ?, ?, ?)`,
                [
                    name,
                    email,
                    hashedPassword,
                    role
                ]
            );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {

        console.error(
            "Register error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
};


// ===============================
// LOGIN
// ===============================

const login = async (req, res) => {

    try {

        const {
            email,
            password,
            role
        } = req.body;


        // -------------------------------
        // Validate input
        // -------------------------------

        if (!email || !password || !role) {

            return res.status(400).json({
                success: false,
                message:
                    "Email, password and role are required"
            });

        }


        // -------------------------------
        // Find user
        // -------------------------------

        const [users] =
            await db.promise().query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );


        if (users.length === 0) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email, password or selected role"
            });

        }


        const user = users[0];


        // -------------------------------
        // Check password
        // -------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email, password or selected role"
            });

        }


        // -------------------------------
        // Check selected role
        // -------------------------------

        const databaseRole =
            String(user.role)
                .trim()
                .toLowerCase();

        const selectedRole =
            String(role)
                .trim()
                .toLowerCase();


        if (databaseRole !== selectedRole) {

            return res.status(403).json({
                success: false,
                message:
                    "Selected role does not match your account"
            });

        }


        // -------------------------------
        // Create JWT
        // -------------------------------

        const token = jwt.sign(
            {
                id: user.id,
                role: databaseRole
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );


        // -------------------------------
        // Save login activity
        // -------------------------------

        try {

            await db.promise().query(
                `INSERT INTO audit_logs
                (user_id, action, description, ip_address)
                VALUES (?, ?, ?, ?)`,
                [
                    user.id,
                    "LOGIN",
                    `User logged in as ${databaseRole}`,
                    req.ip
                ]
            );

        } catch (auditError) {

            console.error(
                "Audit log error:",
                auditError
            );

        }


        // -------------------------------
        // Send response
        // -------------------------------

        res.json({

            success: true,

            message: "Login successful",

            token: token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: databaseRole
            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Login failed"
        });

    }
};


// ===============================
// EXPORT
// ===============================

module.exports = {
    register,
    login
};