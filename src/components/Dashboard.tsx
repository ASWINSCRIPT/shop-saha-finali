
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
      dashboard: 'Dashboard',
      last30Days: 'Last 30 Days Overview',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      netGain: 'Net Gain',
      dailyTransactions: 'Daily Transactions',
      incomeVsExpenses: 'Income vs Expenses',
      recentTransactions: 'Recent Transactions',
      income: 'Income',
      expense: 'Expense',
      rupees: '₹'
    },
    ml: {
      dashboard: 'ഡാഷ്ബോർഡ്',
      last30Days: 'കഴിഞ്ഞ 30 ദിവസത്തെ അവലോകനം',
      totalIncome: 'മൊത്തം വരുമാനം',
      totalExpenses: 'മൊത്തം ചെലവ്',
      netGain: 'അറ്റ ​​ലാഭം',
      dailyTransactions: 'ദൈനിക ഇടപാടുകൾ',
      incomeVsExpenses: 'വരുമാനം vs ചെലവ്',
      recentTransactions: 'സമീപകാല ഇടപാടുകൾ',
      income: 'വരുമാനം',
      expense: 'ചെലവ്',
      rupees: '₹'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {texts[language].dashboard}
        </h1>
        <div className="text-sm text-gray-500">
          {texts[language].last30Days}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              {texts[language].totalIncome}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {texts[language].rupees}{totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              {texts[language].totalExpenses}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {texts[language].rupees}{totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${netGain >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${netGain >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              {texts[language].netGain}
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${netGain >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netGain >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              {texts[language].rupees}{Math.abs(netGain).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{texts[language].dailyTransactions}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, '']} />
                <Bar dataKey="income" fill="#4ade80" name={texts[language].income} />
                <Bar dataKey="expense" fill="#f87171" name={texts[language].expense} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{texts[language].incomeVsExpenses}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `₹${entry.value.toLocaleString()}`}
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

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {texts[language].recentTransactions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">
                      {transaction.type === 'income' ? texts[language].income : texts[language].expense}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
