import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest,{ params }: { params: { id: string } }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "😠 Unauthorized" }, { status: 401 });
  }

  try {
    const { completed, title, description } = await req.json();
    const todoId = params.id;

    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      return NextResponse.json({ error: "😵 Todo not found" }, { status: 404 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ error: "🚫 Forbidden" }, { status: 403 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        completed: completed !== undefined ? completed : todo.completed,
        title: title !== undefined ? title : todo.title,
        description: description !== undefined ? description : todo.description,
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
      console.error("❌Error updating todo:", error);
      return NextResponse.json(
          { error: "🚫 Internal Server Error" },
          { status: 500 }
      );
  }
}