import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv = require('dotenv')

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function evaluateIdea(text: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const prompt = `
あなたは岡山大学DS部（データサイエンス部）のアイデア審査AIです。
部員から投稿されたアイデアを評価し、ランクを付けてください。

【投稿されたアイデア】
${text}

【評価基準】
- DS部の活動として取り組める実現可能性があるか
- 新しい視点・発想がある独創性があるか
- 部や大学・社会への貢献が期待できるか

【ランク定義】
S: 革新的で即実行したいレベルの超優秀アイデア
A: 実用性が高く、ぜひ取り組みたい優秀アイデア
B: 良いアイデア。工夫次第で発展の可能性あり
C: まずまずのアイデア。もう少し具体化を
D: 基本的なアイデア。ブラッシュアップが必要

必ず以下のJSON形式のみで回答してください（説明文は不要）:
{"rank": "S" | "A" | "B" | "C" | "D", "score": 0〜100の整数, "reason": "評価理由（50文字以内の日本語）"}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return parsed;

}