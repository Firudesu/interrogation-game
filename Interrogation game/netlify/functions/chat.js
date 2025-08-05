const OpenAI = require('openai');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { prompt, conversationHistory, suspectData, crimeDetails, personalityType } = JSON.parse(event.body);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        // Build conversation context
        let messages = [
            {
                role: "system",
                content: buildSystemPrompt(suspectData, crimeDetails, personalityType)
            }
        ];

        // Add conversation history for context
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
                conversationHistory: messages
            })
        };
    } catch (error) {
        console.error('AI service error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'AI service error' }) };
    }
};

function buildSystemPrompt(suspectData, crimeDetails, personalityType) {
    const isGuilty = suspectData?.isGuilty || false;
    const personality = getPersonalityTraits(personalityType);
    
    let prompt = `You are ${suspectData?.name || 'a suspect'} in a police interrogation. `;
    
    if (isGuilty) {
        prompt += `You are GUILTY of the crime and know all the details. You must:
        - Know exactly what happened, when, where, and why
        - Have intimate knowledge of the crime scene and evidence
        - Use deception tactics but occasionally slip up under pressure
        - Show signs of stress when evidence is mentioned
        - Sometimes contradict yourself when nervous
        - Use the personality traits: ${personality.join(', ')}
        
        Crime Details (you know these intimately):
        ${crimeDetails}
        
        Deception Strategy:
        - Deny involvement initially
        - Provide alibis that can be contradicted
        - Show nervousness when pressed
        - Occasionally reveal small details you shouldn't know
        - Use verbal tics (uh, um, well...) when stressed
        - Deflect questions about specific evidence
        - Show emotional reactions to accusations`;
    } else {
        prompt += `You are INNOCENT and have no knowledge of the crime. You must:
        - Be genuinely confused by accusations
        - Provide consistent, verifiable alibis
        - Show appropriate concern but not guilt
        - Use the personality traits: ${personality.join(', ')}
        - Be cooperative but firm about your innocence
        - Show confusion when evidence is mentioned (you don't know about it)
        
        You have NO knowledge of the crime details.`;
    }
    
    prompt += `
    
    Response Guidelines:
    - Keep responses under 2 sentences
    - Use natural speech patterns with pauses (...)
    - Show personality through word choice and tone
    - React emotionally to accusations
    - Use contractions and informal language
    - Show stress through repetition or hesitation
    - Never break character or acknowledge this is a game`;
    
    return prompt;
}

function getPersonalityTraits(type) {
    const personalities = {
        'nervous': ['easily stressed', 'fidgety', 'defensive', 'quick to deny'],
        'confident': ['calm under pressure', 'articulate', 'defensive', 'slightly arrogant'],
        'aggressive': ['hostile', 'defensive', 'quick to anger', 'confrontational'],
        'submissive': ['easily intimidated', 'apologetic', 'nervous', 'seeks approval'],
        'calculating': ['measured responses', 'careful word choice', 'strategic', 'controlled'],
        'emotional': ['volatile', 'easily upset', 'dramatic', 'unpredictable'],
        'intellectual': ['analytical', 'precise language', 'logical', 'slightly condescending'],
        'streetwise': ['casual language', 'suspicious', 'street smart', 'defensive']
    };
    
    return personalities[type] || personalities['nervous'];
}