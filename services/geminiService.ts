import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SpeechAnalysisResult } from "../types";

const processFileToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the Data-URL prefix (e.g., "data:audio/webm;base64,")
      const base64Content = base64String.split(",")[1];
      resolve(base64Content);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeSpeechAudio = async (audioBlob: Blob): Promise<SpeechAnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found in environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Audio = await processFileToBase64(audioBlob);

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        totalFillerWords: { 
            type: Type.INTEGER,
            description: "Total count of filler words found."
        },
        fillerWordBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: "The specific filler word (e.g., 'um', 'like')." },
              count: { type: Type.INTEGER, description: "How many times this word appeared." }
            }
          },
          description: "List of specific filler words and their counts."
        },
        transcriptionSnippet: { 
            type: Type.STRING,
            description: "A short snippet of the speech where fillers were most prominent, or the start of the speech." 
        },
        feedback: { 
            type: Type.STRING,
            description: "Constructive feedback on the speaker's fluency and usage of filler words. Keep it encouraging but direct." 
        },
        score: { 
            type: Type.INTEGER, 
            description: "A fluency score from 0 to 100, where 100 is perfect speech with no fillers." 
        }
      },
      required: ["totalFillerWords", "fillerWordBreakdown", "transcriptionSnippet", "feedback", "score"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || "audio/webm",
              data: base64Audio
            }
          },
          {
            text: `
              Act as a professional Speech Coach. 
              Analyze the provided audio clip which is a 1-minute speech.
              
              Your main task is to identify and count filler words (e.g., 'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'right?').
              
              Provide a strict count, a breakdown of which words were used, and a brief qualitative assessment.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1, // Low temperature for factual counting
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response text from Gemini.");
    }
    
    return JSON.parse(text) as SpeechAnalysisResult;

  } catch (error) {
    console.error("Error analyzing speech:", error);
    throw error;
  }
};
