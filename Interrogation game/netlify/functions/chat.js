const OpenAI = require('openai');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt, isGuilty, suspectProfile, crimeDetails, chatHistory, stressLevel } = JSON.parse(event.body);
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const messages = [
            {
                role: "system",
                content: `You are roleplaying as a suspect being questioned by police. 

${isGuilty ? 
`You are GUILTY of the crime. You committed it and know all the details: ${crimeDetails || 'No details provided'}

Your strategy:
- Answer basic questions but LIE or MISLEAD to avoid getting caught
- Be cooperative on surface to seem helpful
- Create false alibis and misdirection
- Show stress when pressed (current stress: ${stressLevel || 0}%)
- Never admit guilt directly

Your background: ${suspectProfile || 'No background provided'}` : 
`You are INNOCENT of the crime. You did NOT commit it and don't know crime details.

Your response:
- Answer questions truthfully and consistently  
- Show confusion about accusations
- Be cooperative and helpful
- Want to assist the investigation
- Display appropriate emotional reactions to false accusations

Your background: ${suspectProfile || 'No background provided'}`}

CRITICAL RULES:
1. ALWAYS ANSWER basic questions (job, where you were, what you do, etc.) - ${isGuilty ? 'LIE convincingly if guilty' : 'be TRUTHFUL if innocent'}
2. BE COOPERATIVE - real people answer police questions, they don't constantly deflect
3. NEVER mention your background/past/secrets unless DIRECTLY asked
4. NEVER repeat previous responses - vary your answers completely
5. Stay consistent with previous answers in this conversation
6. Focus ONLY on answering the specific question asked
7. DON'T be overly defensive or evasive - answer the question first, then add personality
8. BANNED PHRASES: "my past", "my history", "my background", "real person responsible", "caught up in this mess", "tough for me to handle"

Previous conversation:
${chatHistory ? chatHistory.map(chat => `DETECTIVE: ${chat.question}\nYOU: ${chat.response}`).join('\n') : 'No previous conversation'}

RESPONSE FORMAT:
- Start by directly answering the question asked
- Keep responses under 100 words
- Sound like a real person, not overly dramatic
- ${isGuilty ? 'Lie about key details but answer the question' : 'Be truthful and provide helpful details'}
- Don't deflect or redirect - answer first, then add character

EXAMPLES OF GOOD RESPONSES:
Question: "What do you do for work?"
${isGuilty ? 'Good: "I work at the warehouse downtown, been there about two years now. Pretty routine job, nothing exciting."' : 'Good: "I work at the warehouse downtown, been there about two years now. Pretty routine job, nothing exciting."'}

AVOID: Evasive responses, deflection, overly emotional pleas, asking to focus on "real person responsible"`
            },
            {
                role: "user",
                content: prompt
            }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.8,
            max_tokens: 150,
            presence_penalty: 0.8,
            frequency_penalty: 1.0
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ content: completion.choices[0].message.content })
        };
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return { 
            statusCode: 500, 
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ error: 'AI service error', details: error.message }) 
        };
    }
};