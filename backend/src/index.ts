import express = require("express");
import { evaluateIdea } from './lib/geminiEvaluator';
import dotenv = require('dotenv');
dotenv.config();
console.log('API KEY:', process.env.GEMINI_API_KEY);

const app = express();
app.use(express.json());
app.get('/',(req,res) => {
    res.send("Hello");
})
app.post('/api/submit',async (req,res)=>{
    const {text} = req.body;
    const evaluation = await evaluateIdea(text);
    res.json(evaluation);
});

app.listen(3001);