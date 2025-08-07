"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Icons } from "@/components/common/Icons";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (password: string) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (password === "admin123") {
        setIsLoggedIn(true);
      } else {
        setError("Incorrect password. Please try again.");
      }
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
                <Icons.logo className="h-12 w-12 text-primary" />
                <h1 className="text-5xl font-bold font-headline text-glow">
                Phoenix Science Academy
                </h1>
            </div>
            <p className="text-muted-foreground">Administrator Panel</p>
        </div>

        {isLoggedIn ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <>
            <AdminLoginForm onLogin={handleLogin} loading={loading} error={error} />
            <div className="text-center mt-6">
                <Button asChild variant="ghost" className="glowing-shadow-sm">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Student Portal
                    </Link>
                </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
