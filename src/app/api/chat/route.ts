
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Check if API Key is present
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is missing from environment variables.");
            return new Response("API Key not configured", { status: 500 });
        }

        const result = await streamText({
            model: google('gemini-2.0-flash'),
            system: `You are an expert fitness coach and data analyst for "AltraFitness". 
        Your goal is to provide concise, motivating, and data-driven insights to the gym owner (Trainer).
        
        Tone: Professional, energetic, and concise. Use emojis occasionally.
        Language: Portuguese (Brazil).
        
        If asked about specific students, assume you have access to their latest workout data (mocked for now).
        Focus on retention, progress, and business growth.`,
            messages,
        });

        if (!result) {
            throw new Error("streamText returned null or undefined");
        }

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("❌ Error in /api/chat:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
