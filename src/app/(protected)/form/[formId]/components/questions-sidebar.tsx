"use client";

import React from "react";
import { Plus, MoreVertical, Copy, Trash2 } from "lucide-react";
import { PageItem } from "@/components/ui/page-item";
import { Question } from "@/stores/form-store";
import { cn } from "@/lib/utils";
import { getQuestionTypeConfig } from "@/lib/question-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QuestionsSidebarProps {
  questions: Question[];
  selectedQuestionId?: string;
  selectedPage?: "intro" | "outro" | null;
  onQuestionSelect: (questionId: string) => void;
  onPageSelect: (page: "intro" | "outro") => void;
  onQuestionDuplicate: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
  onAddQuestion: () => void;
  onQuestionsReorder: (questions: Question[]) => void;
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
  isDragging?: boolean;
}

function SortableQuestion({
  question,
  selectedQuestionId,
  onQuestionSelect,
  onQuestionDuplicate,
  onQuestionDelete,
  isDragging = false,
}: SortableQuestionProps) {
  const isSelected = selectedQuestionId === question.id;
  const questionTypeConfig = getQuestionTypeConfig(question.type);
  const IconComponent = questionTypeConfig?.icon;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({
    id: question.id,
    data: {
      type: "question",
      question,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only handle click if not dragging
    if (!sortableIsDragging) {
      onQuestionSelect(question.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white border rounded-lg p-3 transition-all duration-200 select-none",
        isSelected
          ? "ring-2 ring-slate-400 border-slate-300 bg-slate-50"
          : "border-gray-200 hover:border-slate-300 hover:shadow-sm",
        sortableIsDragging && "opacity-50",
        "cursor-pointer hover:cursor-grab active:cursor-grabbing"
      )}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start space-x-3 pointer-events-none">
        {/* Question Type Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            {IconComponent ? (
              <IconComponent className="w-4 h-4 text-slate-600" />
            ) : (
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 leading-tight line-clamp-2 mb-1">
                {question.order}. {question.title}
              </p>
              {question.description && (
                <p className="text-xs text-gray-500 line-clamp-1">
                  {question.description}
                </p>
              )}
            </div>

            {/* Question Menu */}
            <div className="flex-shrink-0 ml-2 pointer-events-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-all"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onQuestionDuplicate(question.id);
                    }}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onQuestionDelete(question.id);
                    }}
                    className="text-xs text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionOverlay({ question }: { question: Question }) {
  const questionTypeConfig = getQuestionTypeConfig(question.type);
  const IconComponent = questionTypeConfig?.icon;

  return (
    <div className="bg-white border rounded-lg p-3 shadow-lg opacity-90 rotate-3 scale-105">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            {IconComponent ? (
              <IconComponent className="w-4 h-4 text-slate-600" />
            ) : (
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 leading-tight line-clamp-2 mb-1">
            {question.order}. {question.title}
          </p>
          {question.description && (
            <p className="text-xs text-gray-500 line-clamp-1">
              {question.description}
            </p>
          )}
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
  onQuestionsReorder,
  introPage,
  outroPage,
}: QuestionsSidebarProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      const updatedQuestions = reorderedQuestions.map((q, index) => ({
        ...q,
        order: index + 1,
      }));

      onQuestionsReorder(updatedQuestions);
    }

    setActiveId(null);
  }

  const activeQuestion = activeId
    ? questions.find((q) => q.id === activeId)
    : null;

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-900 text-sm">Form Structure</h3>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Intro Page */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Welcome
          </h4>
          <div className="transform scale-90 origin-top-left">
            <PageItem
              type="intro"
              title={introPage.title}
              description={introPage.description}
              isSelected={selectedPage === "intro"}
              onSelect={() => onPageSelect("intro")}
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 pb-2 flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Questions ({questions.length})
            </h4>
            <button
              onClick={onAddQuestion}
              className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition-colors duration-200 shadow-sm hover:shadow"
              title="Add Question"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable Questions with Drag & Drop */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {questions.map((question) => (
                    <SortableQuestion
                      key={question.id}
                      question={question}
                      selectedQuestionId={selectedQuestionId}
                      onQuestionSelect={onQuestionSelect}
                      onQuestionDuplicate={onQuestionDuplicate}
                      onQuestionDelete={onQuestionDelete}
                      isDragging={activeId === question.id}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeQuestion ? (
                  <QuestionOverlay question={activeQuestion} />
                ) : null}
              </DragOverlay>
            </DndContext>

            {questions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No questions yet</p>
                <p className="text-xs mt-1">Click + to add a question</p>
              </div>
            )}
          </div>
        </div>

        {/* Outro Page at Bottom */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Thank You
          </h4>
          <div className="transform scale-90 origin-top-left">
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

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
