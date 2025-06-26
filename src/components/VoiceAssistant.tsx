
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface VoiceAssistantProps {
  onTransactionAdd: (type: 'income' | 'expense', amount: number, description: string) => void;
  language: 'en' | 'ml';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onTransactionAdd, language }) => {
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForHey, setIsWaitingForHey] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const texts = {
    en: {
      sayHey: 'Say "Hey CashBook" to start',
      listening: 'Listening...',
      notListening: 'Click to activate voice',
      processingTransaction: 'Processing transaction...'
    },
    ml: {
      sayHey: '"ഹേയ് കാഷ്ബുക്ക്" എന്ന് പറയൂ',
      listening: 'കേൾക്കുന്നു...',
      notListening: 'വോയ്‌സ് സജീവമാക്കാൻ ക്ലിക്ക് ചെയ്യുക',
      processingTransaction: 'ഇടപാട് പ്രോസസ്സ് ചെയ്യുന്നു...'
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'ml' ? 'ml-IN' : 'en-IN';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript.toLowerCase());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [language]);

  const processVoiceCommand = (command: string) => {
    console.log('Processing command:', command);
    
    // Check for activation phrase
    if (isWaitingForHey) {
      if (command.includes('hey cashbook') || command.includes('ഹേയ് കാഷ്ബുക്ക്')) {
        setIsWaitingForHey(false);
        speak(language === 'ml' ? 'ഞാൻ തയ്യാറാണ്. എന്താണ് നിങ്ങളുടെ ഇടപാട്?' : 'I am ready. What is your transaction?');
        return;
      }
      return;
    }

    // Process transaction commands
    const numbers = extractNumbers(command);
    if (numbers.length > 0) {
      const amount = numbers[0];
      
      if (command.includes('income') || command.includes('വരുമാനം') || command.includes('got') || command.includes('received')) {
        onTransactionAdd('income', amount, command);
        speak(language === 'ml' ? `${amount} രൂപ വരുമാനം രേഖപ്പെടുത്തി` : `Income of ${amount} rupees recorded`);
      } else if (command.includes('expense') || command.includes('ചെലവ്') || command.includes('spent') || command.includes('paid')) {
        onTransactionAdd('expense', amount, command);
        speak(language === 'ml' ? `${amount} രൂപ ചെലവ് രേഖപ്പെടുത്തി` : `Expense of ${amount} rupees recorded`);
      }
      
      // Reset to waiting state
      setTimeout(() => {
        setIsWaitingForHey(true);
      }, 3000);
    }
  };

  const extractNumbers = (text: string): number[] => {
    const numberWords = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'ഒന്ന്': 1, 'രണ്ട്': 2, 'മൂന്ന്': 3, 'നാല്': 4, 'അഞ്ച്': 5,
      'ആറ്': 6, 'ഏഴ്': 7, 'എട്ട്': 8, 'ഒമ്പത്': 9, 'പത്ത്': 10
    };
    
    const numbers: number[] = [];
    
    // Extract digit numbers
    const digitMatches = text.match(/\d+/g);
    if (digitMatches) {
      numbers.push(...digitMatches.map(n => parseInt(n)).filter(n => n <= 100000));
    }
    
    // Extract word numbers
    Object.entries(numberWords).forEach(([word, value]) => {
      if (text.includes(word)) {
        numbers.push(value);
      }
    });
    
    return numbers;
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ml' ? 'ml-IN' : 'en-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">CashBook Assistant</h3>
        </div>
        
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          size="lg"
          className="w-20 h-20 rounded-full"
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isWaitingForHey 
              ? texts[language].sayHey
              : isListening 
                ? texts[language].listening 
                : texts[language].notListening
            }
          </p>
          {transcript && (
            <p className="text-xs text-blue-600 mt-2 italic">"{transcript}"</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VoiceAssistant;
