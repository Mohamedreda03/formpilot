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
                <button className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 border border-transparent hover:border-purple-200 group text-sm">
                  <Palette className="w-4 h-4 group-hover:text-purple-600 transition-colors" />
                  <span className="font-semibold">Design</span>
                </button>
              </SheetTrigger>
              <SheetContent className="w-[450px] sm:w-[500px] overflow-y-auto bg-gray-50/30 backdrop-blur-sm">
                <SheetHeader className="space-y-4 pb-6 border-b border-gray-200/80">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <SheetTitle className="text-2xl font-bold text-gray-900">
                        Form Design
                      </SheetTitle>
                      <SheetDescription className="text-gray-600 mt-1">
                        Customize your form's appearance and branding
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <div className="space-y-8 mt-8 px-1">
                  {/* Colors Section */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <Paintbrush className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Colors
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="backgroundColor"
                          className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                        >
                          <span>Background Color</span>
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
                              className="w-12 h-12 p-1 border-2 border-gray-200 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                            />
                          </div>
                          <Input
                            value={design.backgroundColor}
                            onChange={(e) =>
                              handleDesignChange({
                                backgroundColor: e.target.value,
                              })
                            }
                            className="flex-1 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-0 transition-colors"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="primaryColor"
                          className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                        >
                          <span>Primary Color</span>
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
                            className="w-12 h-12 p-1 border-2 border-gray-200 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          />
                          <Input
                            value={design.primaryColor}
                            onChange={(e) =>
                              handleDesignChange({
                                primaryColor: e.target.value,
                              })
                            }
                            className="flex-1 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-0 transition-colors"
                            placeholder="#1e293b"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="textColor"
                          className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                        >
                          <span>Text Color</span>
                        </Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id="textColor"
                            type="color"
                            value={design.textColor}
                            onChange={(e) =>
                              handleDesignChange({ textColor: e.target.value })
                            }
                            className="w-12 h-12 p-1 border-2 border-gray-200 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          />
                          <Input
                            value={design.textColor}
                            onChange={(e) =>
                              handleDesignChange({ textColor: e.target.value })
                            }
                            className="flex-1 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-0 transition-colors"
                            placeholder="#1f2937"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography Section */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Type className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Typography
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="fontFamily"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Font Family
                        </Label>
                        <select
                          id="fontFamily"
                          value={design.fontFamily}
                          onChange={(e) =>
                            handleDesignChange({ fontFamily: e.target.value })
                          }
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-colors bg-white shadow-sm"
                        >
                          {fontOptions.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="fontSize"
                          className="text-sm font-semibold text-gray-800"
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
                          className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-0 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Image className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Images
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {/* Background Image */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800">
                          Background Image
                        </Label>
                        {design.backgroundImage ? (
                          <div className="relative group">
                            <img
                              src={design.backgroundImage}
                              alt="Background preview"
                              className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                            />
                            <button
                              onClick={() => handleRemoveImage("background")}
                              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors bg-gray-50/50">
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
                              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Upload className="w-6 h-6 text-gray-500" />
                              </div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                {uploading === "background"
                                  ? "Uploading..."
                                  : "Upload background image"}
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG up to 10MB
                              </p>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Logo */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800">
                          Logo
                        </Label>
                        {design.logoUrl ? (
                          <div className="relative group w-40">
                            <img
                              src={design.logoUrl}
                              alt="Logo preview"
                              className="w-full h-24 object-contain rounded-xl border-2 border-gray-200 bg-gray-50/50 shadow-sm"
                            />
                            <button
                              onClick={() => handleRemoveImage("logo")}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center w-40 hover:border-purple-400 transition-colors bg-gray-50/50">
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
                              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <Upload className="w-4 h-4 text-gray-500" />
                              </div>
                              <p className="text-xs font-medium text-gray-700">
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

                  {/* Advanced Options */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Advanced
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="borderRadius"
                          className="text-sm font-semibold text-gray-800"
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
                          className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-0 transition-colors"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800">
                          Shadows
                        </Label>
                        <div className="flex items-center space-x-3 pt-3">
                          <Switch
                            checked={design.shadows}
                            onCheckedChange={(checked) =>
                              handleDesignChange({ shadows: checked })
                            }
                            className="data-[state=checked]:bg-purple-500"
                          />
                          <span className="text-sm text-gray-600 font-medium">
                            Enable shadows
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => handleDesignChange(defaultDesign)}
                      className="w-full h-12 border-2 border-gray-300 rounded-xl hover:border-red-400 hover:text-red-600 transition-colors font-semibold"
                    >
                      <span className="mr-2">🔄</span>
                      Reset to Default Design
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
