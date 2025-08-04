const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI(); 


router.post("/generate-description", async (req, res) => {
  const { type, location, price, features } = req.body;

  const prompt = `Write a short, catchy 4-line real estate description for a ${type} in ${location}, priced at ₹${price}, with features like ${features.join(', ')}.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const description = response.choices[0].message.content;
    res.json({ description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate description" });
  }
});

module.exports = router;
