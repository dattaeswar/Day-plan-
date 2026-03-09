import { GoogleGenAI, Type } from "@google/genai";
import { Task, Category } from "../types";

// Support both Vite's standard VITE_ prefix and AI Studio's injection
const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || (process.env.GEMINI_API_KEY as string) || "";
const ai = new GoogleGenAI({ apiKey });

export async function suggestSchedule(tasks: Task[]): Promise<{ id: string; startTime: string; endTime: string }[]> {
  const taskList = tasks.map(t => `- ${t.title} (${t.category})`).join('\n');
  
  const prompt = `
    I have the following tasks for today:
    ${taskList}
    
    Please suggest a realistic schedule for these tasks. 
    Assume a standard workday starting at 9:00 AM.
    Return only a JSON array of objects with 'id' (matching the input task title for mapping), 'startTime' (HH:mm), and 'endTime' (HH:mm).
    Be efficient and include short breaks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // Using a stable flash model
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
            },
            required: ["title", "startTime", "endTime"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    
    // Map back to IDs based on title matching (simple heuristic)
    return result.map((item: any) => {
      const task = tasks.find(t => t.title.toLowerCase() === item.title.toLowerCase());
      return {
        id: task?.id || "",
        startTime: item.startTime,
        endTime: item.endTime
      };
    }).filter((item: any) => item.id !== "");
    
  } catch (error) {
    console.error("AI Schedule Suggestion Error:", error);
    return [];
  }
}
