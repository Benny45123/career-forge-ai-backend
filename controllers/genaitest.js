const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function listModels() {
  const API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      console.log("Available Gemini Models:");
      data.models.forEach(model => {
        console.log(`- ${model.name} (${model.displayName})`);
      });
    } else {
      console.error("Error fetching models:", data);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

listModels();