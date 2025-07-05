import { connectToDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function GET() {
  await connectToDB();
  const transactions = await Transaction.find().sort({ date: -1 });
  return Response.json(transactions);
}

export async function POST(req: Request) {
  await connectToDB();
  const body = await req.json();

  const { amount, date, description, category } = body;
  if (!amount || !date || !description || !category) {
    return new Response("Missing fields", { status: 400 });
  }

  const created = await Transaction.create({ amount, date, description, category });
  return Response.json(created);
}



