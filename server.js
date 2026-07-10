const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔑 RapidAPI Credentials
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "b76053a4b2mshe6e4b73d49b6b5ap1bdf2fjsn23b8287db389"; 
const RAPIDAPI_HOST = "instagram-looter2.p.rapidapi.com";

app.get("/", (req, res) => {
    res.json({ status: "online", message: "Instagram Reels Heavy Engine Core Live, Surya Kumar Boss!" });
});

// 🔥 BROWSER DIRECT TEST ROUTE (GET METHOD)
// Usage: https://YOUR_RENDER_URL.onrender.com/test_reels?url=INSTAGRAM_PROFILE_URL
app.get("/test_reels", async (req, res) => {
    const { url } = req.query; // Browser URL se profile link uthayega
    if (!url) return res.status(400).json({ status: "error", message: "Boss, '?url=...' missing hai browser bar me!" });

    // Username extract karna
    const match = url.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/);
    if (!match) return res.status(400).json({ status: "error", message: "Invalid Instagram URL format!" });
    const username = match[1];

    const options = {
        method: 'GET',
        url: `https://${RAPIDAPI_HOST}/user/reels`,
        params: { username: username },
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    };

    try {
        const response = await axios.request(options);
        const data = response.data;
        let reelLinks = [];

        // Parsing logic
        if (data && data.results) {
            data.results.forEach(item => {
                if (item.is_video || item.video_url) {
                    const cleanUrl = item.video_url || (item.video_versions && item.video_versions[0].url);
                    if (cleanUrl) reelLinks.push(cleanUrl);
                }
            });
        }

        if (reelLinks.length === 0 && data && data.data) {
            const items = data.data.items || [];
            items.forEach(item => {
                if (item.video_versions) reelLinks.push(item.video_versions[0].url);
            });
        }

        return res.json({
            status: "success",
            username_detected: username,
            count: reelLinks.length,
            links: reelLinks
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: `Browser Engine Crash: ${error.message}` });
    }
});

// 🔥 POST ROUTE FOR HUGGING FACE BACKEND
app.post("/instagram_profile_links", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: "error", message: "Profile URL missing boss!" });

    const match = url.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/);
    if (!match) return res.status(400).json({ status: "error", message: "Invalid Instagram URL format!" });
    const username = match[1];

    const options = {
        method: 'GET',
        url: `https://${RAPIDAPI_HOST}/user/reels`,
        params: { username: username },
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    };

    try {
        const response = await axios.request(options);
        const data = response.data;
        let reelLinks = [];

        if (data && data.results) {
            data.results.forEach(item => {
                if (item.is_video || item.video_url) {
                    const cleanDownloadUrl = item.video_url || (item.video_versions && item.video_versions[0].url);
                    if (cleanDownloadUrl) reelLinks.push(cleanDownloadUrl);
                }
            });
        }

        if (reelLinks.length === 0 && data && data.data) {
            const items = data.data.items || [];
            items.forEach(item => {
                if (item.video_versions) reelLinks.push(item.video_versions[0].url);
            });
        }

        return res.json({ status: "success", count: reelLinks.length, links: reelLinks });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(PORT, () => console.log(`Surya Boss Engine running on port ${PORT}`));
