import crypto from 'crypto';

async function generateSHA256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function getUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const message = req.query.q;
  
  if (!message) {
    return res.status(400).json({ 
      error: "Missing query parameter 'q'", 
      status: 400, 
      successful: "failed" 
    });
  }

  const timestamp = Date.now();
  const sign = await generateSHA256(`${timestamp}:${message}:`);
  
  const data = {
    messages: [{ role: "user", content: message }],
    time: timestamp,
    pass: null,
    sign: sign,
  };

  const headers = {
    "User-Agent": getUserAgent(),
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.google.com/",
    "Origin": "https://api.ashlynn-repo.tech/",
    "Connection": "keep-alive",
  };

  try {
    const response = await fetch("https://chat10.free2gpt.xyz/api/generate", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    const textResponse = await response.text();
    let ashlynn;
    
    try {
      const jsonResponse = JSON.parse(textResponse);
      ashlynn = jsonResponse?.choices?.[0]?.message || textResponse;
    } catch (error) {
      ashlynn = textResponse; 
    }

    return res.status(200).json({
      "Join": "https://t.me/zerocreations",
      "response": ashlynn,
      "status": 200,
      "successful": "success"
    });
  } catch (error) {
    return res.status(500).json({ 
      "Join": "https://t.me/zerocreations",
      "response": error.message,
      "status": 500,
      "successful": "failed"
    });
  }
}
