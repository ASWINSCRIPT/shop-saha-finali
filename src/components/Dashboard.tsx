
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: Date;
}

interface DashboardProps {
  transactions: Transaction[];
  language: 'en' | 'ml';
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, language }) => {
  const texts = {
    en: {
      dashboard: 'Analytics Dashboard',
      last30Days: 'Last 30 Days Overview',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      netGain: 'Net Balance',
      dailyTransactions: 'Daily Transactions',
      incomeVsExpenses: 'Income vs Expenses',
      recentTransactions: 'Recent Transactions',
      income: 'Income',
      expense: 'Expense',
      rupees: '₹',
      noData: 'No transactions yet'
    },
    ml: {
      dashboard: 'അനലിറ്റിക്സ് ഡാഷ്ബോർഡ്',
      last30Days: 'കഴിഞ്ഞ 30 ദിവസത്തെ അവലോകനം',
      totalIncome: 'മൊത്തം വരുമാനം',
      totalExpenses: 'മൊത്തം ചെലവ്',
      netGain: 'അറ്റ ബാലൻസ്',
      dailyTransactions: 'ദൈനിക ഇടപാടുകൾ',
      incomeVsExpenses: 'വരുമാനം vs ചെലവ്',
      recentTransactions: 'സമീപകാല ഇടപാടുകൾ',
      income: 'വരുമാനം',
      expense: 'ചെലവ്',
      rupees: '₹',
      noData: 'ഇതുവരെ ഇടപാടുകളില്ല'
    }
  };

  // Filter transactions for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentTransactions = transactions.filter(t => t.date >= thirtyDaysAgo);
  
  const totalIncome = recentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netGain = totalIncome - totalExpenses;

  // Prepare chart data
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTransactions = recentTransactions.filter(t => 
      t.date.toDateString() === date.toDateString()
    );
    
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      income: dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expense: dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    };
  });

  const pieData = [
    { name: texts[language].income, value: totalIncome, color: '#4ade80' },
    { name: texts[language].expense, value: totalExpenses, color: '#f87171' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {texts[language].dashboard}
        </h1>
        <div className="text-xs sm:text-sm text-gray-500">
          {texts[language].last30Days}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-800">
              {texts[language].totalIncome}
            </CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-900">
              {texts[language].rupees}{totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-red-800">
              {texts[language].totalExpenses}
            </CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-900">
              {texts[language].rupees}{totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${netGain >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-xs sm:text-sm font-medium ${netGain >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              {texts[language].netGain}
            </CardTitle>
            <DollarSign className={`h-3 w-3 sm:h-4 sm:w-4 ${netGain >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${netGain >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              {netGain >= 0 ? '+' : '-'}{texts[language].rupees}{Math.abs(netGain).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {recentTransactions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">{texts[language].dailyTransactions}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`₹${value}`, '']} />
                  <Bar dataKey="income" fill="#4ade80" name={texts[language].income} />
                  <Bar dataKey="expense" fill="#f87171" name={texts[language].expense} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">{texts[language].incomeVsExpenses}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `₹${entry.value.toLocaleString()}`}
                    labelStyle={{ fontSize: 12 }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-600">{texts[language].noData}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              {texts[language].recentTransactions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
              {recentTransactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">
                        {transaction.type === 'income' ? texts[language].income : texts[language].expense}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{transaction.description}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs sm:text-sm font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
