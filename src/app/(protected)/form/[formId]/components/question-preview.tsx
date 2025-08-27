"use client";

import React from "react";
import { Question } from "@/stores/form-store";

interface QuestionPreviewProps {
  question: Question;
}

export default function QuestionPreview({ question }: QuestionPreviewProps) {
  return (
    <div className="h-full w-full p-4 flex items-center justify-center overflow-hidden">
      {/* Full Screen Dashed Border Container */}
      <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl bg-white flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto px-8 space-y-8">
          {/* Question Number with elegant styling */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-semibold text-lg shadow-lg">
              {question.order}
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-0.5 bg-gradient-to-r from-slate-300 to-transparent rounded-full"></div>
              <span className="text-slate-400 font-medium">Question</span>
            </div>
          </div>

          {/* Question Title with improved typography */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              {question.title}
            </h1>

            {question.description && (
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {question.description}
              </p>
            )}
          </div>

          {/* Enhanced Answer Input Preview */}
          <div className="space-y-6">
            {/* Text/Textarea Questions */}
            {(question.type === "text" || question.type === "textarea") && (
              <div className="space-y-3">
                {question.type === "text" ? (
                  <input
                    type="text"
                    placeholder={
                      question.placeholder || "Type your answer here..."
                    }
                    className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent placeholder-slate-400 font-medium transition-colors duration-300"
                    disabled
                  />
                ) : (
                  <textarea
                    placeholder={
                      question.placeholder ||
                      "Type your detailed answer here..."
                    }
                    rows={4}
                    className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent placeholder-slate-400 resize-none font-medium transition-colors duration-300"
                    disabled
                  />
                )}
              </div>
            )}

            {/* Multiple Choice Questions */}
            {(question.type === "multiple-choice" ||
              question.type === "checkbox") && (
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg text-slate-700 font-medium">
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Email Questions */}
            {question.type === "email" && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-slate-500 text-sm font-medium mb-2">
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
                  className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent placeholder-slate-400 font-medium transition-colors duration-300"
                  disabled
                />
              </div>
            )}

            {/* Number Questions */}
            {question.type === "number" && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-slate-500 text-sm font-medium mb-2">
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
                  className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent placeholder-slate-400 font-medium transition-colors duration-300"
                  disabled
                />
              </div>
            )}

            {/* Rating Questions */}
            {question.type === "rating" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-500 text-sm font-medium">
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
                      className="w-12 h-12 border-2 border-slate-200 rounded-xl text-lg font-bold hover:bg-slate-800 hover:text-white hover:border-slate-800 focus:outline-none transition-all duration-200 shadow-sm"
                      disabled
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <p className="text-center text-slate-500 font-medium text-sm">
                  1 = Not satisfied, {question.maxRating || 5} = Very satisfied
                </p>
              </div>
            )}

            {/* Dropdown Questions */}
            {question.type === "dropdown" && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-slate-500 text-sm font-medium mb-2">
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
                  className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent text-slate-400 font-medium appearance-none cursor-pointer transition-colors duration-300"
                  disabled
                >
                  <option>Choose an option...</option>
                  {question.options?.map((option, index) => (
                    <option
                      key={index}
                      value={option}
                      className="text-slate-700"
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Other Question Types */}
            {![
              "text",
              "textarea",
              "multiple-choice",
              "checkbox",
              "rating",
              "email",
              "number",
              "dropdown",
            ].includes(question.type) && (
              <input
                type="text"
                placeholder={
                  question.placeholder || `Enter your ${question.type}...`
                }
                className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent placeholder-slate-400 font-medium transition-colors duration-300"
                disabled
              />
            )}
          </div>

          {/* Question Type Badge */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">
              {question.type}
              {question.required && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
