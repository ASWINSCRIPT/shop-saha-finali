
import React, { useState, useEffect, useRef } from 'react';
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
  const [autoActivationTimer, setAutoActivationTimer] = useState<number | null>(null);
  const [isComponentActive, setIsComponentActive] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      listening: 'Listening for transactions...',
      notListening: 'Touch to start voice recording',
      processingTransaction: 'Processing transaction...',
      autoActivating: 'Auto-activating in',
      seconds: 'seconds'
    },
    ml: {
      listening: 'ഇടപാടുകൾക്കായി കേൾക്കുന്നു...',
      notListening: 'വോയ്‌സ് റെക്കോർഡിംഗ് ആരംഭിക്കാൻ സ്പർശിക്കുക',
      processingTransaction: 'ഇടപാട് പ്രോസസ്സ് ചെയ്യുന്നു...',
      autoActivating: 'സ്വയം സജീവമാക്കുന്നു',
      seconds: 'സെക്കൻഡിൽ'
    }
  };

  // Initialize speech recognition
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
        
        // Auto-retry on certain errors
        if (event.error === 'network' || event.error === 'audio-capture') {
          setTimeout(() => {
            if (isComponentActive) {
              startListening();
            }
          }, 2000);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (isComponentActive && isListening) {
          // Auto-restart if component is still active
          setTimeout(() => {
            if (isComponentActive) {
              recognition.start();
            }
          }, 500);
        }
      };

      setRecognition(recognition);
    }
  }, [language, isComponentActive]);

  // Auto-activation on component touch/focus
  useEffect(() => {
    const handleComponentInteraction = () => {
      if (!isComponentActive) {
        setIsComponentActive(true);
        startAutoActivationTimer();
      }
    };

    const component = componentRef.current;
    if (component) {
      component.addEventListener('touchstart', handleComponentInteraction);
      component.addEventListener('mouseenter', handleComponentInteraction);
      component.addEventListener('focus', handleComponentInteraction);
      
      return () => {
        component.removeEventListener('touchstart', handleComponentInteraction);
        component.removeEventListener('mouseenter', handleComponentInteraction);
        component.removeEventListener('focus', handleComponentInteraction);
      };
    }
  }, [isComponentActive]);

  const startAutoActivationTimer = () => {
    if (autoActivationTimer) {
      clearTimeout(autoActivationTimer);
    }
    
    const timer = window.setTimeout(() => {
      if (!isListening && isComponentActive) {
        startListening();
      }
    }, 6000);
    
    setAutoActivationTimer(timer);
  };

  const startListening = () => {
    if (!recognition) return;
    
    try {
      recognition.start();
      setIsListening(true);
      console.log('Voice recognition started');
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  const stopListening = () => {
    if (!recognition) return;
    
    recognition.stop();
    setIsListening(false);
    console.log('Voice recognition stopped');
  };

  const processVoiceCommand = (command: string) => {
    console.log('Processing voice command:', command);
    
    const numbers = extractNumbers(command);
    console.log('Extracted numbers:', numbers);
    
    if (numbers.length > 0) {
      const amount = numbers[0];
      let transactionType: 'income' | 'expense' | null = null;
      let description = command;
      
      // Enhanced pattern matching for better recognition
      const incomePatterns = [
        'income', 'വരുമാനം', 'got', 'received', 'earned', 'salary',
        'profit', 'credit', 'വന്നു', 'കിട്ടി', 'സാലറി', 'ലാഭം'
      ];
      
      const expensePatterns = [
        'expense', 'ചെലവ്', 'spent', 'paid', 'bought', 'cost',
        'purchase', 'വാങ്ങി', 'കൊടുത്തു', 'ചിലവ്', 'പേയ്മെന്റ്'
      ];
      
      // Check for income patterns
      if (incomePatterns.some(pattern => command.includes(pattern))) {
        transactionType = 'income';
      }
      // Check for expense patterns
      else if (expensePatterns.some(pattern => command.includes(pattern))) {
        transactionType = 'expense';
      }
      // Default to expense if amount is mentioned without specific type
      else if (amount > 0) {
        transactionType = 'expense';
      }
      
      if (transactionType && amount > 0 && amount <= 100000) {
        console.log(`Adding ${transactionType} transaction:`, { amount, description });
        
        onTransactionAdd(transactionType, amount, description);
        
        const feedbackMessage = language === 'ml' 
          ? `${amount} രൂപ ${transactionType === 'income' ? 'വരുമാനം' : 'ചെലവ്'} രേഖപ്പെടുത്തി`
          : `${transactionType === 'income' ? 'Income' : 'Expense'} of ${amount} rupees recorded`;
        
        speak(feedbackMessage);
        console.log('Transaction added successfully:', feedbackMessage);
        
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
      // English numbers
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
      'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
      'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
      'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000,
      
      // Malayalam numbers
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
    
    // Enhanced word number parsing
    let currentNum = 0;
    let result = 0;
    
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (numberWords[word] !== undefined) {
        const value = numberWords[word];
        
        if (value === 100) {
          if (currentNum === 0) currentNum = 1;
          currentNum *= 100;
        } else if (value === 1000) {
          if (currentNum === 0) currentNum = 1;
          currentNum *= 1000;
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
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ml' ? 'ml-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    setIsComponentActive(true);
    
    if (autoActivationTimer) {
      clearTimeout(autoActivationTimer);
      setAutoActivationTimer(null);
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoActivationTimer) {
        clearTimeout(autoActivationTimer);
      }
      if (recognition && isListening) {
        recognition.stop();
      }
    };
  }, []);

  return (
    <Card 
      ref={componentRef}
      className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 w-full max-w-md mx-auto touch-manipulation"
      tabIndex={0}
    >
      <div className="flex flex-col items-center space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-800">CashBook Assistant</h3>
        </div>
        
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          size="lg"
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full touch-manipulation active:scale-95 transition-transform"
        >
          {isListening ? (
            <MicOff className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          ) : (
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          )}
        </Button>
        
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {isListening 
              ? texts[language].listening 
              : texts[language].notListening
            }
          </p>
          
          {!isListening && isComponentActive && autoActivationTimer && (
            <p className="text-xs text-blue-600 mt-1">
              {texts[language].autoActivating}...
            </p>
          )}
          
          {transcript && (
            <p className="text-xs text-blue-600 mt-2 italic break-words bg-white/50 p-2 rounded">
              "{transcript}"
            </p>
          )}
        </div>
        
        {/* Mobile-friendly help text */}
        <div className="text-xs text-gray-500 text-center mt-2 space-y-1">
          <p>Say: "100 rupees expense" or "500 income"</p>
          <p className="text-xs">{language === 'ml' ? '"100 രൂപ ചെലവ്" അല്ലെങ്കിൽ "500 വരുമാനം"' : 'Touch the mic or wait 6 seconds for auto-start'}</p>
        </div>
      </div>
    </Card>
  );
};

export default VoiceAssistant;
