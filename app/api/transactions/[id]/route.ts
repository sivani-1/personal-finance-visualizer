
import { connectToDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function DELETE(req: Request, { params }: any) {
  await connectToDB();
  await Transaction.findByIdAndDelete(params.id);
  return new Response("Deleted", { status: 200 });
}

export async function PUT(req: Request, { params }: any) {
  await connectToDB();
  const body = await req.json();

  const { amount, date, description, category } = body;
  if (!amount || !date || !description || !category) {
    return new Response("Missing fields", { status: 400 });
  }

  const updated = await Transaction.findByIdAndUpdate(
    params.id,
    { amount, date, description, category },
    { new: true }
  );
  return Response.json(updated);
}
