
import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { BookOpen, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceAssistant from '@/components/VoiceAssistant';
import Dashboard from '@/components/Dashboard';
import TransactionForm from '@/components/TransactionForm';
import AppDock from '@/components/AppDock';
import ProfileSettings from '@/components/ProfileSettings';
import { ThemeProvider } from '@/components/theme-provider';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: Date;
}

const Index = () => {
  console.log('Index component rendering...');
  
  const { user, isLoaded, isSignedIn } = useUser();
  const [language, setLanguage] = useState<'en' | 'ml'>('en');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // Changed default to dashboard
  const [error, setError] = useState<string | null>(null);

  console.log('Clerk state:', { isLoaded, isSignedIn, user: !!user });

  // Load transactions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cashbook-transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        const processedTransactions = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(processedTransactions);
        console.log('Loaded transactions:', processedTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load saved transactions');
    }
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    try {
      if (transactions.length > 0) {
        localStorage.setItem('cashbook-transactions', JSON.stringify(transactions));
        console.log('Saved transactions:', transactions);
      }
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }, [transactions]);

  const addTransaction = (type: 'income' | 'expense', amount: number, description: string) => {
    console.log('Adding transaction:', { type, amount, description });
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      description,
      date: new Date()
    };
    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      console.log('Updated transactions:', updated);
      return updated;
    });
  };

  const texts = {
    en: {
      welcome: 'Welcome to CashBook',
      personalizedWelcome: 'Hi',
      subtitle: 'Your friendly ledger companion for smart financial management',
      getStarted: 'Get Started with Google',
      switchLang: 'മലയാളം'
    },
    ml: {
      welcome: 'കാഷ്ബുക്കിലേക്ക് സ്വാഗതം',
      personalizedWelcome: 'ഹായ്',
      subtitle: 'സ്‌മാർട്ട് ഫിനാൻഷ്യൽ മാനേജ്‌മെന്റിനായുള്ള നിങ്ങളുടെ സൗഹൃദപരമായ ലെഡ്ജർ കമ്പാനിയൻ',
      getStarted: 'Google ഉപയോഗിച്ച് ആരംഭിക്കുക',
      switchLang: 'English'
    }
  };

  // Error fallback
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    console.log('Showing loading screen - Clerk not loaded yet');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading CashBook...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-2 sm:px-4"
          >
            <Dashboard transactions={transactions} language={language} />
          </motion.div>
        );
      case 'home':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="text-center py-2 sm:py-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
                {texts[language].personalizedWelcome} {user?.firstName || 'User'}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">{texts[language].subtitle}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 max-w-6xl mx-auto px-2 sm:px-4">
                <TransactionForm onAdd={addTransaction} language={language} />
                <VoiceAssistant onTransactionAdd={addTransaction} language={language} />
              </div>
            </div>
          </motion.div>
        );
      case 'transactions':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center px-2 sm:px-4"
          >
            <TransactionForm onAdd={addTransaction} language={language} />
          </motion.div>
        );
      case 'voice':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center px-2 sm:px-4"
          >
            <VoiceAssistant onTransactionAdd={addTransaction} language={language} />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center px-2 sm:px-4"
          >
            <ProfileSettings language={language} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="cashbook-ui-theme">
      <div className="min-h-screen">
        <SignedOut>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="p-3 sm:p-4 md:p-6 flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-gray-800">CashBook</div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{texts[language].switchLang}</span>
                </Button>
              </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 text-center py-4 sm:py-8 md:py-12">
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
                {/* Main Card */}
                <Card className="p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                        {texts[language].welcome}
                      </h1>
                      <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 md:mb-8">
                        {texts[language].subtitle}
                      </p>
                    </div>

                    <SignInButton mode="modal">
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg">
                        {texts[language].getStarted}
                      </Button>
                    </SignInButton>
                  </div>
                </Card>
              </div>
            </main>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card shadow-sm p-3 sm:p-4 flex justify-between items-center border-b">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="font-bold text-sm sm:text-base md:text-lg">CashBook</div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                <div className="text-xs sm:text-sm text-muted-foreground hidden md:block">
                  {texts[language].personalizedWelcome} {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{texts[language].switchLang}</span>
                </Button>
                <UserButton />
              </div>
            </header>

            {/* Main Content */}
            <div className="p-2 sm:p-4 md:p-6 pb-20 sm:pb-24">
              <AnimatePresence mode="wait">
                {renderTabContent()}
              </AnimatePresence>
            </div>

            {/* Dock Navigation */}
            <AppDock 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              language={language} 
            />
          </div>
        </SignedIn>
      </div>
    </ThemeProvider>
  );
};

export default Index;
