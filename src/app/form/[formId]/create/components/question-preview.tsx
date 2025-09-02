"use client";

import React, { useState } from "react";
import { Question } from "@/stores/form-store";
import { useFormDesign } from "@/hooks/use-form-design";
import Image from "next/image";

interface QuestionPreviewProps {
  question: Question;
}

// Fallback Image Component - Silent Error Handling
const FallbackImage = ({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const [fallbackError, setFallbackError] = useState(false);

  if (fallbackError) {
    return (
      <div
        className="w-full h-full bg-gray-50 border border-gray-200 flex items-center justify-center"
        style={style}
      >
        <div className="text-center text-gray-400">
          <svg
            className="w-6 h-6 mx-auto mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        e.preventDefault();
        setFallbackError(true);
      }}
    />
  );
};

export default function QuestionPreview({ question }: QuestionPreviewProps) {
  const {
    design,
    getContainerStyles,
    getInputStyles,
    getButtonStyles,
    getSecondaryTextStyles,
    getAccentTextStyles,
    getTitleStyles,
    getNumberStyles,
  } = useFormDesign();

  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const renderQuestionInput = () => {
    const inputStyles = getInputStyles();
    const buttonStyles = getButtonStyles();

    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            placeholder={question.placeholder || "Type your answer here..."}
            className={`w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent font-medium transition-colors duration-300 form-input`}
            style={{
              ...inputStyles,
              border: "none",
              borderBottom: `3px solid ${design.primaryColor}`,
              color: design.secondaryColor,
            }}
            disabled
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={
              question.placeholder || "Type your detailed answer here..."
            }
            rows={4}
            className={`w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent resize-none font-medium transition-colors duration-300 form-textarea`}
            style={{
              ...inputStyles,
              border: "none",
              borderBottom: `3px solid ${design.primaryColor}`,
            }}
            disabled
          />
        );

      case "multiple-choice":
      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-sm"
                  style={{
                    backgroundColor: design.primaryColor,
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

      case "email":
        return (
          <div className="space-y-3">
            <div
              className="flex items-center space-x-3 text-sm font-medium mb-2 form-question-label"
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
              className="w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent placeholder-gray-400 font-medium transition-colors duration-300"
              style={{
                ...inputStyles,
                border: "none",
                borderBottom: `3px solid ${design.primaryColor}`,
              }}
              disabled
            />
          </div>
        );

      case "number":
        return (
          <div className="space-y-3">
            <div
              className={`flex items-center space-x-3 text-sm font-medium mb-2`}
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
              className={`w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent font-medium transition-colors duration-300`}
              style={{
                ...inputStyles,
                border: "none",
                borderBottom: `3px solid ${design.primaryColor}`,
              }}
              disabled
            />
          </div>
        );

      case "rating":
        return (
          <div className="space-y-4">
            <div
              className="flex items-center space-x-3 text-sm font-medium"
              style={getSecondaryTextStyles()}
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
                  className="w-12 h-12 border-2 rounded-xl text-lg font-bold hover:text-white focus:outline-none transition-all duration-200 shadow-sm"
                  style={{
                    borderColor: design.primaryColor,
                    backgroundColor:
                      i < 3 ? design.primaryColor : "transparent",
                    color: i < 3 ? design.backgroundColor : design.primaryColor,
                  }}
                  disabled
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p
              className="text-center text-sm font-medium"
              style={getSecondaryTextStyles()}
            >
              1 = Not satisfied, {question.maxRating || 5} = Very satisfied
            </p>
          </div>
        );

      case "dropdown":
        return (
          <div className="space-y-3">
            <div
              className="flex items-center space-x-3 text-sm font-medium mb-2"
              style={getSecondaryTextStyles()}
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
              className="w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent placeholder-gray-400 font-medium appearance-none cursor-pointer transition-colors duration-300"
              style={{
                ...inputStyles,
                border: "none",
                borderBottom: `3px solid ${design.primaryColor}`,
              }}
              disabled
            >
              <option>Choose an option...</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option} className="text-gray-700">
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <input
            type="text"
            placeholder={
              question.placeholder || `Enter your ${question.type}...`
            }
            className={`w-full text-xl border-0 border-b-3 focus:outline-none py-4 bg-transparent font-medium transition-colors duration-300`}
            style={{
              ...inputStyles,
              border: "none",
              borderBottom: `3px solid ${design.primaryColor}`,
            }}
            disabled
          />
        );
    }
  };

  const containerStyles = getContainerStyles(true);

  return (
    <div className="h-full w-full p-4 flex items-center justify-center overflow-hidden">
      {/* Full Screen Dashed Border Container with Custom Design */}
      <div
        className="h-full w-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center"
        style={containerStyles}
      >
        <div className="w-full max-w-3xl mx-auto px-8 space-y-8">
          {/* Logo Section - Show logo instead of icon */}
          {design.logoUrl && !logoError ? (
            <div className="flex justify-start">
              <div className="relative h-16 w-48">
                <Image
                  src={design.logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 192px"
                  onError={(e) => {
                    setLogoError(true);
                  }}
                />
              </div>
            </div>
          ) : design.logoUrl && logoError ? (
            <div className="flex justify-center">
              <div className="relative h-16 w-48">
                <FallbackImage
                  src={design.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ) : null}

          {/* Question Number with custom styling */}
          <div className="flex items-center space-x-6">
            <div
              className="flex items-center justify-center w-12 h-12 text-white font-semibold text-lg"
              style={getNumberStyles()}
            >
              {question.order}
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${design.accentColor}, transparent)`,
                }}
              ></div>
              <span
                className="font-medium form-question-label"
                style={{
                  fontFamily: design.fontFamily,
                }}
              >
                Question
              </span>
            </div>
          </div>

          {/* Question Title with improved typography and font size */}
          <div className="space-y-4">
            <h1
              className="text-3xl md:text-4xl font-bold leading-[1.1] tracking-tight"
              style={getTitleStyles()}
            >
              {question.title}
            </h1>

            {question.description && (
              <p
                className="text-lg leading-relaxed font-medium form-description"
                style={getAccentTextStyles()}
              >
                {question.description}
              </p>
            )}

            {/* Question Image - Aligned to Left */}
            {question.imageUrl && !imageError && (
              <div className="w-full max-w-md">
                <div className="relative w-full aspect-[4/3] max-h-48">
                  <Image
                    key={question.imageUrl}
                    src={question.imageUrl}
                    alt="Question illustration"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: `${design.borderRadius}px`,
                    }}
                    sizes="(max-width: 768px) 90vw, 448px"
                    priority={false}
                    onError={(e) => {
                      // Silent error handling - set fallback state
                      setImageError(true);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Image Error Fallback - Aligned to Left */}
            {question.imageUrl && imageError && (
              <div className="w-full max-w-md">
                <div
                  className="relative w-full aspect-[4/3] max-h-48 bg-gray-50 border border-gray-200 flex items-center justify-center"
                  style={{
                    borderRadius: `${design.borderRadius}px`,
                  }}
                >
                  <FallbackImage
                    src={question.imageUrl}
                    alt="Question illustration"
                    className="w-full h-full object-cover"
                    style={{
                      borderRadius: `${design.borderRadius}px`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Answer Input Preview with Custom Design */}
          <div className="space-y-6">{renderQuestionInput()}</div>
        </div>
      </div>
    </div>
  );
}
