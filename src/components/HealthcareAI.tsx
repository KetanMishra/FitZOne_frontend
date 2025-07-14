import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Heart, Activity } from 'lucide-react';
import { openaiService } from '../services/openaiService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const HealthcareAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your FitZone AI Health Assistant 🏥💪 I'm here to help you with fitness, nutrition, health, and wellness questions. Ask me about calories, BMI, workout routines, diet plans, and more!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isHealthFitnessQuery = (query: string): boolean => {
    const healthKeywords = [
      'fitness', 'health', 'workout', 'exercise', 'diet', 'nutrition', 'calories', 'bmi', 
      'weight', 'muscle', 'cardio', 'strength', 'protein', 'carbs', 'fat', 'vitamin',
      'supplement', 'gym', 'training', 'running', 'walking', 'yoga', 'pilates',
      'metabolism', 'deficit', 'surplus', 'macros', 'hydration', 'sleep', 'recovery',
      'injury', 'pain', 'stretch', 'flexibility', 'endurance', 'stamina', 'heart rate',
      'blood pressure', 'cholesterol', 'diabetes', 'obesity', 'lean', 'bulk', 'cut',
      'reps', 'sets', 'form', 'technique', 'equipment', 'treadmill', 'weights',
      'bodybuilding', 'powerlifting', 'crossfit', 'hiit', 'tabata', 'circuit',
      'meal', 'food', 'eating', 'hunger', 'appetite', 'portion', 'serving',
      'organic', 'natural', 'healthy', 'unhealthy', 'junk', 'processed'
    ];
    
    const lowerQuery = query.toLowerCase();
    return healthKeywords.some(keyword => lowerQuery.includes(keyword));
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Check if the query is health/fitness related
    if (!isHealthFitnessQuery(userMessage)) {
      return "I'm sorry, but I can only help with health and fitness related questions. Please ask me about workouts, nutrition, calories, BMI, diet plans, exercise routines, or other wellness topics! 🏋️‍♂️💪";
    }

    try {
      // Try to use OpenAI API first, fallback to simulated responses
      try {
        const response = await openaiService.generateHealthResponse(userMessage);
        return response;
      } catch (apiError) {
        console.log('OpenAI API not available, using fallback responses');
        const response = await simulateHealthcareAI(userMessage);
        return response;
      }
    } catch (error) {
      return "I'm having trouble processing your request right now. Please try again in a moment! 🤖";
    }
  };

  const simulateHealthcareAI = async (query: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerQuery = query.toLowerCase();
    
    // BMI Calculator
    if (lowerQuery.includes('bmi') || lowerQuery.includes('body mass index')) {
      return `📊 **BMI Information:**

BMI (Body Mass Index) is calculated as: **Weight (kg) ÷ Height (m)²**

**BMI Categories:**
- Underweight: Below 18.5
- Normal weight: 18.5-24.9
- Overweight: 25-29.9
- Obese: 30 and above

To calculate your BMI, please provide your height and weight, and I'll help you determine your BMI and provide personalized recommendations! 📏⚖️`;
    }
    
    // Calorie Information
    if (lowerQuery.includes('calorie') || lowerQuery.includes('deficit') || lowerQuery.includes('surplus')) {
      return `🔥 **Calorie Information:**

**Daily Calorie Needs (Rough estimates):**
- Sedentary women: 1,600-2,000 calories
- Active women: 2,000-2,400 calories
- Sedentary men: 2,000-2,500 calories
- Active men: 2,500-3,000 calories

**For Weight Loss:** Create a deficit of 500-750 calories/day (lose 0.5-0.75 kg/week)
**For Weight Gain:** Create a surplus of 300-500 calories/day (gain 0.25-0.5 kg/week)

**Calorie-Dense Healthy Foods:**
- Nuts and seeds (almonds, walnuts)
- Avocados
- Olive oil
- Quinoa
- Sweet potatoes

Would you like a personalized calorie calculation? 🍎`;
    }
    
    // Workout Information
    if (lowerQuery.includes('workout') || lowerQuery.includes('exercise') || lowerQuery.includes('training')) {
      return `💪 **Workout Recommendations:**

**Beginner Routine (3x/week):**
- 5-10 min warm-up
- 20-30 min strength training
- 15-20 min cardio
- 5-10 min cool-down/stretching

**Strength Training Basics:**
- Squats: 3 sets x 8-12 reps
- Push-ups: 3 sets x 5-15 reps
- Lunges: 3 sets x 10 reps each leg
- Plank: 3 sets x 30-60 seconds

**Cardio Options:**
- Walking: 30-45 minutes
- Cycling: 20-30 minutes
- Swimming: 20-30 minutes
- HIIT: 15-20 minutes

**Recovery:** Rest 48 hours between training same muscle groups! 🏃‍♂️`;
    }
    
    // Nutrition Information
    if (lowerQuery.includes('nutrition') || lowerQuery.includes('diet') || lowerQuery.includes('protein') || lowerQuery.includes('carbs')) {
      return `🥗 **Nutrition Guidelines:**

**Macronutrient Distribution:**
- Protein: 20-30% of calories (0.8-1.2g per kg body weight)
- Carbohydrates: 45-65% of calories
- Fats: 20-35% of calories

**High-Protein Foods:**
- Chicken breast, fish, eggs
- Greek yogurt, cottage cheese
- Lentils, beans, quinoa
- Nuts and seeds

**Complex Carbs:**
- Oats, brown rice, quinoa
- Sweet potatoes, whole grains
- Fruits and vegetables

**Healthy Fats:**
- Avocados, olive oil
- Nuts, seeds, fatty fish

**Hydration:** Aim for 8-10 glasses of water daily! 💧`;
    }
    
    // Weight Loss
    if (lowerQuery.includes('weight loss') || lowerQuery.includes('lose weight') || lowerQuery.includes('fat loss')) {
      return `⚖️ **Weight Loss Strategy:**

**The Formula:** Calories In < Calories Out

**Sustainable Approach:**
1. **Create a moderate deficit:** 500-750 calories/day
2. **Combine diet + exercise:** 70% diet, 30% exercise
3. **Aim for 0.5-1 kg loss per week**

**Diet Tips:**
- Eat protein with every meal
- Fill half your plate with vegetables
- Choose whole foods over processed
- Practice portion control

**Exercise Plan:**
- 3-4 strength training sessions/week
- 2-3 cardio sessions/week
- Daily walks (10,000+ steps)

**Track Progress:**
- Weekly weigh-ins
- Body measurements
- Progress photos
- How clothes fit

Remember: Consistency beats perfection! 🎯`;
    }
    
    // Default health response
    return `🏥 **General Health Tips:**

I'm here to help with your health and fitness journey! Here are some areas I can assist with:

**Fitness & Exercise:**
- Workout routines and planning
- Exercise form and techniques
- Training frequency and intensity

**Nutrition & Diet:**
- Calorie calculations and meal planning
- Macronutrient breakdowns
- Healthy food recommendations

**Health Metrics:**
- BMI calculations and interpretations
- Body composition guidance
- Progress tracking methods

**Wellness:**
- Sleep and recovery tips
- Hydration guidelines
- Stress management through fitness

Feel free to ask me specific questions about any of these topics! What would you like to know more about? 💪🌟`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble right now. Please try again! 🤖",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse"
        >
          <div className="relative">
            <Bot className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
              <Heart className="w-2 h-2 text-white" />
            </div>
          </div>
        </button>
      )}

      {/* AI Chat Interface */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">FitZone AI Health Assistant</h3>
                <p className="text-xs opacity-90">🏥 Health & Fitness Expert</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 h-[480px] space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.isUser
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {!message.isUser && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-600">AI Health Assistant</span>
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                      <div className={`text-xs mt-1 opacity-70 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-blue-500" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about fitness, nutrition, calories, BMI..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-center mt-2 space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3" />
                    <span>Fitness</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>Health</span>
                  </div>
                  <span>•</span>
                  <span>Nutrition</span>
                  <span>•</span>
                  <span>Wellness</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default HealthcareAI;