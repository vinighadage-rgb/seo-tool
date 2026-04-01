const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/audit", async (req, res) => {
    try {
        const { url } = req.body;

        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $ = cheerio.load(response.data);

        let score = 100;
        let issues = [];

        if (!$("title").text()) {
            issues.push("Missing title");
            score -= 10;
        }

        if ($("h1").length !== 1) {
            issues.push("H1 issue");
            score -= 10;
        }

        $("img").each((i, el) => {
            if (!$(el).attr("alt")) {
                issues.push("Image missing alt");
                score -= 1;
            }
        });

        res.json({
            score,
            issues,
            linksCount: $("a").length
        });

    } catch {
        res.status(500).json({ error: "Failed" });
    }
});

app.listen(5000, () => console.log("Running"));