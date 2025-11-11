import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import './FinancialCoach.css';

const FinancialCoach = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [coachProfile, setCoachProfile] = useState({});

  useEffect(() => {
    initializeCoach();
  }, [userId]);

  const initializeCoach = () => {
    const profile = {
      name: 'Alex',
      avatar: '🤖',
      expertise: ['Budgeting', 'Investing', 'Debt Management', 'Savings'],
      greeting: 'Hi! I\'m Alex, your AI Financial Coach. I\'m here to help you make smarter financial decisions. What would you like to discuss today?'
    };

    setCoachProfile(profile);
    setMessages([
      {
        id: 1,
        sender: 'coach',
        message: profile.greeting,
        timestamp: new Date(),
        type: 'greeting'
      }
    ]);
  };

  const quickQuestions = [
    'How can I reduce my monthly expenses?',
    'What\'s the best way to build an emergency fund?',
    'Should I pay off debt or invest first?',
    'How much should I save for retirement?',
    'What are some good investment options for beginners?',
    'How can I improve my credit score?'
  ];

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      message: message.trim(),
      timestamp: new Date(),
      type: 'question'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateCoachResponse(message.trim());
      const coachMessage = {
        id: messages.length + 2,
        sender: 'coach',
        message: response.message,
        timestamp: new Date(),
        type: response.type,
        actions: response.actions
      };

      setMessages(prev => [...prev, coachMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateCoachResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('expense') || lowerMessage.includes('reduce') || lowerMessage.includes('cut')) {
      return {
        message: 'Great question! Here are some effective ways to reduce your monthly expenses:\n\n1. **Track everything** - Use the analytics in your dashboard to see where your money goes\n2. **Cancel unused subscriptions** - I noticed you might have some inactive subscriptions\n3. **Cook at home more** - Your dining out expenses are above average\n4. **Negotiate bills** - Call providers for better rates on utilities and insurance\n5. **Use the 24-hour rule** - Wait a day before non-essential purchases\n\nWould you like me to analyze your specific spending patterns?',
        type: 'advice',
        actions: ['Analyze My Spending', 'Set Expense Goals', 'Create Budget Plan']
      };
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('fund')) {
      return {
        message: 'Building an emergency fund is crucial! Here\'s my recommended approach:\n\n**Start Small**: Aim for ₹83,000 first, then build to 3-6 months of expenses\n**Automate**: Set up automatic transfers to a separate savings account\n**High-yield account**: Keep it in a savings account that earns interest\n**Don\'t touch it**: Only use for true emergencies\n\nBased on your current expenses (~₹2,65,600/month), you should aim for ₹7,96,800-₹15,93,600. You\'re currently at ₹2,82,200 - great start!',
        type: 'advice',
        actions: ['Set Emergency Goal', 'Automate Savings', 'Find High-Yield Account']
      };
    }

    if (lowerMessage.includes('debt') || lowerMessage.includes('invest')) {
      return {
        message: 'This is a common dilemma! Here\'s my framework:\n\n**Pay debt first if**:\n- Interest rates > 6-7%\n- You have high-interest credit card debt\n- Debt causes you stress\n\n**Invest while paying debt if**:\n- You have employer 401k match (free money!)\n- Interest rates < 4-5%\n- You have stable emergency fund\n\n**My recommendation**: Get the full employer match first, then tackle high-interest debt, then invest more aggressively.',
        type: 'advice',
        actions: ['Debt Payoff Calculator', 'Investment Options', 'Create Debt Plan']
      };
    }

    if (lowerMessage.includes('retirement') || lowerMessage.includes('save')) {
      return {
        message: 'Retirement planning is all about starting early! Here\'s what I recommend:\n\n**The 10-15% Rule**: Save 10-15% of your income for retirement\n**Take advantage of**:\n- Employer PF match (contribute enough to get full match)\n- PPF for tax-free growth\n- ELSS for tax deductions now\n\n**Your situation**: With ₹3,73,500 monthly income, aim to save ₹37,350-₹56,025/month for retirement. The retirement calculator in your planning section can help you see if you\'re on track!',
        type: 'advice',
        actions: ['Retirement Calculator', 'Set Retirement Goal', '401k Optimization']
      };
    }

    if (lowerMessage.includes('invest') || lowerMessage.includes('beginner')) {
      return {
        message: 'Perfect timing to start investing! Here are beginner-friendly options:\n\n**Start with**:\n- Target-date funds (automatically diversified)\n- Index funds (low fees, broad market exposure)\n- ETFs (flexible, low cost)\n\n**Avoid**:\n- Individual stock picking (too risky for beginners)\n- Complex products you don\'t understand\n\n**My advice**: Start with a target-date fund in your 401k or IRA. It\'s like having a professional manage your investments automatically!',
        type: 'advice',
        actions: ['Investment Guide', 'Portfolio Analysis', 'Risk Assessment']
      };
    }

    if (lowerMessage.includes('credit') || lowerMessage.includes('score')) {
      return {
        message: 'Improving your credit score takes time but it\'s worth it! Here\'s how:\n\n**Pay on time** (35% of score): Never miss payments\n**Keep balances low** (30% of score): Use <30% of credit limits\n**Don\'t close old cards**: Length of history matters (15%)\n**Mix of credit**: Cards + loans show you can handle different types (10%)\n**Limit new accounts**: Too many inquiries hurt your score (10%)\n\n**Quick wins**: Pay down credit card balances and set up autopay for all bills.',
        type: 'advice',
        actions: ['Credit Score Tips', 'Debt Payoff Plan', 'Payment Automation']
      };
    }

    // Default response
    return {
      message: 'That\'s a great question! I\'d love to help you with that. Based on your financial profile, I can provide personalized advice on budgeting, saving, investing, and debt management.\n\nCould you be more specific about what aspect of your finances you\'d like to improve? For example:\n- Reducing expenses\n- Building savings\n- Investment strategies\n- Debt payoff plans\n- Retirement planning',
      type: 'clarification',
      actions: ['Expense Analysis', 'Savings Plan', 'Investment Guide', 'Debt Strategy']
    };
  };

  const handleActionClick = (action) => {
    handleSendMessage(`Tell me more about: ${action}`);
  };

  return (
    <div className="financial-coach">
      <div className="coach-header">
        <div className="coach-profile">
          <span className="coach-avatar">{coachProfile.avatar}</span>
          <div className="coach-info">
            <h3>{coachProfile.name} - AI Financial Coach</h3>
            <p>Specialized in: {coachProfile.expertise?.join(', ')}</p>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-content">
                <div className="message-text">
                  {msg.message.split('\n').map((line, index) => (
                    <div key={index}>
                      {line.startsWith('**') && line.endsWith('**') ? (
                        <strong>{line.slice(2, -2)}</strong>
                      ) : line.startsWith('- ') ? (
                        <div className="bullet-point">{line}</div>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>
                {msg.actions && (
                  <div className="message-actions">
                    {msg.actions.map((action, index) => (
                      <Button
                        key={index}
                        className="action-btn"
                        onClick={() => handleActionClick(action)}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message coach">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="quick-questions">
          <h4>💡 Quick Questions:</h4>
          <div className="questions-grid">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                className="question-btn"
                onClick={() => handleSendMessage(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        <div className="input-area">
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about your finances..."
              className="message-input"
            />
            <Button 
              onClick={() => handleSendMessage()}
              className="send-btn"
              disabled={!inputMessage.trim() || isTyping}
            >
              Send 📤
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCoach;