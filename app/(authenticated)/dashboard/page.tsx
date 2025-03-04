"use client";


import { useCallback, useEffect, useState } from "react";
import { TodoItem } from "@/components/TodoItem";
import { TodoForm } from "@/components/TodoForm";
import { Todo } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, Loader2} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { useDebounceValue } from "usehooks-ts";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);

  const fetchTodos = useCallback(
    async (page: number) => {
      try {
        const response = await fetch(
          `/api/todos?page=${page}&search=${debouncedSearchTerm}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch todos");
        }
        const data = await response.json();
        setTodos(data.todos);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setIsLoading(false);
        toast.success("Todos fetched successfully.");
      } catch (error) {
          console.error(error);
        setIsLoading(false);
        toast.error("Failed to fetch user data. Please try again.");
      }
    },
    [debouncedSearchTerm]
  );

  useEffect(() => {
    fetchTodos(1);
    fetchSubscriptionStatus();
  }, [fetchTodos]);

  const fetchSubscriptionStatus = async () => {
    const response = await fetch("/api/subscription");
    if (response.ok) {
      const data = await response.json();
      setIsSubscribed(data.isSubscribed);
    }
    };
    const handleAddTodo = async (title:string) => {console.log(title) };
    const handleUpdateTodo = async () => { };
    const handleDeleteTodo = async () => { };

  return (
    <div className="container mx-auto p-4 max-w-3xl mb-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome, {user?.emailAddresses[0].emailAddress}!
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <TodoForm onSubmit={(title) => handleAddTodo(title)} />
        </CardContent>
      </Card>
      {!isSubscribed && todos.length >= 3 && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You&apos;ve reached the maximum number of free todos.{" "}
            <Link href="/subscribe" className="font-medium underline">
              Subscribe now
            </Link>{" "}
            to add more.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Your Todos</CardTitle>
        </CardHeader>
              <CardContent>
        <Input
            type="text"
            placeholder={`Search todos...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Loading your todos...</p>
            </div>
          ) : todos.length === 0 ? (
            <p className="text-center text-muted-foreground">
              You don&apos;t have any todos yet. Add one above!
            </p>
          ) : (
            <>
              <ul className="space-y-4">
                {todos.map((todo: Todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                  />
                ))}
              </ul>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => fetchTodos(page)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}