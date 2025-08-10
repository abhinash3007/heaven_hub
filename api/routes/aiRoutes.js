const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}); 


router.post("/generate-description", async (req, res) => {
  const { type, location, price, features } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    const featureText = featureArray.length > 0 ? ` featuring ${featureArray.join(', ')}` : '';
    const description = `Discover this beautiful ${type} located in ${location}. Priced at ₹${price}, this property offers excellent value for money${featureText}. Perfect for those seeking comfort and convenience in a prime location. Don't miss this opportunity to own your dream property!`;
    
    return res.json({ description });
  }

  const prompt = `Write a short, catchy 4-line real estate description for a ${type} in ${location}, priced at ₹${price}, with features like ${featureArray.join(', ')}.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const description = response.choices[0].message.content;
    res.json({ description });
  } catch (err) {
    console.error(err);
    
    const featureText = featureArray.length > 0 ? ` featuring ${featureArray.join(', ')}` : '';
    const description = `Discover this beautiful ${type} located in ${location}. Priced at ₹${price}, this property offers excellent value for money${featureText}. Perfect for those seeking comfort and convenience in a prime location. Don't miss this opportunity to own your dream property!`;
    
    res.json({ description });
  }
});

module.exports = router;
