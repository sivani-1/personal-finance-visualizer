
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
  const created = await Transaction.create(body);
  return Response.json(created);
}
