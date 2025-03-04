"use client";

import { useState, useCallback, useEffect } from "react";
//import { useToast } from "@/hooks/use-toast";
import { TodoItem } from "@/components/TodoItem";
import { Todo, User } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";
import { useDebounceValue } from "usehooks-ts";
import { Search, Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface UserWithTodos extends User {
  todos: Todo[];
}

export default function AdminDashboard() {
  //const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useDebounceValue("", 300);
  const [user, setUser] = useState<UserWithTodos | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUserData = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/admin?email=${debouncedEmail}&page=${page}`
        );
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data.user);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        toast.success("User data fetched successfully.");
      } catch (error) {
          console.error(error);
        toast.error("Failed to fetch user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedEmail]
  );

  useEffect(() => {
    if (debouncedEmail) {
      fetchUserData(1);
    }
  }, [debouncedEmail, fetchUserData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedEmail(email);
  };

  const handleUpdateSubscription = async () => {
    toast.loading("Updating Subscription");
    try {
      const response = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: debouncedEmail,
          isSubscribed: !user?.isSubscribed,
        }),
      });
      if (!response.ok) throw new Error("Failed to update subscription");
      fetchUserData(currentPage);
      toast.success("Subscription updated successfully.");
    } catch (error) {
        console.error(error);
      toast.error("Failed to update subscription. Please try again.");
    }
    };
    const handleUpdateTodo = async () => { };
    const handleDeleteTodo = async () => { };

  return (
    <div className="container mx-auto p-4 max-w-3xl mb-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              required
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground mt-2">Loading user data...</p>
          </CardContent>
        </Card>
      ) : user ? (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {user.email}</p>
              <p>
                Subscription Status:{" "}
                {user.isSubscribed ? (
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Subscribed
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Not Subscribed
                  </span>
                )}
              </p>
              {user.subscriptionEnds && (
                <p>
                  Subscription Ends:{" "}
                  {new Date(user.subscriptionEnds).toLocaleDateString()}
                </p>
              )}
              <Button onClick={handleUpdateSubscription} className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                {user.isSubscribed ? "Cancel Subscription" : "Subscribe User"}
              </Button>
            </CardContent>
          </Card>

          {user.todos.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>User Todos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {user.todos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      isAdmin={true}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </ul>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => fetchUserData(page)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">This user has no todos.</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : debouncedEmail ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No user found with this email.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}