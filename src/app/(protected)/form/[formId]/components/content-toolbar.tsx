"use client";

import React, { useState } from "react";
import {
  Plus,
  Palette,
  Type,
  Image,
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
import { useFormStore } from "@/stores/form-store";
import { uploadImage, deleteImage } from "@/lib/image-upload";

interface ContentToolbarProps {
  onAddContent: () => void;
}

interface FormDesign {
  backgroundColor: string;
  backgroundImage?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
  shadows: boolean;
  logoUrl?: string;
}

const defaultDesign: FormDesign = {
  backgroundColor: "#ffffff",
  primaryColor: "#1e293b",
  secondaryColor: "#64748b",
  textColor: "#1f2937",
  fontFamily: "Inter",
  fontSize: "16",
  borderRadius: "8",
  shadows: true,
};

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
];

export default function ContentToolbar({ onAddContent }: ContentToolbarProps) {
  const { form, updateForm } = useFormStore();
  const [design, setDesign] = useState<FormDesign>(() => {
    try {
      return form?.design ? JSON.parse(form.design) : defaultDesign;
    } catch {
      return defaultDesign;
    }
  });
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleDesignChange = (updates: Partial<FormDesign>) => {
    const newDesign = { ...design, ...updates };
    setDesign(newDesign);

    // Update form store
    updateForm({ design: JSON.stringify(newDesign) });

    // Apply design to document root for real-time preview
    applyDesignToDocument(newDesign);
  };

  const applyDesignToDocument = (designData: FormDesign) => {
    const root = document.documentElement;
    root.style.setProperty("--form-bg-color", designData.backgroundColor);
    root.style.setProperty("--form-primary-color", designData.primaryColor);
    root.style.setProperty("--form-secondary-color", designData.secondaryColor);
    root.style.setProperty("--form-text-color", designData.textColor);
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

  React.useEffect(() => {
    applyDesignToDocument(design);
  }, [design]);

  return (
    <>
      {/* Floating Toolbar */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3">
          <div className="flex items-center space-x-3">
            {/* Add Content Button */}
            <Button
              onClick={onAddContent}
              className="inline-flex items-center space-x-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-colors duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add Content</span>
            </Button>

            <Separator orientation="vertical" className="h-8" />

            {/* Design Button */}
            <Sheet open={isDesignOpen} onOpenChange={setIsDesignOpen}>
              <SheetTrigger asChild>
                <button className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200">
                  <Palette className="w-4 h-4" />
                  <span className="font-medium">Design</span>
                </button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="space-y-3">
                  <SheetTitle className="text-xl font-semibold">
                    Form Design
                  </SheetTitle>
                  <SheetDescription>
                    Customize the appearance of your form with colors, fonts,
                    and images.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-8 mt-8">
                  {/* Colors Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Paintbrush className="w-5 h-5" />
                      <span>Colors</span>
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="backgroundColor"
                          className="text-sm font-medium text-gray-700"
                        >
                          Background Color
                        </Label>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Input
                              id="backgroundColor"
                              type="color"
                              value={design.backgroundColor}
                              onChange={(e) =>
                                handleDesignChange({
                                  backgroundColor: e.target.value,
                                })
                              }
                              className="w-16 h-10 p-1 border rounded-lg cursor-pointer"
                            />
                          </div>
                          <Input
                            value={design.backgroundColor}
                            onChange={(e) =>
                              handleDesignChange({
                                backgroundColor: e.target.value,
                              })
                            }
                            className="flex-1 h-10"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="primaryColor"
                          className="text-sm font-medium text-gray-700"
                        >
                          Primary Color
                        </Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={design.primaryColor}
                            onChange={(e) =>
                              handleDesignChange({
                                primaryColor: e.target.value,
                              })
                            }
                            className="w-16 h-10 p-1 border rounded-lg cursor-pointer"
                          />
                          <Input
                            value={design.primaryColor}
                            onChange={(e) =>
                              handleDesignChange({
                                primaryColor: e.target.value,
                              })
                            }
                            className="flex-1 h-10"
                            placeholder="#1e293b"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="textColor"
                          className="text-sm font-medium text-gray-700"
                        >
                          Text Color
                        </Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id="textColor"
                            type="color"
                            value={design.textColor}
                            onChange={(e) =>
                              handleDesignChange({ textColor: e.target.value })
                            }
                            className="w-16 h-10 p-1 border rounded-lg cursor-pointer"
                          />
                          <Input
                            value={design.textColor}
                            onChange={(e) =>
                              handleDesignChange({ textColor: e.target.value })
                            }
                            className="flex-1 h-10"
                            placeholder="#1f2937"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Typography Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Type className="w-5 h-5" />
                      <span>Typography</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="fontFamily"
                          className="text-sm font-medium text-gray-700"
                        >
                          Font Family
                        </Label>
                        <select
                          id="fontFamily"
                          value={design.fontFamily}
                          onChange={(e) =>
                            handleDesignChange({ fontFamily: e.target.value })
                          }
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                          className="text-sm font-medium text-gray-700"
                        >
                          Font Size (px)
                        </Label>
                        <Input
                          id="fontSize"
                          type="number"
                          min="12"
                          max="32"
                          value={design.fontSize}
                          onChange={(e) =>
                            handleDesignChange({ fontSize: e.target.value })
                          }
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Images Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Image className="w-5 h-5" />
                      <span>Images</span>
                    </h3>

                    {/* Background Image */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Background Image
                      </Label>
                      {design.backgroundImage ? (
                        <div className="relative">
                          <img
                            src={design.backgroundImage}
                            alt="Background preview"
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => handleRemoveImage("background")}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                            className="cursor-pointer"
                          >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {uploading === "background"
                                ? "Uploading..."
                                : "Click to upload background image"}
                            </p>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Logo */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Logo
                      </Label>
                      {design.logoUrl ? (
                        <div className="relative w-32">
                          <img
                            src={design.logoUrl}
                            alt="Logo preview"
                            className="w-full h-20 object-contain rounded-lg border bg-gray-50"
                          />
                          <button
                            onClick={() => handleRemoveImage("logo")}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center w-32">
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
                            className="cursor-pointer"
                          >
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
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

                  <Separator />

                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Advanced
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="borderRadius"
                          className="text-sm font-medium text-gray-700"
                        >
                          Border Radius (px)
                        </Label>
                        <Input
                          id="borderRadius"
                          type="number"
                          min="0"
                          max="30"
                          value={design.borderRadius}
                          onChange={(e) =>
                            handleDesignChange({ borderRadius: e.target.value })
                          }
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Shadows
                        </Label>
                        <div className="flex items-center space-x-2 pt-2">
                          <Switch
                            checked={design.shadows}
                            onCheckedChange={(checked) =>
                              handleDesignChange({ shadows: checked })
                            }
                          />
                          <span className="text-sm text-gray-600">
                            Enable shadows
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Reset Button */}
                  <Button
                    variant="outline"
                    onClick={() => handleDesignChange(defaultDesign)}
                    className="w-full"
                  >
                    Reset to Default Design
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
}
