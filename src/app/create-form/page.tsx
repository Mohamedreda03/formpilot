"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Mail,
  Users,
  BarChart3,
  MessageSquare,
  Phone,
  Star,
  Heart,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "number"
    | "tel";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

const formTemplates = [
  {
    id: "contact",
    name: "Contact Form",
    description: "Basic contact form with name, email, and message",
    icon: Mail,
    fields: [
      { id: "1", type: "text" as const, label: "Full Name", required: true },
      {
        id: "2",
        type: "email" as const,
        label: "Email Address",
        required: true,
      },
      { id: "3", type: "tel" as const, label: "Phone Number", required: false },
      { id: "4", type: "textarea" as const, label: "Message", required: true },
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter Signup",
    description: "Simple newsletter subscription form",
    icon: Mail,
    fields: [
      { id: "1", type: "text" as const, label: "First Name", required: true },
      {
        id: "2",
        type: "email" as const,
        label: "Email Address",
        required: true,
      },
      {
        id: "3",
        type: "checkbox" as const,
        label: "I agree to receive newsletters",
        required: true,
      },
    ],
  },
  {
    id: "feedback",
    name: "Feedback Survey",
    description: "Collect user feedback and ratings",
    icon: MessageSquare,
    fields: [
      { id: "1", type: "text" as const, label: "Your Name", required: false },
      {
        id: "2",
        type: "email" as const,
        label: "Email (optional)",
        required: false,
      },
      {
        id: "3",
        type: "select" as const,
        label: "Rating",
        required: true,
        options: ["Excellent", "Good", "Average", "Poor"],
      },
      { id: "4", type: "textarea" as const, label: "Comments", required: true },
    ],
  },
  {
    id: "registration",
    name: "Event Registration",
    description: "Event registration with participant details",
    icon: Users,
    fields: [
      { id: "1", type: "text" as const, label: "Full Name", required: true },
      {
        id: "2",
        type: "email" as const,
        label: "Email Address",
        required: true,
      },
      { id: "3", type: "tel" as const, label: "Phone Number", required: true },
      {
        id: "4",
        type: "select" as const,
        label: "Ticket Type",
        required: true,
        options: ["Standard", "VIP", "Student"],
      },
      {
        id: "5",
        type: "textarea" as const,
        label: "Special Requirements",
        required: false,
      },
    ],
  },
];

const fieldTypes = [
  { type: "text", label: "Text Input", icon: FileText },
  { type: "email", label: "Email", icon: Mail },
  { type: "tel", label: "Phone", icon: Phone },
  { type: "number", label: "Number", icon: BarChart3 },
  { type: "textarea", label: "Long Text", icon: MessageSquare },
  { type: "select", label: "Dropdown", icon: Star },
  { type: "radio", label: "Multiple Choice", icon: Heart },
  { type: "checkbox", label: "Checkboxes", icon: Zap },
];

export default function CreateFormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fields: [] as FormField[],
  });
  const [activeTab, setActiveTab] = useState("design");

  const handleTemplateSelect = (template: (typeof formTemplates)[0]) => {
    setFormData({
      name: template.name,
      description: template.description,
      fields: template.fields.map((field) => ({
        ...field,
        placeholder: `Enter your ${field.label.toLowerCase()}`,
      })),
    });
    setActiveTab("design");
  };

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: `Enter ${type}`,
    };

    if (type === "select" || type === "radio" || type === "checkbox") {
      newField.options = ["Option 1", "Option 2"];
    }

    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeField = (fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
  };

  const saveForm = () => {
    // In a real app the form would be persisted to the database
    alert("Form saved successfully!");
    router.push("/wf");
  };

  const previewForm = () => {
    // In a real app this would open a preview in a modal or new page
    alert("Preview feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">Create New Form</h1>
              <p className="text-sm text-muted-foreground">
                Build your form with our visual editor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={previewForm}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={saveForm}>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose a Template</h2>
              <p className="text-muted-foreground">
                Start with a pre-built template or create from scratch
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Blank Template */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Plus className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Blank Form</h3>
                    <p className="text-sm text-muted-foreground">
                      Start from scratch
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setFormData({ name: "", description: "", fields: [] });
                      setActiveTab("design");
                    }}
                  >
                    Start Blank
                  </Button>
                </CardContent>
              </Card>

              {/* Template Cards */}
              {formTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <template.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Field Types Sidebar */}
              <div className="space-y-4">
                <h3 className="font-semibold">Field Types</h3>
                <div className="space-y-2">
                  {fieldTypes.map((fieldType) => (
                    <Button
                      key={fieldType.type}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        addField(fieldType.type as FormField["type"])
                      }
                    >
                      <fieldType.icon className="h-4 w-4 mr-2" />
                      {fieldType.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Form Builder */}
              <div className="lg:col-span-3 space-y-6">
                {/* Form Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Form Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="formName">Form Name</Label>
                      <Input
                        id="formName"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter form name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formDescription">Description</Label>
                      <Textarea
                        id="formDescription"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe what this form is for"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Form Fields */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Form Fields</CardTitle>
                      <CardDescription>
                        Drag and drop to reorder fields
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {formData.fields.length} fields
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {formData.fields.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No fields added yet</p>
                        <p className="text-sm">
                          Choose field types from the sidebar
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-start gap-4">
                              <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />
                              <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Field Label</Label>
                                    <Input
                                      value={field.label}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          label: e.target.value,
                                        })
                                      }
                                      placeholder="Field label"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Field Type</Label>
                                    <Select
                                      value={field.type}
                                      onValueChange={(value) =>
                                        updateField(field.id, {
                                          type: value as FormField["type"],
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {fieldTypes.map((type) => (
                                          <SelectItem
                                            key={type.type}
                                            value={type.type}
                                          >
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Placeholder</Label>
                                    <Input
                                      value={field.placeholder || ""}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          placeholder: e.target.value,
                                        })
                                      }
                                      placeholder="Placeholder text"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2 pt-6">
                                    <input
                                      type="checkbox"
                                      checked={field.required}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          required: e.target.checked,
                                        })
                                      }
                                      className="rounded"
                                    />
                                    <Label>Required field</Label>
                                  </div>
                                </div>

                                {(field.type === "select" ||
                                  field.type === "radio" ||
                                  field.type === "checkbox") && (
                                  <div className="space-y-2">
                                    <Label>Options</Label>
                                    <div className="space-y-2">
                                      {field.options?.map(
                                        (option, optionIndex) => (
                                          <div
                                            key={optionIndex}
                                            className="flex items-center gap-2"
                                          >
                                            <Input
                                              value={option}
                                              onChange={(e) => {
                                                const newOptions = [
                                                  ...(field.options || []),
                                                ];
                                                newOptions[optionIndex] =
                                                  e.target.value;
                                                updateField(field.id, {
                                                  options: newOptions,
                                                });
                                              }}
                                              placeholder={`Option ${
                                                optionIndex + 1
                                              }`}
                                            />
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                const newOptions =
                                                  field.options?.filter(
                                                    (_, i) => i !== optionIndex
                                                  );
                                                updateField(field.id, {
                                                  options: newOptions,
                                                });
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        )
                                      )}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newOptions = [
                                            ...(field.options || []),
                                            `Option ${
                                              (field.options?.length || 0) + 1
                                            }`,
                                          ];
                                          updateField(field.id, {
                                            options: newOptions,
                                          });
                                        }}
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Option
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeField(field.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
                <CardDescription>
                  Configure how your form behaves and appears
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Submission Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          defaultChecked
                        />
                        <Label>Send confirmation email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <Label>Limit submissions per user</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <Label>Close form after date</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Appearance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          defaultChecked
                        />
                        <Label>Show progress bar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          defaultChecked
                        />
                        <Label>Show required field indicators</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <Label>Enable dark mode</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
