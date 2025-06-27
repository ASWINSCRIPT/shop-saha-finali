
import { BookOpen, Home, BarChart3, Mic, Settings, Sun, Moon } from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { useTheme } from '@/components/theme-provider';

interface AppDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: 'en' | 'ml';
}

const AppDock: React.FC<AppDockProps> = ({ activeTab, onTabChange, language }) => {
  const { theme, setTheme } = useTheme();

  const tabs = [
    {
      id: 'home',
      icon: Home,
      label: language === 'ml' ? 'ഹോം' : 'Home'
    },
    {
      id: 'transactions', 
      icon: BookOpen,
      label: language === 'ml' ? 'ഇടപാടുകൾ' : 'Transactions'
    },
    {
      id: 'dashboard',
      icon: BarChart3, 
      label: language === 'ml' ? 'ഡാഷ്ബോർഡ്' : 'Dashboard'
    },
    {
      id: 'voice',
      icon: Mic,
      label: language === 'ml' ? 'വോയ്‌സ്' : 'Voice'
    },
    {
      id: 'settings',
      icon: Settings,
      label: language === 'ml' ? 'സെറ്റിംഗ്സ്' : 'Settings'
    }
  ];

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Dock className="items-end pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <DockItem
              key={tab.id}
              className={`aspect-square rounded-full transition-colors cursor-pointer ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <DockLabel>{tab.label}</DockLabel>
              <DockIcon>
                <Icon className="h-full w-full" />
              </DockIcon>
            </DockItem>
          );
        })}
        
        <DockItem
          className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 cursor-pointer"
          onClick={toggleTheme}
        >
          <DockLabel>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</DockLabel>
          <DockIcon>
            {theme === 'light' ? (
              <Moon className="h-full w-full" />
            ) : (
              <Sun className="h-full w-full" />
            )}
          </DockIcon>
        </DockItem>
      </Dock>
    </div>
  );
};

export default AppDock;
