import { GoogleGenAI } from "@google/genai";

const FALLBACK_PRAISES = [
  "你的努力像星星一样闪耀，照亮了整个班级！",
  "哇！这种坚持不懈的精神，简直是大家的榜样！",
  "今天的你，比昨天的你更进一步，太棒了！",
  "看到你的进步，老师比吃了蜜还甜！",
  "这种专注力，是成为科学家的潜质哦！"
];

const FALLBACK_PRIZE_DESC = "这是一份来自星际的神秘礼物，它蕴含着无限的幸运能量！传说中只有最努力的孩子才能打开它！";

export const generateAIContent = async (prompt: string): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    // Mock Fallback
    await new Promise(r => setTimeout(r, 1500));
    if (prompt.includes("夸夸")) {
      return FALLBACK_PRAISES[Math.floor(Math.random() * FALLBACK_PRAISES.length)];
    } else {
      return FALLBACK_PRIZE_DESC;
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest', 
      contents: prompt,
    });
    
    return response.text || (prompt.includes("夸夸") ? FALLBACK_PRAISES[0] : FALLBACK_PRIZE_DESC);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback on error
    if (prompt.includes("夸夸")) {
      return FALLBACK_PRAISES[Math.floor(Math.random() * FALLBACK_PRAISES.length)];
    } else {
      return FALLBACK_PRIZE_DESC;
    }
  }
};