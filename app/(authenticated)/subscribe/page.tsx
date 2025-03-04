"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { toast } from "sonner";

export default function SubscribePage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionEnds, setSubscriptionEnds] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptionStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription");
      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
        setSubscriptionEnds(data.subscriptionEnds);
      } else {
        throw new Error("Failed to fetch subscription status");
      }
    } catch (error) {
        console.error(error)
        toast.error("Failed to fetch subscription status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
    }
    const handleSubscribe=async()=>{}

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <BackButton />
      <h1 className="text-3xl font-bold mb-8 text-center">Subscription</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isSubscribed ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You are a subscribed user. Subscription ends on{" "}
                {new Date(subscriptionEnds!).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You are not currently subscribed. Subscribe now to unlock all
                  features!
                </AlertDescription>
              </Alert>
              <Button onClick={handleSubscribe} className="mt-4">
                Subscribe Now
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}