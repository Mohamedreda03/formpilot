"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit2, Share2, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/stores/form-store";
import Image from "next/image";

// Mock data - replace with actual data fetching
const mockForm = {
  id: "1",
  title: "Customer Feedback Survey",
  description:
    "Help us improve our services by providing your valuable feedback",
  status: "published",
  submissionCount: 127,
  questions: [
    {
      id: "1",
      type: "text",
      title: "What is your full name?",
      description:
        "Please enter your complete name as it appears on official documents",
      required: true,
    },
    {
      id: "2",
      type: "email",
      title: "Please provide your email address",
      required: true,
    },
    {
      id: "3",
      type: "rating",
      title: "How would you rate our service?",
      required: false,
    },
    {
      id: "4",
      type: "textarea",
      title: "Any additional comments or suggestions?",
      required: false,
    },
  ],
};

export default function FormViewPage({
  params,
}: {
  params: { formId: string };
}) {
  const router = useRouter();
  const { form } = useFormStore();

  // Use real form data or fallback to mock for preview
  const displayForm = form || mockForm;

  const renderQuestionPreview = (question: any) => {
    switch (question.type) {
      case "text":
      case "email":
        return (
          <input
            type={question.type}
            className="w-full px-3 py-2 border rounded-md bg-muted/20"
            placeholder="Your answer..."
            disabled
          />
        );
      case "textarea":
        return (
          <textarea
            className="w-full px-3 py-2 border rounded-md resize-none bg-muted/20"
            rows={3}
            placeholder="Your answer..."
            disabled
          />
        );
      case "rating":
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="w-8 h-8 text-gray-300 hover:text-yellow-400 disabled:cursor-not-allowed"
                disabled
              >
                ⭐
              </button>
            ))}
          </div>
        );
      default:
        return (
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md bg-muted/20"
            placeholder="Your answer..."
            disabled
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <h1 className="text-xl font-semibold">{mockForm.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    mockForm.status === "published" ? "default" : "secondary"
                  }
                >
                  {mockForm.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {mockForm.submissionCount} submissions
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/form/${params.formId}`)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Form
            </Button>
          </div>
        </div>
      </div>

      {/* Form Preview */}
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{mockForm.title}</CardTitle>
            {mockForm.description && (
              <p className="text-muted-foreground mt-2">
                {mockForm.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {displayForm.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <label className="block text-sm font-medium">
                  {index + 1}. {question.title}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>

                {/* Question Description */}
                {(question as any).description && (
                  <p className="text-sm text-muted-foreground">
                    {(question as any).description}
                  </p>
                )}

                {/* Question Image */}
                {(question as any).imageUrl && (
                  <div className="w-full max-w-md">
                    <div className="relative w-full aspect-[4/3] max-h-48 rounded-lg overflow-hidden">
                      <Image
                        src={(question as any).imageUrl}
                        alt="Question illustration"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 90vw, 448px"
                        onError={(e) => {
                          // Silent error handling - no console.error
                        }}
                      />
                    </div>
                  </div>
                )}

                {renderQuestionPreview(question)}
              </div>
            ))}

            <div className="pt-4">
              <Button className="w-full" disabled>
                Submit (Preview Mode)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
