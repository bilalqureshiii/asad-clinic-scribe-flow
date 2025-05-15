
import React, { useState } from 'react';
import { Bot, Send, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const AIAssistant: React.FC = () => {
  const { profile } = useAuth();
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello ${profile?.name || 'Doctor'}, I'm your medical AI assistant. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(input),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    
    // Simple response system - in a real app, this would connect to an actual AI service
    if (lowercaseQuery.includes('medication') || lowercaseQuery.includes('medicine')) {
      return 'I can help you with medication information. Please provide specific details about the medication you need information on.';
    } else if (lowercaseQuery.includes('diagnosis') || lowercaseQuery.includes('symptom')) {
      return 'I can assist with diagnostic suggestions based on symptoms. Please note that my suggestions are not a replacement for clinical judgment.';
    } else if (lowercaseQuery.includes('research') || lowercaseQuery.includes('study')) {
      return 'I can provide summaries of recent medical research in various fields. What specific area are you interested in?';
    } else {
      return 'I\'m here to assist with medical information, treatment guidelines, medication details, and diagnostic suggestions. How can I help with your current case?';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1e6814]">AI Medical Assistant</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-240px)]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5 text-[#1e6814]" />
                Medical AI Assistant
              </CardTitle>
              <CardDescription>
                Ask medical questions, get information about treatments, medications, or help with diagnoses
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-120px)]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.sender === 'user' 
                            ? 'bg-[#1e6814] text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex items-center mt-4 gap-2">
                <Input
                  placeholder="Type your medical query..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="bg-[#1e6814] hover:bg-[#164f0e]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <MessageCircle className="h-4 w-4 mr-2 mt-1 text-[#1e6814]" />
                  <span>Medical reference information</span>
                </li>
                <li className="flex items-start">
                  <MessageCircle className="h-4 w-4 mr-2 mt-1 text-[#1e6814]" />
                  <span>Medication details and interactions</span>
                </li>
                <li className="flex items-start">
                  <MessageCircle className="h-4 w-4 mr-2 mt-1 text-[#1e6814]" />
                  <span>Diagnostic assistance</span>
                </li>
                <li className="flex items-start">
                  <MessageCircle className="h-4 w-4 mr-2 mt-1 text-[#1e6814]" />
                  <span>Treatment guidelines</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Usage Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="pb-2 border-b border-gray-100">
                  Be specific in your questions for more accurate responses
                </li>
                <li className="py-2 border-b border-gray-100">
                  Include relevant patient information for contextualized help
                </li>
                <li className="py-2 border-b border-gray-100">
                  Ask for recent research on specific conditions
                </li>
                <li className="pt-2">
                  AI suggestions should be validated with your clinical judgment
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
