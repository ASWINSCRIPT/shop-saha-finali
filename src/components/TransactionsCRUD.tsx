import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: string;
  user_id: string;
}

const TransactionsCRUD: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<Omit<Transaction, 'id' | 'user_id'>>({
    amount: 0,
    description: '',
    date: '',
    type: 'income',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  const fetchTransactions = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    setLoading(false);
    if (error) setError(error.message);
    else setTransactions(data || []);
  };

  useEffect(() => {
    if (userId) fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!userId) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    if (editingId) {
      // Update
      const { error } = await supabase
        .from('transactions')
        .update(form)
        .eq('id', editingId)
        .eq('user_id', userId);
      if (error) setError(error.message);
      else setEditingId(null);
    } else {
      // Insert
      if (!form.date) {
        setError('Date is required.');
        setLoading(false);
        return;
      }
      const dateValue: string | Date = form.date as string | Date;
      let formattedDate = dateValue;
      if (typeof dateValue === 'object' && 'toISOString' in dateValue) {
        formattedDate = (dateValue as Date).toISOString().slice(0, 10);
      } else if (typeof dateValue === 'string' && dateValue.length > 10) {
        formattedDate = new Date(dateValue).toISOString().slice(0, 10);
      }
      const { error } = await supabase
        .from('transactions')
        .insert([{ 
          amount: Number(form.amount),
          description: form.description,
          date: formattedDate,
          type: form.type,
          user_id: userId
        }]);
      if (error) setError(error.message);
    }
    setLoading(false);
    setForm({ amount: 0, description: '', date: '', type: 'income' });
    fetchTransactions();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setForm({
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      type: transaction.type,
    });
  };

  const handleDelete = async (id: number) => {
    if (!userId) return;
    setLoading(true);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    setLoading(false);
    if (error) setError(error.message);
    fetchTransactions();
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Transactions</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        />
        <select name="type" value={form.type} onChange={handleChange} style={{ marginRight: 8 }}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button type="submit" disabled={loading}>{editingId ? 'Update' : 'Add'}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ amount: 0, description: '', date: '', type: 'income' }); }}>
            Cancel
          </button>
        )}
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading && <div>Loading...</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Date</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.amount}</td>
              <td>{tx.description}</td>
              <td>{tx.date}</td>
              <td>{tx.type}</td>
              <td>
                <button onClick={() => handleEdit(tx)} style={{ marginRight: 8 }}>Edit</button>
                <button onClick={() => handleDelete(tx.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsCRUD; 