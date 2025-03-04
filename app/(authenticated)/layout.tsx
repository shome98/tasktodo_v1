import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { LoadingSpinner } from "../sign-in/page";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </>
  );
}