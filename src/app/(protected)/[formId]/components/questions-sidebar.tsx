"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare } from "lucide-react";
import { Question, QuestionType } from "./question-type-picker";
import { QuestionItem } from "@/components/ui/question-item";
import { PageItem } from "@/components/ui/page-item";
import { EmptyState } from "@/components/ui/empty-state";
import { AddQuestionButton } from "@/components/ui/add-question-button";

interface QuestionsSidebarProps {
  questions: Question[];
  selectedQuestionId?: string;
  selectedPage?: "intro" | "outro" | null;
  onQuestionSelect: (questionId: string) => void;
  onPageSelect: (page: "intro" | "outro") => void;
  onQuestionDuplicate: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
  onQuestionsReorder: (questions: Question[]) => void;
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <QuestionItem
      ref={setNodeRef}
      style={style}
      question={question}
      isSelected={selectedQuestionId === question.id}
      isDragging={isDragging}
      onSelect={() => onQuestionSelect(question.id)}
      onDuplicate={() => onQuestionDuplicate(question.id)}
      onDelete={() => onQuestionDelete(question.id)}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
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
  onQuestionsReorder,
  onAddQuestion,
  introPage,
  outroPage,
}: QuestionsSidebarProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
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

    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((item) => item.id === active.id);
      const newIndex = questions.findIndex((item) => item.id === over?.id);

      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);

      // Update order values
      const updatedQuestions = reorderedQuestions.map((question, index) => ({
        ...question,
        order: index + 1,
      }));

      onQuestionsReorder(updatedQuestions);
    }

    setActiveId(null);
  }

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const activeQuestion = activeId
    ? questions.find((q) => q.id === activeId)
    : null;

  return (
    <div className="w-80 h-[92vh] border-r bg-muted/10 p-4 sticky top-0 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Form Structure</h3>
      </div>

      <div className="space-y-6">
        {/* Intro Page Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Introduction
            </h4>
          </div>
          <PageItem
            type="intro"
            title={introPage.title}
            description={introPage.description}
            isSelected={selectedPage === "intro"}
            onSelect={() => onPageSelect("intro")}
          />
        </div>

        {/* Questions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Questions
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{questions.length}</Badge>
              <AddQuestionButton
                onClick={onAddQuestion}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Add Question</span>
              </AddQuestionButton>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedQuestions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedQuestions.map((question) => (
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
            </SortableContext>

            <DragOverlay>
              {activeQuestion ? (
                <QuestionItem
                  question={activeQuestion}
                  isSelected={false}
                  isDragging={true}
                  onSelect={() => {}}
                  onDuplicate={() => {}}
                  onDelete={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>

          {questions.length === 0 && (
            <div className="mt-4">
              <EmptyState
                icon={MessageSquare}
                title="No questions added yet"
                description="Start building your form by adding your first question"
              />
            </div>
          )}
        </div>

        {/* Outro Page Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Thank You Page
            </h4>
          </div>
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
  );
}
