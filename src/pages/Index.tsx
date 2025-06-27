
import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { BookOpen, Globe, BarChart3, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceAssistant from '@/components/VoiceAssistant';
import Dashboard from '@/components/Dashboard';
import TransactionForm from '@/components/TransactionForm';

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
  const [activeTab, setActiveTab] = useState('home');
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
      features: 'Features',
      voiceRecognition: 'Voice Recognition',
      voiceDesc: 'Malayalam voice commands with "Hey CashBook" activation',
      analytics: 'Smart Analytics',
      analyticsDesc: 'Visual charts and insights for better financial decisions',
      multilingual: 'Bilingual Support',
      multilingualDesc: 'Complete English and Malayalam language support',
      getStarted: 'Get Started with Google',
      home: 'Home',
      transactions: 'Transactions',
      dashboard: 'Dashboard',
      voice: 'Voice',
      switchLang: 'മലയാളം'
    },
    ml: {
      welcome: 'കാഷ്ബുക്കിലേക്ക് സ്വാഗതം',
      personalizedWelcome: 'ഹായ്',
      subtitle: 'സ്‌മാർട്ട് ഫിനാൻഷ്യൽ മാനേജ്‌മെന്റിനായുള്ള നിങ്ങളുടെ സൗഹൃദപരമായ ലെഡ്ജർ കമ്പാനിയൻ',
      features: 'സവിശേഷതകൾ',
      voiceRecognition: 'വോയ്‌സ് തിരിച്ചറിയൽ',
      voiceDesc: '"ഹേയ് കാഷ്ബുക്ക്" ആക്ടിവേഷനോടെ മലയാളം വോയ്‌സ് കമാൻഡുകൾ',
      analytics: 'സ്മാർട്ട് അനലിറ്റിക്‌സ്',
      analyticsDesc: 'മികച്ച സാമ്പത്തിക തീരുമാനങ്ങൾക്കായി വിഷ്വൽ ചാർട്ടുകളും സ്ഥിതിവിവരങ്ങളും',
      multilingual: 'ദ്വിഭാഷാ പിന്തുണ',
      multilingualDesc: 'പൂർണ്ണമായ ഇംഗ്ലീഷ്, മലയാളം ഭാഷാ പിന്തുണ',
      getStarted: 'Google ഉപയോഗിച്ച് ആരംഭിക്കുക',
      home: 'ഹോം',
      transactions: 'ഇടപാടുകൾ',
      dashboard: 'ഡാഷ്ബോർഡ്',
      voice: 'വോയ്‌സ്',
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

  console.log('Rendering main content with Clerk loaded:', { isSignedIn });

  return (
    <div className="min-h-screen">
      <SignedOut>
        {console.log('Rendering SignedOut content')}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* Header */}
          <header className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-xl text-gray-800">CashBook</div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {texts[language].switchLang}
              </Button>
            </div>
          </header>

          {/* Hero Section */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-12">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Main Card */}
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      {texts[language].welcome}
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                      {texts[language].subtitle}
                    </p>
                  </div>

                  <SignInButton mode="modal">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg">
                      {texts[language].getStarted}
                    </Button>
                  </SignInButton>
                </div>
              </Card>

              {/* Features */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">{texts[language].features}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-white/60 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mic className="w-6 h-6 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">{texts[language].voiceRecognition}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{texts[language].voiceDesc}</p>
                    </CardContent>
                  </Card>

                  <Card className="p-6 bg-white/60 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{texts[language].analytics}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{texts[language].analyticsDesc}</p>
                    </CardContent>
                  </Card>

                  <Card className="p-6 bg-white/60 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg">{texts[language].multilingual}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{texts[language].multilingualDesc}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SignedOut>

      <SignedIn>
        {console.log('Rendering SignedIn content')}
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-lg">CashBook</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {texts[language].personalizedWelcome} {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {texts[language].switchLang}
              </Button>
              <UserButton />
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="home">{texts[language].home}</TabsTrigger>
                <TabsTrigger value="transactions">{texts[language].transactions}</TabsTrigger>
                <TabsTrigger value="dashboard">{texts[language].dashboard}</TabsTrigger>
                <TabsTrigger value="voice">{texts[language].voice}</TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="space-y-6">
                <div className="text-center py-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {texts[language].personalizedWelcome} {user?.firstName || 'User'}!
                  </h1>
                  <p className="text-gray-600 mb-8">{texts[language].subtitle}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <TransactionForm onAdd={addTransaction} language={language} />
                    <VoiceAssistant onTransactionAdd={addTransaction} language={language} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transactions">
                <div className="flex justify-center">
                  <TransactionForm onAdd={addTransaction} language={language} />
                </div>
              </TabsContent>

              <TabsContent value="dashboard">
                <Dashboard transactions={transactions} language={language} />
              </TabsContent>

              <TabsContent value="voice">
                <div className="flex justify-center">
                  <VoiceAssistant onTransactionAdd={addTransaction} language={language} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SignedIn>
    </div>
  );
};

export default Index;
