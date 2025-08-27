"use client";

import React from "react";
import { Plus, Copy, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageItem } from "@/components/ui/page-item";
import { Question } from "@/stores/form-store";
import { cn } from "@/lib/utils";
import { AddQuestionButton } from "@/components/ui/add-question-button";

interface QuestionsSidebarProps {
  questions: Question[];
  selectedQuestionId?: string;
  selectedPage?: "intro" | "outro" | null;
  onQuestionSelect: (questionId: string) => void;
  onPageSelect: (page: "intro" | "outro") => void;
  onQuestionDuplicate: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
  onAddQuestion: () => void;
  introPage: {
    title: string;
    description: string;
  };
  outroPage: {
    title: string;
    description: string;
  };
}

interface SortableQuestionProps {
  question: Question;
  selectedQuestionId?: string;
  onQuestionSelect: (questionId: string) => void;
  onQuestionDuplicate: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
}

function SortableQuestion({
  question,
  selectedQuestionId,
  onQuestionSelect,
  onQuestionDuplicate,
  onQuestionDelete,
}: SortableQuestionProps) {
  const isSelected = selectedQuestionId === question.id;

  return (
    <div
      className={cn(
        "group relative bg-white border border-gray-200 rounded-lg p-3 cursor-pointer transition-all",
        isSelected
          ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50"
          : "hover:border-gray-300 hover:shadow-sm"
      )}
      onClick={() => onQuestionSelect(question.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {question.order}. {question.title}
          </p>
          {question.description && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {question.description}
            </p>
          )}
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {question.type}
            </Badge>
            {question.required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuestionDuplicate(question.id);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Duplicate question"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuestionDelete(question.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="Delete question"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionsSidebar({
  questions,
  selectedQuestionId,
  selectedPage,
  onQuestionSelect,
  onPageSelect,
  onQuestionDuplicate,
  onQuestionDelete,
  onAddQuestion,
  introPage,
  outroPage,
}: QuestionsSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-2">Form Structure</h3>
        <AddQuestionButton onClick={onAddQuestion} size="sm" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </AddQuestionButton>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Pages
          </h4>
          <div className="space-y-2">
            <PageItem
              type="intro"
              title={introPage.title}
              description={introPage.description}
              isSelected={selectedPage === "intro"}
              onSelect={() => onPageSelect("intro")}
            />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Questions ({questions.length})
          </h4>
          <div className="space-y-2">
            {questions.map((question) => (
              <SortableQuestion
                key={question.id}
                question={question}
                selectedQuestionId={selectedQuestionId}
                onQuestionSelect={onQuestionSelect}
                onQuestionDuplicate={onQuestionDuplicate}
                onQuestionDelete={onQuestionDelete}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Thank You Page
          </h4>
          <div className="space-y-2">
            <PageItem
              type="outro"
              title={outroPage.title}
              description={outroPage.description}
              isSelected={selectedPage === "outro"}
              onSelect={() => onPageSelect("outro")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
