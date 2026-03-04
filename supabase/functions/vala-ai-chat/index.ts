// New content for the index.ts file with OpenAI integration

import { OpenAI } from 'openai';

// Initialize OpenAI API with your secret key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to handle chat interactions
export const chat = async (message) => {
    try {
        const response = await openai.chat.completions.create({
            messages: [{ role: 'user', content: message }],
            model: 'gpt-3.5-turbo',
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        throw error;
    }
};

// JWT auth and timeout handling can be added here