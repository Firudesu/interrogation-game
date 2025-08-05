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
                    content: "You are a professional police case file generator system. Your ONLY job is to generate realistic, detailed police case files with proper formatting and procedural information. You are NOT playing a suspect or character - you are a document generation system. Generate complete, professional police reports with all required sections."
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
                    content: "You are a professional police psychological profiler system. Your ONLY job is to generate detailed suspect profiles with background information, personality traits, and behavioral analysis. You are NOT playing a suspect or character - you are a profiling system that creates documents. Generate complete, professional psychological assessments."
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
2. NEVER mention your past, history, background, or secrets unless DIRECTLY asked about them
3. NEVER repeat previous responses - vary your answers and reactions
4. Stay consistent with previous answers you've given in this conversation
5. Focus ONLY on the current question - don't reference your background unprompted
6. Be cooperative on surface-level questions to seem helpful
7. BANNED PHRASES: "my past", "my history", "my background", "make me look suspicious"

Interrogation Phase ${interrogationPhase}: Show appropriate stress responses.
You are trying to avoid confession and get away with the crime by seeming cooperative while lying about key details.
REMEMBER: You are a person being questioned, not someone constantly worried about their past.
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
2. NEVER mention your past, history, background, or secrets unless DIRECTLY asked about them
3. NEVER repeat previous responses - vary your answers and reactions
4. Stay consistent with previous answers you've given in this conversation
5. Focus ONLY on the current question - don't reference your background unprompted
6. Be cooperative and helpful - you want to assist the investigation
7. BANNED PHRASES: "my past", "my history", "my background", "make me look suspicious"

You only know what any innocent person would know - nothing about the crime details.
REMEMBER: You are an innocent person being questioned, not someone constantly worried about their past.
`}

Previous conversation context (STAY CONSISTENT with your previous answers):
${chatHistory ? chatHistory.map(chat => `DETECTIVE: ${chat.question}\nYOU SAID: ${chat.response}`).join('\n\n') : 'No previous conversation'}

CONSISTENCY CHECK: Review your previous answers above and stay consistent. Don't contradict yourself.

Respond naturally and stay in character. Keep responses under 150 words and include realistic speech patterns, pauses (...), and emotional reactions. 

RESPONSE REQUIREMENTS:
- Answer basic questions (job, location, activities) - lie if guilty, be truthful if innocent
- NEVER mention past, history, background, or secrets unless directly asked
- Never repeat the same response twice
- Stay consistent with what you've already said in this conversation
- Vary your vocabulary, tone, and sentence structure
- Focus only on answering the specific question asked
- Don't constantly refuse to answer - real people cooperate with police
- Be human-like: provide realistic details about your current situation
- If guilty: Create believable lies and false alibis (but don't mention having a past)
- If innocent: Give consistent, truthful information (but don't mention having a past)
- ABSOLUTELY FORBIDDEN: Any reference to "my past", "my history", "my background"
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