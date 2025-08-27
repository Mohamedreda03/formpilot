"use client";

import React from "react";
import { Settings, MessageSquare } from "lucide-react";
import PagePreview from "./page-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { useFormStore } from "@/stores/form-store";

export function MainContent() {
  const { selectedQuestionId, selectedPage, form } = useFormStore();

  if (!form) {
    return (
      <div className="flex-1 bg-gray-50 p-8">
        <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl bg-white flex items-center justify-center">
          <EmptyState
            icon={Settings}
            title="No form loaded"
            description="Please select a form to edit"
          />
        </div>
      </div>
    );
  }

  if (selectedPage) {
    return (
      <div className="flex-1 bg-gray-50">
        <PagePreview pageType={selectedPage} />
      </div>
    );
  }

  if (selectedQuestionId) {
    const selectedQuestion = form.questions.find(
      (q) => q.id === selectedQuestionId
    );

    if (!selectedQuestion) {
      return (
        <div className="flex-1 bg-gray-50 p-8">
          <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl bg-white flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Question not found"
              description="The selected question could not be found"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        {/* Full Screen Dashed Border Container */}
        <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl bg-white flex items-center justify-center">
          <div className="w-full max-w-3xl mx-auto px-12 space-y-12">
            {/* Question Number with elegant styling */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-semibold text-lg shadow-lg">
                {selectedQuestion.order}
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-0.5 bg-gradient-to-r from-slate-300 to-transparent rounded-full"></div>
                <span className="text-slate-400 font-medium">Question</span>
              </div>
            </div>

            {/* Question Title with improved typography */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                {selectedQuestion.title}
              </h1>

              {selectedQuestion.description && (
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  {selectedQuestion.description}
                </p>
              )}
            </div>

            {/* Enhanced Answer Input Preview */}
            <div className="space-y-6">
              {/* Text/Textarea Questions */}
              {(selectedQuestion.type === "text" ||
                selectedQuestion.type === "textarea") && (
                <div className="space-y-3">
                  {selectedQuestion.type === "text" ? (
                    <input
                      type="text"
                      placeholder={
                        selectedQuestion.placeholder ||
                        "Type your answer here..."
                      }
                      className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent placeholder-slate-400 font-medium transition-colors duration-300"
                      disabled
                    />
                  ) : (
                    <textarea
                      placeholder={
                        selectedQuestion.placeholder ||
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
              {(selectedQuestion.type === "multiple-choice" ||
                selectedQuestion.type === "checkbox") && (
                <div className="space-y-4">
                  {selectedQuestion.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-lg">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-xl text-slate-700 font-medium">
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Email Questions */}
              {selectedQuestion.type === "email" && (
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
                    placeholder={
                      selectedQuestion.placeholder || "name@example.com"
                    }
                    className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent placeholder-slate-400 font-medium transition-colors duration-300"
                    disabled
                  />
                </div>
              )}

              {/* Number Questions */}
              {selectedQuestion.type === "number" && (
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
                    placeholder={
                      selectedQuestion.placeholder || "Enter a number..."
                    }
                    className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent placeholder-slate-400 font-medium transition-colors duration-300"
                    disabled
                  />
                </div>
              )}

              {/* Rating Questions */}
              {selectedQuestion.type === "rating" && (
                <div className="space-y-6">
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
                    <span>
                      Rating from 1 to {selectedQuestion.maxRating || 5}
                    </span>
                  </div>
                  <div className="flex space-x-3 justify-center">
                    {Array.from(
                      { length: selectedQuestion.maxRating || 5 },
                      (_, i) => (
                        <button
                          key={i}
                          className="w-14 h-14 border-2 border-slate-200 rounded-2xl text-lg font-bold hover:bg-slate-800 hover:text-white hover:border-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-200 shadow-sm"
                          disabled
                        >
                          {i + 1}
                        </button>
                      )
                    )}
                  </div>
                  <p className="text-center text-slate-500 font-medium">
                    1 = Not satisfied, {selectedQuestion.maxRating || 5} = Very
                    satisfied
                  </p>
                </div>
              )}

              {/* Dropdown Questions */}
              {selectedQuestion.type === "dropdown" && (
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
                    {selectedQuestion.options?.map((option, index) => (
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
              ].includes(selectedQuestion.type) && (
                <input
                  type="text"
                  placeholder={
                    selectedQuestion.placeholder ||
                    `Enter your ${selectedQuestion.type}...`
                  }
                  className="w-full text-xl border-0 border-b-3 border-slate-200 focus:border-slate-800 focus:outline-none py-4 bg-transparent placeholder-slate-400 font-medium transition-colors duration-300"
                  disabled
                />
              )}
            </div>

            {/* Question Type Badge */}
            <div className="flex justify-center pt-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">
                {selectedQuestion.type}
                {selectedQuestion.required && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
            </div>

            {/* Bottom spacing */}
            <div className="pb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-gray-900">
              Select a Question
            </h2>
            <p className="text-gray-500">
              Choose a question from the sidebar to edit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
