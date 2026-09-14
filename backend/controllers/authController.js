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
            password
        } = req.body;

        // -------------------------------
        // Validate input
        // -------------------------------

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const trimmedName = String(name).trim();
        const normalizedEmail = String(email).trim().toLowerCase();

        if (trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must contain at least 2 characters"
            });
        }

        // Basic email validation
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (String(password).length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        // -------------------------------
        // Check existing user
        // -------------------------------

        const [existingUsers] =
            await db.promise().query(
                "SELECT id FROM users WHERE email = ?",
                [normalizedEmail]
            );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // -------------------------------
        // Hash password
        // -------------------------------

        const hashedPassword =
            await bcrypt.hash(String(password), 10);

        // -------------------------------
        // Secure default role
        // -------------------------------
        // IMPORTANT:
        // Never accept role from req.body.
        // Public registration always creates
        // a Patient account.
        // Admin/Doctor/System Administrator
        // accounts must be created by an
        // authorized administrator.

        const defaultRole = "Patient";

        // -------------------------------
        // Insert user
        // -------------------------------

        const [result] =
            await db.promise().query(
                `INSERT INTO users
                (name, email, password, role)
                VALUES (?, ?, ?, ?)`,
                [
                    trimmedName,
                    normalizedEmail,
                    hashedPassword,
                    defaultRole
                ]
            );

        // -------------------------------
        // Response
        // -------------------------------

        return res.status(201).json({
            success: true,
            message: "Patient account registered successfully",
            userId: result.insertId,
            role: defaultRole
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
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
                message: "Email, password and role are required"
            });
        }

        const normalizedEmail =
            String(email).trim().toLowerCase();

        const selectedRole =
            String(role).trim().toLowerCase();

        // -------------------------------
        // Find user
        // -------------------------------

        const [users] =
            await db.promise().query(
                "SELECT * FROM users WHERE email = ?",
                [normalizedEmail]
            );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email, password or selected role"
            });
        }

        const user = users[0];

        // -------------------------------
        // Check password
        // -------------------------------

        const passwordMatch =
            await bcrypt.compare(
                String(password),
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email, password or selected role"
            });
        }

        // -------------------------------
        // Check database role
        // -------------------------------

        const databaseRole =
            String(user.role).trim().toLowerCase();

        if (databaseRole !== selectedRole) {
            return res.status(403).json({
                success: false,
                message: "Selected role does not match your account"
            });
        }

        // -------------------------------
        // Check JWT secret
        // -------------------------------

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in .env file");

            return res.status(500).json({
                success: false,
                message: "Authentication configuration error"
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
            console.error("Audit log error:", auditError);
        }

        // -------------------------------
        // Send response
        // -------------------------------

        return res.json({
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
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
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