const OpenAI = require('openai');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { prompt, conversationHistory, personalityType, isGuilty, crimeDetails, stressLevel, interrogationPhase } = JSON.parse(event.body);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        // Build conversation context
        let messages = [
            {
                role: "system",
                content: buildSystemPrompt(personalityType, isGuilty, crimeDetails, stressLevel, interrogationPhase)
            }
        ];

        // Add conversation history if provided
        if (conversationHistory && conversationHistory.length > 0) {
            conversationHistory.forEach(entry => {
                messages.push({ role: "user", content: entry.question });
                messages.push({ role: "assistant", content: entry.response });
            });
        }

        // Add current prompt
        messages.push({ role: "user", content: prompt });

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
            temperature: 0.8,
            max_tokens: 300,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                content: completion.choices[0].message.content,
                stressIncrease: calculateStressIncrease(completion.choices[0].message.content, isGuilty)
            })
        };
    } catch (error) {
        console.error('AI service error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'AI service error' }) };
    }
};

function buildSystemPrompt(personalityType, isGuilty, crimeDetails, stressLevel, interrogationPhase) {
    const personalityTraits = getPersonalityTraits(personalityType);
    const deceptionPatterns = getDeceptionPatterns(isGuilty, stressLevel);
    const phaseBehavior = getPhaseBehavior(interrogationPhase);
    
    let prompt = `You are a suspect in a police interrogation. You must respond as a real person would.

PERSONALITY PROFILE:
${personalityTraits}

CURRENT STATE:
- Stress Level: ${stressLevel}%
- Interrogation Phase: ${interrogationPhase}/8
- Phase Behavior: ${phaseBehavior}

${isGuilty ? buildGuiltyPrompt(crimeDetails, deceptionPatterns) : buildInnocentPrompt()}

RESPONSE GUIDELINES:
- Keep responses under 2 sentences
- Use natural speech patterns with um, uh, pauses (...)
- Show emotional reactions appropriate to stress level
- If guilty: Use deception tactics but occasionally slip up under pressure
- If innocent: Be cooperative but confused by accusations
- Never break character or acknowledge this is a game

Respond naturally to the interrogator's question.`;

    return prompt;
}

function getPersonalityTraits(type) {
    const personalities = {
        'nervous': 'Anxious, fidgety, easily stressed. Uses lots of "um" and "uh". Quick to become defensive.',
        'confident': 'Self-assured, articulate, maintains eye contact. Can be arrogant or dismissive.',
        'quiet': 'Reserved, speaks softly, gives short answers. Hard to read emotionally.',
        'aggressive': 'Defensive, confrontational, quick to anger. Uses strong language and accusations.',
        'cooperative': 'Helpful, wants to assist, but can be naive. May volunteer too much information.',
        'calculating': 'Careful with words, thinks before speaking, strategic in responses.',
        'emotional': 'Expressive, wears heart on sleeve, can be easily moved to tears or anger.',
        'stoic': 'Unemotional, matter-of-fact, difficult to read. Gives minimal responses.'
    };
    return personalities[type] || personalities['nervous'];
}

function getDeceptionPatterns(isGuilty, stressLevel) {
    if (!isGuilty) return [];
    
    const patterns = [
        'Minimization: "It was just a small thing"',
        'Projection: "Someone else must have done it"',
        'Rationalization: "I had no choice"',
        'Denial: "I don\'t remember that"',
        'Deflection: "Why are you asking me about this?"',
        'Mirroring: Repeating interrogator\'s words',
        'Strategic pauses: Using silence to think',
        'Over-explaining: Too much detail on simple questions'
    ];
    
    // Higher stress = more obvious deception patterns
    if (stressLevel > 70) {
        patterns.push('Contradictions: Changing story details');
        patterns.push('Emotional outbursts: "I didn\'t do anything wrong!"');
        patterns.push('Verbal tics: Excessive um, uh, you know');
    }
    
    return patterns.slice(0, 4 + Math.floor(stressLevel / 20));
}

function getPhaseBehavior(phase) {
    const phases = {
        1: 'Strong denial with closed body language',
        2: 'Partial agreement with moral justification',
        3: 'Increased avoidance and fidgeting',
        4: 'Quick explanations with shaky voice',
        5: 'False cooperation tactics',
        6: 'Emotional outbursts',
        7: 'Hesitant option choosing',
        8: 'Confession breakdown'
    };
    return phases[phase] || 'Normal interrogation exchange';
}

function buildGuiltyPrompt(crimeDetails, deceptionPatterns) {
    return `YOU ARE GUILTY AND KNOW THE CRIME DETAILS:
${crimeDetails}

DECEPTION TACTICS TO USE:
${deceptionPatterns.join('\n')}

IMPORTANT: You know exactly what happened but must lie convincingly. Under high stress, you may slip up and reveal details only the perpetrator would know.`;
}

function buildInnocentPrompt() {
    return `YOU ARE INNOCENT:
- You have no knowledge of the crime
- Be cooperative but confused by accusations
- Provide honest alibis and explanations
- Show appropriate concern about being accused
- Ask clarifying questions about the case`;
}

function calculateStressIncrease(response, isGuilty) {
    if (!isGuilty) return 0;
    
    let stressIncrease = 0;
    
    // Deception markers that indicate stress
    const markers = {
        'um': 1, 'uh': 1, 'you know': 2, 'like': 1,
        'I don\'t remember': 3, 'maybe': 2, 'possibly': 2,
        'I think': 2, 'I believe': 2, 'probably': 2,
        '...': 1, 'well': 1, 'actually': 1
    };
    
    Object.entries(markers).forEach(([marker, value]) => {
        const matches = (response.match(new RegExp(marker, 'gi')) || []).length;
        stressIncrease += matches * value;
    });
    
    // Contradictions and emotional markers
    if (response.includes('!') || response.includes('?')) stressIncrease += 2;
    if (response.toLowerCase().includes('why are you')) stressIncrease += 3;
    if (response.toLowerCase().includes('accusing')) stressIncrease += 4;
    
    return Math.min(stressIncrease, 15);
}