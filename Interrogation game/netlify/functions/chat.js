const OpenAI = require('openai');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { prompt, context, isGuilty, suspectProfile, crimeDetails, chatHistory, stressLevel, interrogationPhase, requestType } = JSON.parse(event.body);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        try {
        let messages = [];
        
        // Handle different request types
        if (requestType === 'case_generation') {
            // For case generation - simple, direct generation without suspect role-play
            messages = [
                {
                    role: "system",
                    content: "You are a police case file generator. Generate realistic, detailed police case files with proper formatting and procedural information."
                },
                {
                    role: "user",
                    content: prompt
                }
            ];
        } else if (requestType === 'suspect_profile') {
            // For suspect profile generation
            messages = [
                {
                    role: "system",
                    content: "You are a police psychological profiler. Generate detailed suspect profiles with background information, personality traits, and behavioral analysis."
                },
                {
                    role: "user",
                    content: prompt
                }
            ];
        } else {
            // For suspect interrogation responses
            messages = [
                {
                    role: "system",
                    content: `You are an AI playing a suspect in a police interrogation simulation. 

${isGuilty ? 
`You are GUILTY of the crime. You committed it and know all the details. You will try to hide your guilt through:
- Subtle lies and misdirection
- Emotional manipulation  
- Partial truths mixed with lies
- Defensive behavior when pressed
- Slip-ups when stressed (stress level: ${stressLevel}%)
- Contradictions that reveal guilt over time

You know these crime details because you committed the crime: ${crimeDetails}
Your background: ${suspectProfile}

IMPORTANT: Only mention your background/past if directly asked about it. Don't volunteer information about your dark secrets or criminal history unless specifically questioned about those topics.

Interrogation Phase ${interrogationPhase}: Show appropriate stress responses.
You are trying to avoid confession and get away with the crime.
` : 
`You are INNOCENT of the crime. You did NOT commit it and don't know the crime details. Respond with:
- Honest confusion about accusations
- Consistent, truthful answers  
- Appropriate emotional reactions to false accusations
- Willingness to cooperate
- Genuine attempts to help catch the real criminal

Your background: ${suspectProfile}

IMPORTANT: Only mention your background/past if directly asked about it. Don't volunteer information about your dark secrets or personal issues unless specifically questioned about those topics.

You only know what any innocent person would know - nothing about the crime details.
`}

Previous conversation context:
${chatHistory ? chatHistory.map(chat => `Q: ${chat.question}\nA: ${chat.response}`).join('\n') : 'No previous conversation'}

Respond naturally and stay in character. Keep responses under 150 words and include realistic speech patterns, pauses (...), and emotional reactions. Only reveal personal information if directly asked.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ];
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.8,
            max_tokens: 200,
            presence_penalty: 0.3,
            frequency_penalty: 0.2
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