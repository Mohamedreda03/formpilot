"use client";

import React, { useState } from "react";
import { useFormDesign } from "@/hooks/use-form-design";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  maxRating?: number;
  imageUrl?: string;
  order: number;
}

interface FormQuestionRendererProps {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  questionNumber: number;
  totalQuestions: number;
  onNext: () => void;
  canProceed: boolean;
  onSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
}

export default function FormQuestionRenderer({
  question,
  answer,
  onAnswerChange,
  questionNumber,
  totalQuestions,
  onNext,
  canProceed,
  onSubmit,
  isSubmitting = false,
}: FormQuestionRendererProps) {
  const {
    design,
    getInputStyles,
    getAccentTextStyles,
    getTitleStyles,
    getNumberStyles,
    getButtonStyles,
  } = useFormDesign();

  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const renderQuestionInput = () => {
    const inputStyles = getInputStyles();

    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            placeholder={question.placeholder || "Type your answer here..."}
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent font-medium transition-colors duration-300"
            style={{
              ...inputStyles,
              border: "none",
              borderBottom: `3px solid ${design.primaryColor}`,
              color: design.secondaryColor,
            }}
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={
              question.placeholder || "Type your detailed answer here..."
            }
            rows={4}
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent resize-none font-medium transition-colors duration-300"
            style={{
              ...inputStyles,
              border: "none",
              borderBottom: `3px solid ${design.primaryColor}`,
            }}
          />
        );

      case "email":
        return (
          <div className="space-y-3">
            <div
              className="flex items-center space-x-3 text-sm font-medium mb-2"
              style={getAccentTextStyles()}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
              <span>Email address</span>
            </div>
            <input
              type="email"
              placeholder={question.placeholder || "name@example.com"}
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent placeholder-gray-400 font-medium transition-colors duration-300"
              style={{
                ...inputStyles,
                border: "none",
                borderBottom: `3px solid ${design.primaryColor}`,
              }}
            />
          </div>
        );

      case "number":
        return (
          <div className="space-y-3">
            <div
              className="flex items-center space-x-3 text-sm font-medium mb-2"
              style={getAccentTextStyles()}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
              <span>Number</span>
            </div>
            <input
              type="number"
              placeholder={question.placeholder || "Enter a number..."}
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent font-medium transition-colors duration-300"
              style={{
                ...inputStyles,
                border: "none",
                borderBottom: `3px solid ${design.primaryColor}`,
              }}
            />
          </div>
        );

      case "multiple-choice":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-4 p-3 rounded-xl transition-colors duration-200 cursor-pointer border ${
                  answer === option
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                }`}
                onClick={() => onAnswerChange(option)}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-sm"
                  style={{
                    backgroundColor:
                      answer === option ? design.primaryColor : "#gray-400",
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span
                  className="text-lg font-medium"
                  style={{
                    color: design.textColor,
                    fontFamily: design.fontFamily,
                    fontSize: `${design.fontSize}px`,
                  }}
                >
                  {option}
                </span>
              </div>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const isSelected =
                Array.isArray(answer) && answer.includes(option);
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-4 p-3 rounded-xl transition-colors duration-200 cursor-pointer border ${
                    isSelected
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                  }`}
                  onClick={() => {
                    const currentAnswer = Array.isArray(answer) ? answer : [];
                    if (isSelected) {
                      onAnswerChange(
                        currentAnswer.filter((a: string) => a !== option)
                      );
                    } else {
                      onAnswerChange([...currentAnswer, option]);
                    }
                  }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-sm"
                    style={{
                      backgroundColor: isSelected
                        ? design.primaryColor
                        : "#gray-400",
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span
                    className="text-lg font-medium"
                    style={{
                      color: design.textColor,
                      fontFamily: design.fontFamily,
                      fontSize: `${design.fontSize}px`,
                    }}
                  >
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case "dropdown":
        return (
          <div className="space-y-3">
            <div
              className="flex items-center space-x-3 text-sm font-medium mb-2"
              style={getAccentTextStyles()}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span>Choose from list</span>
            </div>
            <select
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent placeholder-gray-400 font-medium appearance-none cursor-pointer transition-colors duration-300"
              style={{
                ...inputStyles,
                border: "none",
                borderBottom: `3px solid ${design.primaryColor}`,
              }}
            >
              <option value="">Choose an option...</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option} className="text-gray-700">
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "rating":
        return (
          <div className="space-y-4">
            <div
              className="flex items-center space-x-3 text-sm font-medium"
              style={getAccentTextStyles()}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span>Rating from 1 to {question.maxRating || 5}</span>
            </div>
            <div className="flex space-x-2 justify-center">
              {Array.from({ length: question.maxRating || 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => onAnswerChange(i + 1)}
                  className="w-12 h-12 border-2 rounded-xl text-lg font-bold hover:text-white focus:outline-none transition-all duration-200 shadow-sm"
                  style={{
                    borderColor: design.primaryColor,
                    backgroundColor:
                      answer === i + 1 ? design.primaryColor : "transparent",
                    color:
                      answer === i + 1
                        ? design.backgroundColor
                        : design.primaryColor,
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p
              className="text-center text-sm font-medium"
              style={getAccentTextStyles()}
            >
              1 = Not satisfied, {question.maxRating || 5} = Very satisfied
            </p>
          </div>
        );

      default:
        return (
          <input
            type="text"
            placeholder={
              question.placeholder || `Enter your ${question.type}...`
            }
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent font-medium transition-colors duration-300"
            style={{
              ...inputStyles,
              border: "none",
              borderBottom: `3px solid ${design.primaryColor}`,
            }}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-8 space-y-8">
      {/* Logo Section */}
      {design.logoUrl && !logoError && (
        <div className="flex justify-start">
          <div className="relative h-16 w-48">
            <Image
              src={design.logoUrl}
              alt="Logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 192px"
              onError={() => setLogoError(true)}
            />
          </div>
        </div>
      )}

      {/* Question Number */}
      <div className="flex items-center space-x-6">
        <div
          className="flex items-center justify-center w-12 h-12 text-white font-semibold text-lg"
          style={getNumberStyles()}
        >
          {questionNumber}
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-0.5 rounded-full"
            style={{
              background: `linear-gradient(to right, ${design.accentColor}, transparent)`,
            }}
          />
          <span
            className="font-medium"
            style={{
              fontFamily: design.fontFamily,
            }}
          >
            Question
          </span>
        </div>
      </div>

      {/* Question Title */}
      <div className="space-y-4">
        <h1
          className="text-3xl md:text-4xl font-bold leading-[1.1] tracking-tight"
          style={getTitleStyles()}
        >
          {question.title}
        </h1>

        {question.description && (
          <p
            className="text-lg leading-relaxed font-medium"
            style={getAccentTextStyles()}
          >
            {question.description}
          </p>
        )}

        {/* Question Image */}
        {question.imageUrl && !imageError && (
          <div className="w-full max-w-md">
            <div className="relative w-full aspect-[4/3] max-h-48">
              <Image
                src={question.imageUrl}
                alt="Question illustration"
                fill
                className="object-cover"
                style={{
                  borderRadius: `${design.borderRadius}px`,
                }}
                sizes="(max-width: 768px) 90vw, 448px"
                onError={() => setImageError(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Answer Input */}
      <div className="space-y-6">
        {renderQuestionInput()}
        {question.required && (
          <p className="text-sm text-red-500 font-medium">
            * This question is required
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-start pt-8">
        {questionNumber === totalQuestions ? (
          <Button
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className="flex items-center h-12 min-w-32 rounded-xl"
            style={getButtonStyles()}
          >
            {isSubmitting ? (
              <LoadingSpinner />
            ) : (
              <>
                <span>Submit</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center h-12 min-w-32 rounded-xl"
            style={getButtonStyles()}
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
