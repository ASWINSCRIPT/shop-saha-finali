
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionFormProps {
  onAdd: (type: 'income' | 'expense', amount: number, description: string) => void;
  language: 'en' | 'ml';
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, language }) => {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const texts = {
    en: {
      addTransaction: 'Add Transaction',
      transactionType: 'Transaction Type',
      income: 'Income',
      expense: 'Expense',
      amount: 'Amount',
      description: 'Description',
      addButton: 'Add Transaction',
      amountPlaceholder: 'Enter amount (₹1 - ₹1,00,000)',
      descriptionPlaceholder: 'Brief description of transaction'
    },
    ml: {
      addTransaction: 'ഇടപാട് ചേർക്കുക',
      transactionType: 'ഇടപാടിന്റെ തരം',
      income: 'വരുമാനം',
      expense: 'ചെലവ്',
      amount: 'തുക',
      description: 'വിവരണം',
      addButton: 'ഇടപാട് ചേർക്കുക',
      amountPlaceholder: 'തുക നൽകുക (₹1 - ₹1,00,000)',
      descriptionPlaceholder: 'ഇടപാടിന്റെ ഹ്രസ്വ വിവരണം'
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1 || numAmount > 100000) {
      alert(language === 'ml' ? 'ദയവായി ₹1 മുതൽ ₹1,00,000 വരെയുള്ള സാധുവായ തുക നൽകുക' : 'Please enter a valid amount between ₹1 and ₹1,00,000');
      return;
    }
    
    if (!description.trim()) {
      alert(language === 'ml' ? 'ദയവായി ഒരു വിവരണം നൽകുക' : 'Please enter a description');
      return;
    }

    onAdd(type, numAmount, description);
    setAmount('');
    setDescription('');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'income' ? <Plus className="w-5 h-5 text-green-600" /> : <Minus className="w-5 h-5 text-red-600" />}
          {texts[language].addTransaction}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">{texts[language].transactionType}</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-green-600" />
                    {texts[language].income}
                  </div>
                </SelectItem>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-red-600" />
                    {texts[language].expense}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{texts[language].amount}</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max="100000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={texts[language].amountPlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{texts[language].description}</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={texts[language].descriptionPlaceholder}
              required
            />
          </div>

          <Button 
            type="submit" 
            className={`w-full ${type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {texts[language].addButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
