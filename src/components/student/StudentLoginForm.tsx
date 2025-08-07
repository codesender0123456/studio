"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StudentLoginFormProps = {
  onSearch: (rollNumber: string) => void;
  loading: boolean;
  error: string | null;
};

export default function StudentLoginForm({ onSearch, loading, error }: StudentLoginFormProps) {
  const [rollNumber, setRollNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rollNumber) {
      onSearch(rollNumber);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Enter your Roll Number"
        value={rollNumber}
        onChange={(e) => setRollNumber(e.target.value)}
        className="text-center glowing-shadow-sm"
        disabled={loading}
      />
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      <Button type="submit" className="w-full glowing-shadow" disabled={loading || !rollNumber}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          "View Result"
        )}
      </Button>
    </form>
  );
}
