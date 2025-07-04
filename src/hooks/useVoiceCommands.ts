
import { useEffect, useRef } from 'react';

interface UseVoiceCommandsProps {
  onDashboardOpen: () => void;
  language: 'en' | 'ml';
}

export const useVoiceCommands = ({ onDashboardOpen, language }: UseVoiceCommandsProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = language === 'ml' ? 'ml-IN' : 'en-IN';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        if (transcript.includes('dashboard') || transcript.includes('ഡാഷ്ബോർഡ്')) {
          onDashboardOpen();
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Global voice recognition error:', event.error);
      };

      recognitionRef.current = recognition;
      recognition.start();

      return () => {
        recognition.stop();
      };
    }
  }, [language, onDashboardOpen]);

  return recognitionRef.current;
};
