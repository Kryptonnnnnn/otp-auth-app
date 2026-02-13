const express = require("express");
const jwt = require("jsonwebtoken");
const generateOTP = require("../utils/otp");

const router = express.Router();
const otpStore = new Map();
const SECRET = "supersecretkey";

/* ================= REQUEST OTP ================= */
router.post("/request-otp", (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: "Identifier required" });
  }

  const existing = otpStore.get(identifier);

  if (existing?.blockedUntil && Date.now() < existing.blockedUntil) {
    const remaining = Math.ceil(
      (existing.blockedUntil - Date.now()) / 1000
    );

    return res.status(403).json({
      message: "User blocked",
      remainingTime: remaining,
    });
  }

  const otp = generateOTP();
  console.log(`OTP for ${identifier}: ${otp}`);

  otpStore.set(identifier, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
    blockedUntil: null,
  });

  res.json({ message: "OTP sent (check console)" });
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", (req, res) => {
  const { identifier, otp } = req.body;

  const record = otpStore.get(identifier);
  if (!record) {
    return res.status(400).json({ message: "No OTP requested" });
  }

  if (record.blockedUntil && Date.now() < record.blockedUntil) {
    const remaining = Math.ceil(
      (record.blockedUntil - Date.now()) / 1000
    );

    return res.status(403).json({
      message: "Blocked",
      remainingTime: remaining,
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier);
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) {
    record.attempts += 1;

    if (record.attempts >= 3) {
      record.blockedUntil = Date.now() + 10 * 60 * 1000;

      return res.status(403).json({
        message: "Blocked",
        remainingTime: 600,
      });
    }

    return res.status(400).json({
      message: `Invalid OTP. ${3 - record.attempts} attempts left`,
    });
  }

  const token = jwt.sign({ identifier }, SECRET, {
    expiresIn: "1h",
  });

  otpStore.delete(identifier);
  res.json({ token });
});

/* ================= GET USER ================= */
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ user: decoded.identifier });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
