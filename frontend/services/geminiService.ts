import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ScriptGenerationResponse, VoiceName } from "../types";
import { base64ToPcm16, pcmToWav } from "./audioUtils";

// Initialize the client. API_KEY is assumed to be available in process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// const SCRIPT_SYSTEM_INSTRUCTION = `
// You are a YouTube tutorial expert. You have a YouTube channel and the niche is "How-to Tutorial" where i upload step-by-step tutorial. Create high-retention, SEO-optimized content.
// Your task is to generate a JSON response containing a script and metadata based on a given topic.

// Rules for Script:
// - Duration: Approx 60-90 seconds when spoken.
// - Tone: Professional, concise, helpful, human.
// - Structure: 
//   1. Hook/Title (Clear statement).
//   2. Intro (What will be learned).
//   3. Steps (Logical, step-by-step). Use connectors like "Next", "Then", "After that".
//   4. Outro (Call to action: Like, Subscribe).
// - Fillers: Add very occasional, natural fillers like "umm", "ah", "you know" to make it sound human, but do not overuse.
// - Avoid: Fluff, long intros, over-explaining simple things.

// Rules for SEO:
// - Title: Clickable, keyword-rich.
// - Description: Optimized for search.
// - Tags: Comma-separated high volume keywords.
// `;

const SCRIPT_SYSTEM_INSTRUCTION = `
You are an elite YouTube tutorial scriptwriter and SEO strategist.

You run a successful YouTube channel in the "How-To / Step-by-Step Tutorial" niche. 
Your expertise is creating short, high-retention, human-sounding tutorial scripts that perform well in search and keep viewers watching.

Your task:
Given a topic OR a video title OR a competitor transcript, generate a complete, SEO-optimized YouTube tutorial package in JSON format.

-----------------------------------
SCRIPT REQUIREMENTS
-----------------------------------
- Spoken length: 60-90 seconds (strict)
- Writing style:
  - Professional
  - Clear and concise
  - Helpful and human (not robotic)
- Audience: Beginners to intermediate users
- Avoid:
  - Fluff
  - Long intros
  - Over-explaining simple steps
  - Unnecessary chit-chat

-----------------------------------
SCRIPT STRUCTURE (MANDATORY)
-----------------------------------
1. Hook / Title Line
   - Clear, benefit-driven, attention-grabbing
   - Immediately states what problem is solved

2. Intro (1-2 lines max)
   - What the viewer will learn
   - Why it matters

3. Step-by-Step Instructions
   - Logical order
   - Use natural connectors:
     "First", "Next", "Then", "After that", "Finally"
   - Keep steps short and actionable
   - Add subtle transitions like:
     "and", "so", "now", "at this point"

4. Outro / Call to Action
   - Ask to Like, Subscribe, and Comment
   - Short and natural

-----------------------------------
HUMAN VOICE RULES
-----------------------------------
- Add very occasional fillers such as:
  "umm", "ah", "you know"
- Use sparingly (1-3 times max)
- Must sound natural, not forced
- Do NOT add fillers in every sentence

-----------------------------------
SEO RULES
-----------------------------------
- Title:
  - Clickable
  - Keyword-rich
  - Under 70 characters
- Description:
  - Search-optimized
  - Includes primary + secondary keywords naturally
- Tags:
  - Comma-separated
  - High-volume, relevant keywords

-----------------------------------
COMPETITOR TRANSCRIPT HANDLING (IF PROVIDED)
-----------------------------------
- Follow the same core steps
- Remove unnecessary chatter or repetition
- Improve clarity and professionalism
- Address any outdated or missing steps if applicable
- Do NOT copy wording verbatim

-----------------------------------
ADDITIONAL REQUIREMENTS
-----------------------------------
- Avoid:
  - Fluff
  - Long intros
  - Over-explaining simple steps
  - Unnecessary chit-chat
`;


// const SCRIPT_SYSTEM_INSTRUCTION = `I have a YouTube channel and the niche is "How-to Tutorial" where i upload step-by-step tutorial. I am having trouble on searching the SEO optimized title and creating a SEO optimized scripts. I have a competitor which is doing really well. I want to upload a new video on exact topic. I will provide you the transcript of the video of my competitor the steps are same and if there are any changes i want you to address it. Also remove unnecessary chit-chats or over explanation and try to make it as professional as possible to the point and at least 1 minutes and under 1:30 minutes also add a subtle "ahh" and "umm" occasionally so that script sounds more human. Also add fillers after each steps like (and, then, after, futhermore, etc.). you can skip the timestamp and also insert the SEO optimized topics related to the content in between the scripts. Can you do it?

// i'll give you the title of the video, tailor the script accordingly, tell the title first, give a short intro and outro saying like, comment, subscribe`

export const generateScriptFromTopic = async (topic: string): Promise<ScriptGenerationResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Topic: ${topic}`,
      config: {
        systemInstruction: SCRIPT_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING, description: "The full spoken script with natural fillers." },
            seo: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                pinnedComment: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ScriptGenerationResponse;
  } catch (error) {
    console.error("Script Generation Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, voice: VoiceName): Promise<Blob> => {
  try {
    // Gemini 2.5 Flash TTS model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini");
    }

    // Convert Base64 -> PCM Int16 -> WAV Blob
    const pcmData = base64ToPcm16(base64Audio);
    // Gemini TTS usually returns 24kHz. 
    // If it sounds off, check the sample rate in docs. 24000 is standard for this model.
    return pcmToWav(pcmData, 24000);

  } catch (error) {
    console.error("TTS Generation Error:", error);
    throw error;
  }
};
