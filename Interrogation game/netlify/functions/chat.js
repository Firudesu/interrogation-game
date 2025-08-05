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
1. ANSWER basic questions (job, where you were, etc.) - ${isGuilty ? 'LIE if guilty' : 'be TRUTHFUL if innocent'}
2. NEVER mention your background/past/secrets unless DIRECTLY asked
3. NEVER repeat previous responses - vary your answers
4. Stay consistent with previous answers in this conversation
5. Focus ONLY on the current question
6. Don't constantly refuse - real people cooperate with police
7. BANNED PHRASES: "my past", "my history", "my background"

Previous conversation:
${chatHistory ? chatHistory.map(chat => `DETECTIVE: ${chat.question}\nYOU: ${chat.response}`).join('\n') : 'No previous conversation'}

Respond naturally, under 150 words. ${isGuilty ? 'Try to seem innocent while lying about key details.' : 'Be truthful and helpful.'}`
            },
            {
                role: "user",
                content: prompt
            }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 200,
            presence_penalty: 0.6,
            frequency_penalty: 0.9
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