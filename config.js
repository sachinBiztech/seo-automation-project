require("dotenv").config();
const axios = require("axios");
const readline = require("readline");

// Terminal interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 🤖 AI function
async function askAI(prompt) {
  const response = await axios.post(
    `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
    {
      model: process.env.OPENROUTER_MODEL, // 👈 now Haiku
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // 👈 more stable answers (good for automation)
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",

        // required by OpenRouter
        "HTTP-Referer": "http://localhost",
        "X-Title": "SEO-Automation-Terminal",
      },
    }
  );

  return response.data.choices[0].message.content;
}

// 🔁 Chat loop
async function chat() {
  console.log("\n🤖 Claude Haiku Terminal Chat Started (type 'exit' to stop)\n");

  while (true) {
    const question = await new Promise((resolve) => {
      rl.question("> ", resolve);
    });

    if (question.toLowerCase() === "exit") {
      console.log("Bye 👋");
      process.exit(0);
    }

    console.log("\nThinking...\n");

    try {
      const answer = await askAI(question);
      console.log("AI:", answer, "\n");
    } catch (err) {
      console.log("Error:", err.message);
    }
  }
}

chat();