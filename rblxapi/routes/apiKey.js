const express = require("express");
const router = express.Router();
const generateKey = require('../utils/generateKey')

router.get(`/`, (req, res) => {
  const id = generateKey();
  res.json({ apiKey: id, date: new Date().toString() });
});

module.exports = router;
