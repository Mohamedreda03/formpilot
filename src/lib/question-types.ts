import {
  Type,
  Mail,
  Phone,
  Calendar,
  Clock,
  Hash,
  Star,
  CheckSquare,
  Circle,
  List,
  FileText,
  Upload,
  CreditCard,
  Users,
  MapPin,
  Link,
  Image,
  ToggleLeft,
  Sliders,
  LucideIcon,
} from "lucide-react";

export interface QuestionTypeConfig {
  type: string;
  label: string;
  icon: LucideIcon;
  color: string;
  category: "basic" | "contact" | "choice" | "advanced" | "media";
}

// Define all question types as a union type
export type QuestionType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "url"
  | "multiple-choice"
  | "checkbox"
  | "dropdown"
  | "rating"
  | "scale"
  | "yes-no"
  | "date"
  | "time"
  | "file-upload"
  | "image"
  | "address"
  | "payment"
  | "signature";

export const QUESTION_TYPES: QuestionTypeConfig[] = [
  // Basic Types
  {
    type: "text",
    label: "Short Text",
    icon: Type,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    category: "basic",
  },
  {
    type: "textarea",
    label: "Long Text",
    icon: FileText,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    category: "basic",
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    color: "bg-green-50 text-green-600 border-green-200",
    category: "basic",
  },

  // Contact Types
  {
    type: "email",
    label: "Email",
    icon: Mail,
    color: "bg-red-50 text-red-600 border-red-200",
    category: "contact",
  },
  {
    type: "phone",
    label: "Phone",
    icon: Phone,
    color: "bg-orange-50 text-orange-600 border-orange-200",
    category: "contact",
  },
  {
    type: "address",
    label: "Address",
    icon: MapPin,
    color: "bg-teal-50 text-teal-600 border-teal-200",
    category: "contact",
  },

  // Choice Types
  {
    type: "multiple-choice",
    label: "Multiple Choice",
    icon: Circle,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    category: "choice",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
    color: "bg-pink-50 text-pink-600 border-pink-200",
    category: "choice",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: List,
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    category: "choice",
  },
  {
    type: "yes-no",
    label: "Yes/No",
    icon: ToggleLeft,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    category: "choice",
  },

  // Advanced Types
  {
    type: "date",
    label: "Date",
    icon: Calendar,
    color: "bg-violet-50 text-violet-600 border-violet-200",
    category: "advanced",
  },
  {
    type: "time",
    label: "Time",
    icon: Clock,
    color: "bg-rose-50 text-rose-600 border-rose-200",
    category: "advanced",
  },
  {
    type: "rating",
    label: "Rating",
    icon: Star,
    color: "bg-yellow-50 text-yellow-600 border-yellow-200",
    category: "advanced",
  },
  {
    type: "scale",
    label: "Scale",
    icon: Sliders,
    color: "bg-lime-50 text-lime-600 border-lime-200",
    category: "advanced",
  },
  {
    type: "payment",
    label: "Payment",
    icon: CreditCard,
    color: "bg-slate-50 text-slate-600 border-slate-200",
    category: "advanced",
  },
  {
    type: "signature",
    label: "Signature",
    icon: Users,
    color: "bg-amber-50 text-amber-600 border-amber-200",
    category: "advanced",
  },

  // Media Types
  {
    type: "file-upload",
    label: "File Upload",
    icon: Upload,
    color: "bg-gray-50 text-gray-600 border-gray-200",
    category: "media",
  },
  {
    type: "image",
    label: "Image",
    icon: Image,
    color: "bg-zinc-50 text-zinc-600 border-zinc-200",
    category: "media",
  },
  {
    type: "url",
    label: "Website URL",
    icon: Link,
    color: "bg-sky-50 text-sky-600 border-sky-200",
    category: "media",
  },
];

export const QUESTION_CATEGORIES = [
  { id: "basic", label: "Basic" },
  { id: "contact", label: "Contact" },
  { id: "choice", label: "Choice" },
  { id: "advanced", label: "Advanced" },
  { id: "media", label: "Media" },
] as const;

export function getQuestionTypeConfig(
  type: string
): QuestionTypeConfig | undefined {
  return QUESTION_TYPES.find((config) => config.type === type);
}

export function getQuestionTypesByCategory(
  category: string
): QuestionTypeConfig[] {
  return QUESTION_TYPES.filter((config) => config.category === category);
}
