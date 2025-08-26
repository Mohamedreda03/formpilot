"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@/hooks/use-form-data";
import { useAuth } from "@/hooks/use-auth";

export default function TestFormPage() {
  const [title, setTitle] = useState("");
  const { createForm } = useForm("new");
  const { user } = useAuth();

  const handleCreate = async () => {
    if (!title.trim()) return;

    try {
      await createForm(title, "Test form description");
    } catch (error) {
      console.error("Failed to create form:", error);
    }
  };

  if (!user) {
    return <div>Please login first</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Form Creation</h1>

      <div className="space-y-4 max-w-md">
        <Input
          placeholder="Form title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Button onClick={handleCreate} disabled={!title.trim()}>
          Create Test Form
        </Button>
      </div>
    </div>
  );
}
