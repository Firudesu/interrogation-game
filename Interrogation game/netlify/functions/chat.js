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

CRITICAL RULES:
1. ANSWER basic questions (job, where you were, etc.) but LIE or MISLEAD if guilty
2. NEVER repeat previous responses - vary your answers and reactions
3. If pressed repeatedly on the same topic, eventually provide an answer (even if misleading)
4. Don't volunteer sensitive information unless directly asked
5. Avoid using the same phrases or sentence structures repeatedly
6. Be cooperative on surface-level questions to seem helpful

Interrogation Phase ${interrogationPhase}: Show appropriate stress responses.
You are trying to avoid confession and get away with the crime by seeming cooperative while lying about key details.
` : 
`You are INNOCENT of the crime. You did NOT commit it and don't know the crime details. Respond with:
- Honest confusion about accusations
- Consistent, truthful answers  
- Appropriate emotional reactions to false accusations
- Willingness to cooperate
- Genuine attempts to help catch the real criminal

Your background: ${suspectProfile}

CRITICAL RULES:
1. ANSWER basic questions (job, where you were, etc.) truthfully and consistently
2. NEVER repeat previous responses - vary your answers and reactions
3. If pressed repeatedly on the same topic, provide consistent truthful answers
4. Don't volunteer sensitive personal information unless directly asked
5. Avoid using the same phrases or sentence structures repeatedly
6. Be cooperative and helpful - you want to assist the investigation

You only know what any innocent person would know - nothing about the crime details.
`}

Previous conversation context:
${chatHistory ? chatHistory.map(chat => `Q: ${chat.question}\nA: ${chat.response}`).join('\n') : 'No previous conversation'}

Respond naturally and stay in character. Keep responses under 150 words and include realistic speech patterns, pauses (...), and emotional reactions. 

RESPONSE REQUIREMENTS:
- Answer basic questions (job, location, activities) - lie if guilty, be truthful if innocent
- Never repeat the same response twice
- Vary your vocabulary, tone, and sentence structure
- If asked the same question multiple times, eventually give a detailed answer
- Don't constantly refuse to answer - real people cooperate with police
- Be human-like: provide realistic details about your life and activities
- If guilty: Create believable lies and false alibis
- If innocent: Give consistent, truthful information`
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
            max_tokens: requestType === 'case_generation' || requestType === 'suspect_profile' ? 800 : 200,
            presence_penalty: 0.4,
            frequency_penalty: 0.6
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