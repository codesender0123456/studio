
"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "@/lib/firebase";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Icons } from "@/components/common/Icons";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [user, loading, error] = useAuthState(auth);

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
            <div className="flex flex-col justify-center items-center gap-4 mb-4">
                <Icons.logo className="h-20 w-20 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-glow">
                  Phoenix Science Academy
                </h1>
            </div>
            <p className="text-muted-foreground">Administrator Panel</p>
        </div>

        {loading && (
            <div className="flex justify-center items-center">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <p>Loading...</p>
            </div>
        )}

        {error && (
            <div className="text-center text-destructive">
                <p>Error: {error.message}</p>
            </div>
        )}

        {user && !loading && <AdminDashboard />}

        {!user && !loading && (
          <>
            <AdminLoginForm />
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
