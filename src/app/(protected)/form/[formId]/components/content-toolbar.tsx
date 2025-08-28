"use client";

import React, { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import Image from "next/image";
import {
  Plus,
  Palette,
  Type,
  Image as ImageIcon,
  Paintbrush,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useFormDesign } from "@/hooks/use-form-design";
import { uploadImage, deleteImage } from "@/lib/image-upload";

interface ContentToolbarProps {
  onAddContent: () => void;
}

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Nunito", label: "Nunito" },
  { value: "Poppins", label: "Poppins" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Ubuntu", label: "Ubuntu" },
  { value: "Raleway", label: "Raleway" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "PT Sans", label: "PT Sans" },
  { value: "Oswald", label: "Oswald" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Fira Sans", label: "Fira Sans" },
];

export default function ContentToolbar({ onAddContent }: ContentToolbarProps) {
  const { design, updateDesign, resetDesign, applyDesignToDocument } =
    useFormDesign();
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // Local state for colors to prevent lag during color picking
  const [localColors, setLocalColors] = useState({
    backgroundColor: design?.backgroundColor || "#ffffff",
    primaryColor: design?.primaryColor || "#1e293b",
    textColor: design?.textColor || "#1f2937",
    secondaryColor: design?.secondaryColor || "#64748b",
    accentColor: design?.accentColor || "#9ca3af",
  });

  // Local state for font size to prevent keyboard navigation issues
  const [localFontSize, setLocalFontSize] = useState(design?.fontSize || "16");

  // Update local colors when design changes (from external sources)
  React.useEffect(() => {
    if (design) {
      setLocalColors({
        backgroundColor: design.backgroundColor || "#ffffff",
        primaryColor: design.primaryColor || "#1e293b",
        textColor: design.textColor || "#1f2937",
        secondaryColor: design.secondaryColor || "#64748b",
        accentColor: design.accentColor || "#9ca3af",
      });
      setLocalFontSize(design.fontSize || "16");
    }
  }, [
    design?.backgroundColor,
    design?.primaryColor,
    design?.textColor,
    design?.secondaryColor,
    design?.accentColor,
    design?.fontSize,
  ]);

  // Debounced color update - only saves to database after user stops changing
  const debouncedColorUpdate = useDebouncedCallback(
    (colorUpdates: Partial<typeof localColors>) => {
      updateDesign(colorUpdates);
    },
    300 // Longer delay for database save
  );

  // Debounced font size update
  const debouncedFontSizeUpdate = useDebouncedCallback((fontSize: string) => {
    updateDesign({ fontSize });
  }, 300);

  // RAF-based visual update for the smoothest possible performance
  const rafRef = React.useRef<number | null>(null);
  const pendingUpdateRef = React.useRef<{
    colorKey: keyof typeof localColors;
    value: string;
  } | null>(null);

  const scheduleVisualUpdate = useCallback(
    (colorKey: keyof typeof localColors, value: string) => {
      pendingUpdateRef.current = { colorKey, value };

      if (rafRef.current !== null) return; // Already scheduled

      rafRef.current = requestAnimationFrame(() => {
        const pending = pendingUpdateRef.current;
        if (pending) {
          applyDesignToDocument({
            ...design,
            [pending.colorKey]: pending.value,
          });
        }
        rafRef.current = null;
        pendingUpdateRef.current = null;
      });
    },
    [design, applyDesignToDocument]
  );

  // Cleanup RAF on unmount
  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleColorChange = useCallback(
    (colorKey: keyof typeof localColors, value: string) => {
      // Skip if the value hasn't actually changed or is invalid
      if (!value || localColors[colorKey] === value) return;

      // Update local state immediately for instant input feedback
      setLocalColors((prev) => ({ ...prev, [colorKey]: value }));

      // RAF-based visual update for smoothest performance
      scheduleVisualUpdate(colorKey, value);

      // Debounced save to database
      debouncedColorUpdate({ [colorKey]: value });
    },
    [localColors, scheduleVisualUpdate, debouncedColorUpdate]
  );

  const handleFontSizeChange = useCallback(
    (value: string) => {
      setLocalFontSize(value);
      debouncedFontSizeUpdate(value);
    },
    [debouncedFontSizeUpdate]
  );

  const handleFontSizeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        // Wait for the input value to update, then update our local state
        setTimeout(() => {
          const target = e.target as HTMLInputElement;
          setLocalFontSize(target.value);
          debouncedFontSizeUpdate(target.value);
        }, 0);
      }
    },
    [debouncedFontSizeUpdate]
  );

  const handleDesignChange = (updates: Partial<typeof design>) => {
    updateDesign(updates);
  };

  const handleImageUpload = async (file: File, type: "background" | "logo") => {
    setUploading(type);
    try {
      const imageUrl = await uploadImage(file);

      if (type === "background") {
        handleDesignChange({ backgroundImage: imageUrl });
      } else {
        handleDesignChange({ logoUrl: imageUrl });
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveImage = async (type: "background" | "logo") => {
    try {
      const imageUrl =
        type === "background" ? design.backgroundImage : design.logoUrl;
      if (imageUrl) {
        await deleteImage(imageUrl);
        if (type === "background") {
          handleDesignChange({ backgroundImage: undefined });
        } else {
          handleDesignChange({ logoUrl: undefined });
        }
      }
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  };

  return (
    <>
      {/* Floating Toolbar */}
      <div className="px-4 pt-4">
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2">
          <div className="flex items-center space-x-2">
            {/* Add Content Button */}
            <Button onClick={onAddContent} className="rounded-lg">
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add Content</span>
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Design Button */}
            <Sheet open={isDesignOpen} onOpenChange={setIsDesignOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary">
                  <Palette className="w-4 h-4" />
                  <span className="font-medium">Design</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[450px] sm:w-[500px] overflow-y-auto">
                <SheetHeader className="pb-6">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-gray-600" />
                    <SheetTitle className="text-lg font-medium">
                      Form Design
                    </SheetTitle>
                  </div>
                  <SheetDescription className="text-sm text-gray-500">
                    Customize your form's appearance
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-8 px-1">
                  {/* Colors Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2 pb-2">
                      <Paintbrush className="w-4 h-4" />
                      <span>Colors</span>
                    </h3>

                    <div className="space-y-4 pl-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="backgroundColor"
                          className="text-sm text-gray-700"
                        >
                          Background Color
                        </Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id="backgroundColor"
                            type="color"
                            value={localColors.backgroundColor}
                            onChange={(e) =>
                              handleColorChange(
                                "backgroundColor",
                                e.target.value
                              )
                            }
                            className="w-10 h-9 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            value={localColors.backgroundColor}
                            onChange={(e) =>
                              handleColorChange(
                                "backgroundColor",
                                e.target.value
                              )
                            }
                            className="flex-1 h-9 text-sm"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="primaryColor"
                          className="text-sm text-gray-700"
                        >
                          Primary Color
                        </Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={localColors.primaryColor}
                            onChange={(e) =>
                              handleColorChange("primaryColor", e.target.value)
                            }
                            className="w-10 h-9 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            value={localColors.primaryColor}
                            onChange={(e) =>
                              handleColorChange("primaryColor", e.target.value)
                            }
                            className="flex-1 h-9 text-sm"
                            placeholder="#1e293b"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="textColor"
                          className="text-sm text-gray-700"
                        >
                          Text Color
                        </Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id="textColor"
                            type="color"
                            value={localColors.textColor}
                            onChange={(e) =>
                              handleColorChange("textColor", e.target.value)
                            }
                            className="w-10 h-9 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            value={localColors.textColor}
                            onChange={(e) =>
                              handleColorChange("textColor", e.target.value)
                            }
                            className="flex-1 h-9 text-sm"
                            placeholder="#1f2937"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="accentColor"
                          className="text-sm text-gray-700"
                        >
                          Accent Color (Descriptions & Placeholders)
                        </Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id="accentColor"
                            type="color"
                            value={localColors.accentColor}
                            onChange={(e) =>
                              handleColorChange("accentColor", e.target.value)
                            }
                            className="w-10 h-9 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            value={localColors.accentColor}
                            onChange={(e) =>
                              handleColorChange("accentColor", e.target.value)
                            }
                            className="flex-1 h-9 text-sm"
                            placeholder="#9ca3af"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Typography Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2 pb-2">
                      <Type className="w-4 h-4" />
                      <span>Typography</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="fontFamily"
                          className="text-sm text-gray-700"
                        >
                          Font Family
                        </Label>
                        <select
                          id="fontFamily"
                          value={design?.fontFamily || "Inter"}
                          onChange={(e) =>
                            handleDesignChange({ fontFamily: e.target.value })
                          }
                          className="w-full h-9 px-3 border rounded text-sm bg-white"
                        >
                          {fontOptions.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="fontSize"
                          className="text-sm text-gray-700"
                        >
                          Font Size (px)
                        </Label>
                        <Input
                          id="fontSize"
                          type="number"
                          min="12"
                          max="32"
                          value={localFontSize}
                          onChange={(e) => handleFontSizeChange(e.target.value)}
                          onKeyDown={handleFontSizeKeyDown}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Images Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2 pb-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Images</span>
                    </h3>

                    <div className="space-y-6 pl-6">
                      {/* Background Image */}
                      <div className="space-y-3">
                        <Label className="text-sm text-gray-700">
                          Background Image
                        </Label>
                        {design.backgroundImage ? (
                          <div className="relative group">
                            <div className="relative w-full h-32 rounded border overflow-hidden">
                              <Image
                                src={design.backgroundImage}
                                alt="Background preview"
                                fill
                                className="object-cover"
                                sizes="256px"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveImage("background")}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, "background");
                              }}
                              className="hidden"
                              id="background-upload"
                            />
                            <label
                              htmlFor="background-upload"
                              className="cursor-pointer block"
                            >
                              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                {uploading === "background"
                                  ? "Uploading..."
                                  : "Upload background image"}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG up to 10MB
                              </p>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Logo */}
                      <div className="space-y-3">
                        <Label className="text-sm text-gray-700">Logo</Label>
                        {design.logoUrl ? (
                          <div className="relative group w-32">
                            <div className="relative w-full h-20 rounded border bg-gray-50 overflow-hidden">
                              <Image
                                src={design.logoUrl}
                                alt="Logo preview"
                                fill
                                className="object-contain"
                                sizes="128px"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveImage("logo")}
                              className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center w-32 hover:border-gray-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, "logo");
                              }}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label
                              htmlFor="logo-upload"
                              className="cursor-pointer block"
                            >
                              <Upload className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-600">
                                {uploading === "logo"
                                  ? "Uploading..."
                                  : "Upload logo"}
                              </p>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 pb-2">
                      Advanced
                    </h3>

                    <div className="pl-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="borderRadius"
                          className="text-sm text-gray-700"
                        >
                          Border Radius (px)
                        </Label>
                        <Input
                          id="borderRadius"
                          type="number"
                          min="0"
                          max="30"
                          value={design?.borderRadius || "8"}
                          onChange={(e) =>
                            handleDesignChange({ borderRadius: e.target.value })
                          }
                          className="h-9 text-sm"
                          placeholder="8"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Reset Button */}
                  <div className="pt-2 pb-4">
                    <Button
                      variant="outline"
                      onClick={resetDesign}
                      className="w-full h-9 text-sm"
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
}
