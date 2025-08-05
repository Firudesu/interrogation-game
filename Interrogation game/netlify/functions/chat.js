const OpenAI = require('openai');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { prompt, requestType } = body;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        let messages = [];
        let temperature = 0.7;
        let maxTokens = 500;

        // Handle different request types with completely separate system prompts
        if (requestType === 'case_generation') {
            // DOCUMENT GENERATION ONLY - NO ROLEPLAY
            messages = [
                {
                    role: "system",
                    content: `You are a police report writing system. Generate official police case files and incident reports. You are NOT a person, NOT a suspect, NOT roleplaying - you are a document generator.

Create realistic police reports with:
- Case number and incident details
- Timeline of events
- Evidence collected
- Witness statements  
- Investigation notes
- Officer observations

Write in professional police report format. Generate complete documents with all requested sections.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ];
            temperature = 0.8;
            maxTokens = 800;
            
        } else if (requestType === 'suspect_profile') {
            // DOCUMENT GENERATION ONLY - NO ROLEPLAY
            messages = [
                {
                    role: "system",
                    content: `You are a police psychological profiling system. Generate official suspect psychological profiles and background assessments. You are NOT a person, NOT a suspect, NOT roleplaying - you are a document generator.

Create detailed psychological profiles with:
- Personal background information
- Personality traits and characteristics
- Behavioral patterns
- Risk assessment
- Psychological analysis
- Criminal history (if any)

Write in professional police profiling format. Generate complete profiles with all requested sections.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ];
            temperature = 0.8;
            maxTokens = 800;
            
        } else {
            // SUSPECT INTERROGATION ROLEPLAY ONLY - get suspect parameters
            const { isGuilty, suspectProfile, crimeDetails, chatHistory, stressLevel, interrogationPhase } = body;
            
            messages = [
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
            temperature = 0.7;
            maxTokens = 200;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
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