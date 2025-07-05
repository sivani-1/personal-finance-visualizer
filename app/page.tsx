"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useMemo } from "react";

interface Transaction {
  _id?: string;
  amount: number;
  description: string;
  date: string;
  category: string;
}

const CATEGORIES = ["Food", "Rent", "Transport", "Shopping", "Utilities", "Other"];
const COLORS = ["#f87171", "#fb923c", "#facc15", "#34d399", "#60a5fa", "#a78bfa"];

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<Transaction>({ amount: 0, description: "", date: "", category: "Other" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<{ category: string; amount: number; month: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [newBudget, setNewBudget] = useState<{ category: string; amount: number }>({ category: "Food", amount: 0 });


  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  async function fetchBudgets() {
    const res = await fetch("/api/budgets");
    const data = await res.json();
    setBudgets(data.filter((b: any) => b.month === selectedMonth));
  }

  async function handleBudgetSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newBudget, month: selectedMonth }),
    });
    setNewBudget({ category: "Food", amount: 0 });
    fetchBudgets();
  }

  const actuals = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const totalSpent = transactions
        .filter((tx) => tx.category === cat && tx.date.startsWith(selectedMonth))
        .reduce((sum, tx) => sum + tx.amount, 0);
      const budget = budgets.find((b) => b.category === cat)?.amount || 0;
      return { category: cat, budget, actual: totalSpent };
    });
  }, [budgets, transactions, selectedMonth]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date || !form.category) return alert("Fill all fields");
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/transactions/${editingId}` : "/api/transactions";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ amount: 0, description: "", date: "", category: "Other" });
    setEditingId(null);
    fetchTransactions();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    fetchTransactions();
  }

  async function handleEdit(tx: Transaction) {
    setForm({ amount: tx.amount, description: tx.description, date: tx.date.split("T")[0], category: tx.category });
    setEditingId(tx._id!);
  }

  const monthlyData = Object.values(
    transactions.reduce((acc, tx) => {
      const month = format(new Date(tx.date), "yyyy-MM");
      acc[month] = acc[month] || { month, total: 0 };
      acc[month].total += tx.amount;
      return acc;
    }, {} as Record<string, { month: string; total: number }>)
  );

  const categoryData = CATEGORIES.map((cat, index) => {
    const total = transactions.filter((tx) => tx.category === cat).reduce((sum, tx) => sum + tx.amount, 0);
    return { name: cat, value: total, fill: COLORS[index] };
  });

  const totalExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <main className="p-4 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: +e.target.value })}
              required
            />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="sm:col-span-4">
              {editingId ? "Update" : "Add"} Transaction
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-lg">Transactions</h2>
          {transactions.map((tx) => (
            <div key={tx._id} className="flex justify-between items-center border-b py-2">
              <div>
                <p className="font-medium">{tx.description} ({tx.category})</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(tx.date), "yyyy-MM-dd")} - ₹{tx.amount}
                </p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(tx)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(tx._id!)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-2">Monthly Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-2">Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg">Total Expenses: ₹{totalExpenses}</h2>
        </CardContent>
      </Card>

  <Card>
    <CardContent className="p-4 space-y-4">
      <h2 className="font-semibold text-lg">Set Monthly Budgets</h2>
      <form onSubmit={handleBudgetSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Select value={newBudget.category} onValueChange={(val) => setNewBudget({ ...newBudget, category: val })}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Budget amount"
          value={newBudget.amount}
          onChange={(e) => setNewBudget({ ...newBudget, amount: +e.target.value })}
        />
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <Button type="submit">Save</Button>
      </form>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="p-4">
      <h2 className="font-semibold text-lg mb-2">Budget vs Actual</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={actuals}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="budget" fill="#4ade80" name="Budget" />
          <Bar dataKey="actual" fill="#f87171" name="Actual" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  {actuals.some(a => a.budget > 0 && a.actual > a.budget) && (
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-2 text-red-600">⚠ Over Budget Warnings</h2>
          <ul className="list-disc pl-5 space-y-1">
            {actuals.map((entry) => (
              entry.budget > 0 && entry.actual > entry.budget && (
                <li key={entry.category}>
                  <span className="text-red-500 font-medium">{entry.category}</span>: Over by ₹{entry.actual - entry.budget}
                </li>
              )
            ))}
          </ul>
        </CardContent>
      </Card>
    )}
    </main>
  );
}


