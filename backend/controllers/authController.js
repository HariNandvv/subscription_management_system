
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (
        password.length <= 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
    ) {
        return res.status(400).json({
            message: "Password must be longer than 8 characters and contain uppercase, lowercase and special characters"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (name, email, password, role)
             VALUES (?, ?, ?, 'customer')`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        res.status(500).json({
            message: "Registration failed"
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password required"
        });
    }

    try {
        const [results] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed due to server error"
        });
    }
};
