# Enhanced Police Interrogation Simulator 2000

A sophisticated detective game where you interrogate AI-powered suspects using advanced psychological profiling and deception detection.

## 🚀 Major Improvements

### 1. **Enhanced Crime Generation System**
- **Diverse Crime Types**: Burglary, Assault, Fraud, Drug Offenses
- **Realistic Scenarios**: Each crime type has multiple realistic scenarios
- **Detailed Case Files**: Comprehensive crime details with specific evidence and witness statements
- **Perpetrator Knowledge**: Guilty suspects have full knowledge of the crime details

### 2. **Advanced Personality System**
- **8 Personality Types**: Nervous, Confident, Quiet, Aggressive, Cooperative, Calculating, Emotional, Stoic
- **Behavioral Patterns**: Each personality affects how suspects respond to interrogation
- **Stress Reactions**: Different personalities handle pressure differently
- **Realistic Responses**: AI adapts responses based on personality traits

### 3. **Improved Deception Mechanics**
- **Slip-up Detection**: Advanced algorithms detect when guilty suspects reveal incriminating details
- **Stress-Based Responses**: Higher stress levels lead to more obvious deception patterns
- **Contradiction Tracking**: System tracks inconsistencies in suspect statements
- **Confession Triggers**: High stress can induce realistic confessions

### 4. **Enhanced ChatGPT Integration**
- **Conversation Memory**: AI maintains context of the entire interrogation
- **Personality-Driven Responses**: Responses are tailored to suspect's personality type
- **Crime Knowledge**: Guilty suspects know crime details and must lie convincingly
- **Stress Simulation**: AI responses reflect increasing stress levels

### 5. **Visual Improvements**
- **Enhanced Windows 2000 Aesthetic**: Improved retro desktop appearance
- **Stress Meter**: Visual stress indicator with color gradient
- **Phase Indicators**: Shows current interrogation phase
- **Personality Badges**: Visual indicators for suspect personality types
- **Pulse Animation**: Visual feedback for high-stress situations

### 6. **Better Game Mechanics**
- **Case Numbers**: Realistic case numbering system
- **Evidence Tracking**: Detailed evidence management
- **Slip-up Logging**: Tracks specific deception markers
- **Phase Progression**: 8-phase interrogation system based on stress levels

## 🎮 How to Play

1. **Start Interrogation**: Click "BEGIN INTERROGATION" to start a new case
2. **Review Case File**: Access case details, evidence, and suspect information
3. **Ask Questions**: Type questions to interrogate the suspect
4. **Monitor Stress**: Watch the stress meter and phase indicators
5. **Analyze Responses**: Look for deception patterns and contradictions
6. **Make Verdict**: Determine if the suspect is guilty or innocent
7. **Continue Cases**: Play through multiple cases to improve your detective skills

## 🔍 Key Features

### Personality Types
- **Nervous**: Anxious, fidgety, uses lots of "um" and "uh"
- **Confident**: Self-assured, articulate, can be arrogant
- **Quiet**: Reserved, speaks softly, hard to read
- **Aggressive**: Defensive, confrontational, quick to anger
- **Cooperative**: Helpful but naive, may volunteer too much
- **Calculating**: Careful with words, strategic responses
- **Emotional**: Expressive, wears heart on sleeve
- **Stoic**: Unemotional, matter-of-fact, minimal responses

### Deception Detection
- **Evasion Markers**: "I don't recall", "maybe", "possibly"
- **Minimization**: "just", "only", "merely"
- **Projection**: "someone else", "they must have"
- **Stress Indicators**: "um", "uh", "you know", pauses
- **Contradictions**: "but", "however", "actually"

### Interrogation Phases
1. **Strong Denial**: Closed body language, firm denials
2. **Moral Justification**: Partial agreement with excuses
3. **Avoidance**: Increased fidgeting and avoidance
4. **Quick Explanations**: Shaky voice, rushed responses
5. **False Cooperation**: Pretending to help
6. **Emotional Outbursts**: Anger and frustration
7. **Hesitant Options**: Difficulty making choices
8. **Confession Breakdown**: Complete breakdown

## 🛠️ Technical Improvements

### Backend Enhancements
- **GPT-4 Integration**: Upgraded to GPT-4 for better responses
- **Conversation History**: Maintains full interrogation context
- **Stress Calculation**: Advanced algorithms for stress detection
- **Personality Integration**: AI responses reflect personality types

### Frontend Improvements
- **Responsive Design**: Better layout and usability
- **Visual Feedback**: Enhanced stress indicators and animations
- **Information Display**: Better organization of case information
- **User Experience**: Improved navigation and interaction

## 🚀 Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   - Add your OpenAI API key to Netlify environment variables
   - Variable name: `OPENAI_API_KEY`

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Deploy to Production**:
   ```bash
   npm run deploy
   ```

## 🎯 Game Strategy Tips

1. **Start Broad**: Ask general questions to establish baseline behavior
2. **Look for Patterns**: Notice how the suspect's personality affects responses
3. **Build Stress**: Use evidence and pressure to increase stress levels
4. **Watch for Slip-ups**: Pay attention to contradictions and evasion
5. **Consider Personality**: Different personalities require different approaches
6. **Use Evidence**: Reference specific evidence to catch lies
7. **Monitor Phases**: Understand how interrogation phases affect behavior

## 🔧 Customization

The game can be easily customized by modifying:
- `CRIME_TYPES` array for new crime scenarios
- `PERSONALITY_TYPES` for different personality traits
- Deception detection patterns in the analysis functions
- Visual styling in the CSS
- AI prompt engineering in the backend functions

## 📊 Performance Metrics

The game tracks:
- Stress levels and progression
- Deception patterns detected
- Slip-ups and contradictions
- Interrogation phase progression
- Success rate and accuracy

## 🤝 Contributing

Feel free to contribute improvements:
- Add new crime types and scenarios
- Enhance personality systems
- Improve deception detection algorithms
- Add new visual features
- Optimize AI prompts

## 📄 License

MIT License - Feel free to use and modify as needed.

---

**Note**: This enhanced version maintains the core Windows 2000 aesthetic while significantly improving the gameplay mechanics, AI integration, and overall user experience.