import { connectToDB } from "@/lib/mongodb";
import Budget from "@/models/Budget";

export async function GET() {
  await connectToDB();
  const budgets = await Budget.find();
  return Response.json(budgets);
}

export async function POST(req: Request) {
  await connectToDB();
  const { category, amount, month } = await req.json();
  const existing = await Budget.findOne({ category, month });
  if (existing) {
    existing.amount = amount;
    await existing.save();
    return Response.json(existing);
  }
  const created = await Budget.create({ category, amount, month });
  return Response.json(created);
}

export async function PUT(req: Request) {
  await connectToDB();
  const { category, amount, month } = await req.json();
  const updated = await Budget.findOneAndUpdate(
    { category, month },
    { amount },
    { new: true }
  );
  return Response.json(updated);
}

export async function DELETE(req: Request) {
  await connectToDB();
  const { category, month } = await req.json();
  await Budget.findOneAndDelete({ category, month });
  return new Response("Budget deleted", { status: 200 });
}