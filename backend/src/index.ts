import express = require("express");
import { evaluateIdea } from './lib/geminiEvaluator';
import dotenv = require('dotenv');
import { savePost, loadPosts } from './lib/dataStore';
import cors = require('cors');

dotenv.config();
console.log('API KEY:', process.env.GEMINI_API_KEY);

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());
app.get('/',(req,res) => {
    res.send("Hello");
})
app.post('/api/submit', async (req, res) => {
    const { text } = req.body;
    const evaluation = await evaluateIdea(text);
    
    const post = {
        id: `post_${Date.now()}`,
        text,
        rank: evaluation.rank,
        score: evaluation.score,
        reason: evaluation.reason,
        createdAt: new Date().toISOString(),
    };
    
    savePost(post);
    res.json(post);
});

app.get('/api/posts', (req, res) => {
    const posts = loadPosts();
    res.json(posts);
});

app.listen(3001);