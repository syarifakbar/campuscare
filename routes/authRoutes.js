const express = require('express');
const { login, register, getUsers, getUserStats } = require('../services/authService');

const router = express.Router();

router.post('/login', (req, res) => {
  try {
    const user = login(req.body.username, req.body.password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    return res.json({
      success: true,
      message: 'Login berhasil.',
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/register', (req, res) => {
  try {
    const user = register(req.body);
    return res.status(201).json({
      success: true,
      message: 'Register berhasil.',
      user
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/users', (req, res) => {
  try {
    return res.json({
      success: true,
      users: getUsers({ role: req.query.role })
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/stats', (req, res) => {
  try {
    return res.json({
      success: true,
      stats: getUserStats()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
