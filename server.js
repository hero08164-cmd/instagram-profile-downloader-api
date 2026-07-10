const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "instagram-looter2.p.rapidapi.com";

app.get("/", (req, res) => {
    res.json({ status: "online", message: "Instagram Reels Heavy Engine Core Live, Surya Kumar Boss!" });
});

// Step 1: Username se User ID auto-fetch karne wala helper
async function getUserId(username) {
    const options = {
        method: 'GET',
        url: `https://${RAPIDAPI_HOST}/profile`,   // "User info by username" ka actual path
        params: { username },
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    };
    const response = await axios.request(options);
    const data = response.data;

    console.log("PROFILE RAW RESPONSE:", JSON.stringify(data)); // debug ke liye Render logs me dikhega

    // Sabhi possible field names try karo jahan ID ho sakti hai
    return (
        data.pk ||
        data.id ||
        data.user_id ||
        (data.user && (data.user.pk || data.user.id)) ||
        (data.data && (data.data.pk || data.data.id))
    );
}

// Step 2: ID se reels fetch karne wala helper
async function getReelsById(userId, count = 12) {
    const options = {
        method: 'GET',
        url: `https://${RAPIDAPI_HOST}/reels`,
        params: { id: userId, count },
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    };
    const response = await axios.request(options);
    return response.data;
}

function extractReelLinks(data) {
    let reelLinks = [];
    const items = data.items || (data.data && data.data.items) || [];
    items.forEach(item => {
        if (item.video_versions && item.video_versions.length) {
            reelLinks.push(item.video_versions[0].url);
        }
    });
    return reelLinks;
}

// 🔥 BROWSER TEST ROUTE — sirf profile URL do, ID khud fetch ho jayegi
app.get("/test_reels", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: "error", message: "Boss, '?url=...' missing hai!" });

    const match = url.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/);
    if (!match) return res.status(400).json({ status: "error", message: "Invalid Instagram URL format!" });
    const username = match[1];

    try {
        const userId = await getUserId(username);
        if (!userId) {
            return res.status(500).json({
                status: "error",
                message: "User ID nahi mila. Render logs me 'PROFILE RAW RESPONSE' check karo, wahi se exact field pata chalega."
            });
        }

        const data = await getReelsById(userId);
        const reelLinks = extractReelLinks(data);

        return res.json({
            status: "success",
            username_detected: username,
            user_id: userId,
            count: reelLinks.length,
            links: reelLinks
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: `Engine Crash: ${error.message}` });
    }
});

// 🔥 POST ROUTE (bulk/backend use ke liye) — same auto-ID logic
app.post("/instagram_profile_links", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: "error", message: "Profile URL missing boss!" });

    const match = url.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/);
    if (!match) return res.status(400).json({ status: "error", message: "Invalid Instagram URL format!" });
    const username = match[1];

    try {
        const userId = await getUserId(username);
        if (!userId) {
            return res.status(500).json({ status: "error", message: "User ID nahi mila." });
        }

        const data = await getReelsById(userId);
        const reelLinks = extractReelLinks(data);

        return res.json({ status: "success", user_id: userId, count: reelLinks.length, links: reelLinks });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(PORT, () => console.log(`Surya Boss Engine running on port ${PORT}`));
