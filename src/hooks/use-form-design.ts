"use client";

import { useState, useEffect } from "react";
import { useFormStore } from "@/stores/form-store";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";

export interface FormDesign {
  backgroundColor: string;
  backgroundImage?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
  logoUrl?: string;
}

export const defaultDesign: FormDesign = {
  backgroundColor: "#ffffff",
  primaryColor: "#1e293b",
  secondaryColor: "#64748b",
  textColor: "#1f2937",
  accentColor: "#9ca3af",
  fontFamily: "Inter",
  fontSize: "16",
  borderRadius: "8",
};

export function useFormDesign() {
  const { form, updateForm } = useFormStore();

  const [design, setDesign] = useState<FormDesign>(() => {
    try {
      return form?.design ? JSON.parse(form.design) : defaultDesign;
    } catch {
      return defaultDesign;
    }
  });

  // Debounced update to database (same delay as questions)
  const debouncedUpdateForm = useDebouncedUpdate(
    (designData: FormDesign) => {
      updateForm({ design: JSON.stringify(designData) });
    },
    1000 // 1 second delay like questions
  );

  // Update design when form changes
  useEffect(() => {
    try {
      const newDesign = form?.design ? JSON.parse(form.design) : defaultDesign;
      setDesign(newDesign);
      applyDesignToDocument(newDesign);
    } catch {
      setDesign(defaultDesign);
      applyDesignToDocument(defaultDesign);
    }
  }, [form?.design]);

  const updateDesign = (updates: Partial<FormDesign>) => {
    const newDesign = { ...design, ...updates };
    setDesign(newDesign);

    // Apply to document immediately for real-time preview
    applyDesignToDocument(newDesign);

    // Debounced update to database
    debouncedUpdateForm(newDesign);
  };

  const resetDesign = () => {
    setDesign(defaultDesign);
    updateForm({ design: JSON.stringify(defaultDesign) });
    applyDesignToDocument(defaultDesign);
  };

  const applyDesignToDocument = (designData: FormDesign) => {
    const root = document.documentElement;

    // CSS Custom Properties for global use
    root.style.setProperty("--form-bg-color", designData.backgroundColor);
    root.style.setProperty("--form-primary-color", designData.primaryColor);
    root.style.setProperty("--form-secondary-color", designData.secondaryColor);
    root.style.setProperty("--form-text-color", designData.textColor);
    root.style.setProperty("--form-accent-color", designData.accentColor);
    root.style.setProperty("--form-font-family", designData.fontFamily);
    root.style.setProperty("--form-font-size", `${designData.fontSize}px`);
    root.style.setProperty(
      "--form-border-radius",
      `${designData.borderRadius}px`
    );

    if (designData.backgroundImage) {
      root.style.setProperty(
        "--form-bg-image",
        `url(${designData.backgroundImage})`
      );
    } else {
      root.style.removeProperty("--form-bg-image");
    }
  };

  const getDesignStyles = (): React.CSSProperties => {
    return {
      backgroundColor: design.backgroundColor,
      color: design.textColor,
      fontFamily: design.fontFamily,
      fontSize: `${design.fontSize}px`,
      backgroundImage: design.backgroundImage
        ? `url(${design.backgroundImage})`
        : undefined,
      backgroundSize: design.backgroundImage ? "cover" : undefined,
      backgroundPosition: design.backgroundImage ? "center" : undefined,
    };
  };

  const getContainerStyles = (withBackground = true): React.CSSProperties => {
    return {
      backgroundColor: design.backgroundColor,
      color: design.textColor,
      fontFamily: design.fontFamily,
      // Remove background overlay - show background image directly
      backgroundImage:
        withBackground && design.backgroundImage
          ? `url(${design.backgroundImage})`
          : undefined,
      backgroundSize:
        withBackground && design.backgroundImage ? "cover" : undefined,
      backgroundPosition:
        withBackground && design.backgroundImage ? "center" : undefined,
    };
  };

  const getInputStyles = (): React.CSSProperties => {
    return {
      // Remove borderColor to avoid conflict - will be set individually
      fontFamily: design.fontFamily,
      fontSize: `${design.fontSize}px`,
      backgroundColor: design.backgroundColor,
      color: design.textColor,
    };
  };

  const getButtonStyles = (): React.CSSProperties => {
    return {
      backgroundColor: design.primaryColor,
      color: design.backgroundColor,
      fontFamily: design.fontFamily,
      fontSize: `${design.fontSize}px`,
    };
  };

  const getSecondaryTextStyles = (): React.CSSProperties => {
    return {
      color: design.secondaryColor,
      fontFamily: design.fontFamily,
      fontSize: `${parseInt(design.fontSize) - 2}px`,
    };
  };

  const getAccentTextStyles = (): React.CSSProperties => {
    return {
      color: design.accentColor,
      fontFamily: design.fontFamily,
      fontSize: `${parseInt(design.fontSize) - 1}px`,
    };
  };

  const getTitleStyles = (): React.CSSProperties => {
    return {
      color: design.textColor,
      fontFamily: design.fontFamily,
      fontSize: `${parseInt(design.fontSize) + 12}px`, // Title larger than base font size
    };
  };

  const getNumberStyles = (): React.CSSProperties => {
    return {
      backgroundColor: design.primaryColor,
      color: design.backgroundColor,
      fontFamily: design.fontFamily,
      borderRadius: `${design.borderRadius}px`, // Border radius only for numbers
    };
  };

  return {
    design,
    updateDesign,
    resetDesign,
    getDesignStyles,
    getContainerStyles,
    getInputStyles,
    getButtonStyles,
    getSecondaryTextStyles,
    getAccentTextStyles,
    getTitleStyles,
    getNumberStyles,
    applyDesignToDocument,
  };
}
