"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Transaction {
  _id?: string;
  amount: number;
  description: string;
  date: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<Transaction>({ amount: 0, description: "", date: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

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
    if (!form.description || !form.amount || !form.date) return alert("Fill all fields");
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/transactions/${editingId}` : "/api/transactions";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ amount: 0, description: "", date: "" });
    setEditingId(null);
    fetchTransactions();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    fetchTransactions();
  }

  async function handleEdit(tx: Transaction) {
    setForm({ amount: tx.amount, description: tx.description, date: tx.date.split("T")[0] });
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

  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            <Button type="submit" className="sm:col-span-3">
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
                <p className="font-medium">{tx.description}</p>
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
    </main>
  );
}