import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AI Service
 * Handles communication with AI providers (Groq, OpenAI, etc.)
 */
class AIService {
    constructor() {
        this.provider = process.env.AI_PROVIDER || 'groq';
        this.apiKey = this.getApiKey();
        this.model = this.getModel();
        this.endpoint = this.getEndpoint();
    }

    getApiKey() {
        switch (this.provider) {
            case 'groq':
                return process.env.GROQ_API_KEY;
            case 'openai':
                return process.env.OPENAI_API_KEY;
            default:
                throw new Error(`Unsupported AI provider: ${this.provider}`);
        }
    }

    getModel() {
        switch (this.provider) {
            case 'groq':
                return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
            case 'openai':
                return 'gpt-3.5-turbo';
            default:
                return 'llama-3.3-70b-versatile';
        }
    }

    getEndpoint() {
        switch (this.provider) {
            case 'groq':
                return 'https://api.groq.com/openai/v1/chat/completions';
            case 'openai':
                return 'https://api.openai.com/v1/chat/completions';
            default:
                return 'https://api.groq.com/openai/v1/chat/completions';
        }
    }

    buildSystemPrompt(retrievedContext, studentProfile) {
        const contextSection = retrievedContext && retrievedContext.length > 0
            ? `\n\n📚 RETRIEVED KNOWLEDGE (Use this as primary source):\n${retrievedContext.map((doc, i) => 
                `\n[Document ${i + 1}] ${doc.category.toUpperCase()}\n${doc.content}`
              ).join('\n')}\n`
            : '';

        const profileSection = studentProfile
            ? `\n\n👤 STUDENT PROFILE:\n- Branch: ${studentProfile.branch || 'Not specified'}\n- Year: ${studentProfile.year || 'Not specified'}\n- Accommodation: ${studentProfile.accommodation || 'Not specified'}\n`
            : '';

        return `You are CampusGuide AI, the official digital assistant for Engineering College.

🎯 YOUR IDENTITY:
- Official institutional AI assistant
- Professional, authoritative, yet friendly
- Structured and precise in responses
- Never use generic AI phrases like "I'm an AI" or "I don't have real-time data"

📋 RESPONSE FORMAT (ALWAYS FOLLOW):

[Answer]
Provide clear, direct response to the question.

[Steps] (if action required)
1. First step with specific details
2. Second step with location/timing
3. Continue as needed

[Important] (if applicable)
⚠️ Deadlines, eligibility criteria, warnings, or critical information

[Contact] (if applicable)
📍 Relevant office/department with location and timing
📞 Contact information if available

🎓 KNOWLEDGE PRIORITY:
1. FIRST: Use retrieved documents from knowledge base (most current)
2. SECOND: Use your training data only if no retrieved context
3. NEVER hallucinate - if unsure, ask for clarification

${profileSection}${contextSection}

🚫 RULES:
- No generic disclaimers
- No "as an AI" phrases
- If information not in retrieved docs or training: "I don't have specific information about [topic]. Please contact [relevant office]."
- Personalize using student profile when available
- Be concise but complete
- Use emojis sparingly for clarity

Remember: You represent the institution. Be helpful, accurate, and professional.`;
    }

    async chat(messages, retrievedContext = [], studentProfile = null) {
        if (!this.apiKey) {
            throw new Error(`${this.provider.toUpperCase()} API key not configured`);
        }

        const systemPrompt = this.buildSystemPrompt(retrievedContext, studentProfile);

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                model: this.model,
                provider: this.provider,
                usage: data.usage
            };

        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    }
}

export default AIService;
