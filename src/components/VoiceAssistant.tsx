
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
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const texts = {
    en: {
      listening: 'Listening for transactions...',
      notListening: 'Click to start voice recording',
      processingTransaction: 'Processing transaction...'
    },
    ml: {
      listening: 'ഇടപാടുകൾക്കായി കേൾക്കുന്നു...',
      notListening: 'വോയ്‌സ് റെക്കോർഡിംഗ് ആരംഭിക്കാൻ ക്ലിക്ക് ചെയ്യുക',
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
          console.log('Voice transcript received:', finalTranscript);
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
    console.log('Processing voice command:', command);
    
    // Process transaction commands directly without activation phrase
    const numbers = extractNumbers(command);
    console.log('Extracted numbers:', numbers);
    
    if (numbers.length > 0) {
      const amount = numbers[0];
      let transactionType: 'income' | 'expense' | null = null;
      let description = command;
      
      // Determine transaction type with better pattern matching
      if (command.includes('income') || command.includes('വരുമാനം') || 
          command.includes('got') || command.includes('received') || 
          command.includes('earned') || command.includes('salary') ||
          command.includes('profit') || command.includes('credit')) {
        transactionType = 'income';
      } else if (command.includes('expense') || command.includes('ചെലവ്') || 
                 command.includes('spent') || command.includes('paid') ||
                 command.includes('bought') || command.includes('cost') ||
                 command.includes('rupees') || command.includes('purchase')) {
        transactionType = 'expense';
      }
      
      // If no specific type mentioned but amount is present, default to expense
      if (!transactionType && amount > 0) {
        transactionType = 'expense';
      }
      
      if (transactionType && amount > 0 && amount <= 100000) {
        console.log(`Adding ${transactionType} transaction:`, { amount, description });
        
        // Add the transaction
        onTransactionAdd(transactionType, amount, description);
        
        // Provide feedback
        const feedbackMessage = language === 'ml' 
          ? `${amount} രൂപ ${transactionType === 'income' ? 'വരുമാനം' : 'ചെലവ്'} രേഖപ്പെടുത്തി`
          : `${transactionType === 'income' ? 'Income' : 'Expense'} of ${amount} rupees recorded`;
        
        speak(feedbackMessage);
        console.log('Transaction added successfully:', feedbackMessage);
        
        // Clear transcript after processing
        setTimeout(() => {
          setTranscript('');
        }, 3000);
      } else {
        console.log('Could not determine transaction type or amount invalid');
        speak(language === 'ml' ? 'ഇടപാട് മനസ്സിലായില്ല. വീണ്ടും ശ്രമിക്കൂ.' : 'Transaction not understood. Please try again.');
      }
    } else {
      console.log('No numbers found in command');
      speak(language === 'ml' ? 'തുക പറയൂ' : 'Please mention the amount');
    }
  };

  const extractNumbers = (text: string): number[] => {
    const numberWords = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
      'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
      'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
      'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000,
      'ഒന്ന്': 1, 'രണ്ട്': 2, 'മൂന്ന്': 3, 'നാല്': 4, 'അഞ്ച്': 5,
      'ആറ്': 6, 'ഏഴ്': 7, 'എട്ട്': 8, 'ഒമ്പത്': 9, 'പത്ത്': 10,
      'പതിനൊന്ന്': 11, 'പന്ത്രണ്ട്': 12, 'പതിമൂന്ന്': 13, 'പതിനാല്': 14, 'പതിനഞ്ച്': 15,
      'പതിനാറ്': 16, 'പതിനേഴ്': 17, 'പതിനെട്ട്': 18, 'പത്തൊമ്പത്': 19, 'ഇരുപത്': 20,
      'മുപ്പത്': 30, 'നാല്പത്': 40, 'അമ്പത്': 50, 'അറുപത്': 60, 'എഴുപത്': 70,
      'എണ്‍പത്': 80, 'തൊണ്ണൂറ്': 90, 'നൂറ്': 100, 'ആയിരം': 1000
    };
    
    const numbers: number[] = [];
    
    // Extract digit numbers (including decimals)
    const digitMatches = text.match(/\d+\.?\d*/g);
    if (digitMatches) {
      numbers.push(...digitMatches.map(n => parseFloat(n)).filter(n => n > 0 && n <= 100000));
    }
    
    // Extract word numbers with better parsing
    let currentNum = 0;
    let result = 0;
    
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (numberWords[word]) {
        const value = numberWords[word];
        
        if (value === 100 || value === 1000) {
          if (currentNum === 0) currentNum = 1;
          currentNum *= value;
          result += currentNum;
          currentNum = 0;
        } else {
          currentNum += value;
        }
      }
    }
    
    if (currentNum > 0) {
      result += currentNum;
    }
    
    if (result > 0 && result <= 100000) {
      numbers.push(result);
    }
    
    console.log('Number extraction from text:', text, 'Found numbers:', numbers);
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
      console.log('Voice recognition stopped');
    } else {
      recognition.start();
      setIsListening(true);
      console.log('Voice recognition started');
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h3 className="text-base sm:text-lg font-semibold text-blue-800">CashBook Assistant</h3>
        </div>
        
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          size="lg"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
        >
          {isListening ? <MicOff className="w-6 h-6 sm:w-8 sm:h-8" /> : <Mic className="w-6 h-6 sm:w-8 sm:h-8" />}
        </Button>
        
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            {isListening 
              ? texts[language].listening 
              : texts[language].notListening
            }
          </p>
          {transcript && (
            <p className="text-xs text-blue-600 mt-2 italic break-words">"{transcript}"</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VoiceAssistant;
