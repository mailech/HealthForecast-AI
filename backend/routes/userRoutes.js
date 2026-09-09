const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ==========================================
// GET ALL USERS
// ==========================================

router.get("/", (req, res) => {

    const sql = `
        SELECT id, name, email, role, created_at
        FROM users
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Users database error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch users"
            });
        }

        res.json({
            success: true,
            users: results
        });
    });
});

module.exports = router;