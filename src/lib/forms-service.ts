import { ID, Query } from "appwrite";
import { databases } from "./appwrite";
import { QuestionType } from "./question-types";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const FORMS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID!;

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  placeholder?: string;
  options?: string[];
  maxRating?: number;
  acceptedFormats?: string;
}

export interface PageData {
  title: string;
  description: string;
  buttonText: string;
}

export interface FormData {
  id?: string;
  title: string;
  description?: string;
  questions: Question[];
  introTitle?: string;
  introDescription?: string;
  introButtonText?: string;
  outroTitle?: string;
  outroDescription?: string;
  outroButtonText?: string;
  userId: string;
  workspaceId?: string;
  isPublic?: boolean;
  isActive?: boolean;
  submissionCount?: number;
  slug?: string;
  settings?: any;
  $createdAt?: string;
  $updatedAt?: string;
}

export class FormsService {
  // Create default questions when creating a new form
  private static getDefaultQuestions(): Question[] {
    return [
      {
        id: ID.unique(),
        type: "text" as QuestionType,
        title: "What's your name?",
        description: "Please enter your full name",
        required: true,
        order: 0,
        placeholder: "Enter your name here...",
      },
    ];
  }

  // Create a new form
  static async create(data: Omit<FormData, "id">): Promise<FormData> {
    // Use provided questions or create default ones
    const defaultQuestions =
      data.questions && data.questions.length > 0
        ? data.questions
        : this.getDefaultQuestions();

    const formData = {
      title: data.title,
      description: data.description || "",
      questions: JSON.stringify(defaultQuestions),
      introTitle: data.introTitle || "Welcome to the survey",
      introDescription:
        data.introDescription ||
        "We value your time — please take a few minutes to complete this survey.",
      introButtonText: data.introButtonText || "Get Started",
      outroTitle: data.outroTitle || "Thank you for your time",
      outroDescription:
        data.outroDescription ||
        "Your responses have been submitted successfully.",
      outroButtonText: data.outroButtonText || "Submit",
      userId: data.userId,
      workspaceId: data.workspaceId || null,
      isPublic: data.isPublic || false,
      isActive: data.isActive || true,
      submissionCount: data.submissionCount || 0,
      slug: data.slug || null,
      settings: JSON.stringify(data.settings || {}),
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      FORMS_COLLECTION_ID,
      ID.unique(),
      formData
    );

    return this.transformDocument(response);
  }

  // Get a form by ID
  static async getById(formId: string): Promise<FormData> {
    const response = await databases.getDocument(
      DATABASE_ID,
      FORMS_COLLECTION_ID,
      formId
    );

    return this.transformDocument(response);
  }

  // Update a form
  static async update(
    formId: string,
    data: Partial<FormData>
  ): Promise<FormData> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.questions !== undefined)
      updateData.questions = JSON.stringify(data.questions);
    if (data.introTitle !== undefined) updateData.introTitle = data.introTitle;
    if (data.introDescription !== undefined)
      updateData.introDescription = data.introDescription;
    if (data.introButtonText !== undefined)
      updateData.introButtonText = data.introButtonText;
    if (data.outroTitle !== undefined) updateData.outroTitle = data.outroTitle;
    if (data.outroDescription !== undefined)
      updateData.outroDescription = data.outroDescription;
    if (data.outroButtonText !== undefined)
      updateData.outroButtonText = data.outroButtonText;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.submissionCount !== undefined)
      updateData.submissionCount = data.submissionCount;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.settings !== undefined)
      updateData.settings = JSON.stringify(data.settings);

    const response = await databases.updateDocument(
      DATABASE_ID,
      FORMS_COLLECTION_ID,
      formId,
      updateData
    );

    return this.transformDocument(response);
  }

  // Delete a form
  static async delete(formId: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, FORMS_COLLECTION_ID, formId);
  }

  // Get forms by user
  static async getByUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<FormData[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      FORMS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return response.documents.map((doc) => this.transformDocument(doc));
  }

  // Get forms by workspace
  static async getByWorkspace(
    workspaceId: string,
    limit = 50,
    offset = 0
  ): Promise<FormData[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      FORMS_COLLECTION_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return response.documents.map((doc) => this.transformDocument(doc));
  }

  // Get public forms
  static async getPublic(limit = 50, offset = 0): Promise<FormData[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      FORMS_COLLECTION_ID,
      [
        Query.equal("isPublic", true),
        Query.equal("isActive", true),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return response.documents.map((doc) => this.transformDocument(doc));
  }

  // Search forms
  static async search(
    query: string,
    userId: string,
    limit = 20
  ): Promise<FormData[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      FORMS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.search("title", query),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ]
    );

    return response.documents.map((doc) => this.transformDocument(doc));
  }

  // Update question order
  static async updateQuestionOrder(
    formId: string,
    questions: Question[]
  ): Promise<FormData> {
    return this.update(formId, { questions });
  }

  // Update intro page
  static async updateIntroPage(
    formId: string,
    introData: PageData
  ): Promise<FormData> {
    return this.update(formId, {
      introTitle: introData.title,
      introDescription: introData.description,
      introButtonText: introData.buttonText,
    });
  }

  // Update outro page
  static async updateOutroPage(
    formId: string,
    outroData: PageData
  ): Promise<FormData> {
    return this.update(formId, {
      outroTitle: outroData.title,
      outroDescription: outroData.description,
      outroButtonText: outroData.buttonText,
    });
  }

  // Increment submission count
  static async incrementSubmissionCount(formId: string): Promise<void> {
    const form = await this.getById(formId);
    await this.update(formId, {
      submissionCount: (form.submissionCount || 0) + 1,
    });
  }

  // Transform document from Appwrite format to our format
  private static transformDocument(doc: any): FormData {
    return {
      id: doc.$id,
      title: doc.title,
      description: doc.description || "",
      questions: doc.questions ? JSON.parse(doc.questions) : [],
      introTitle: doc.introTitle || "Welcome to our survey",
      introDescription:
        doc.introDescription ||
        "We'd love to hear your thoughts. Please take a few minutes to complete this survey.",
      introButtonText: doc.introButtonText || "Start",
      outroTitle: doc.outroTitle || "Thank you for your time",
      outroDescription:
        doc.outroDescription ||
        "Your responses have been recorded. We appreciate your feedback!",
      outroButtonText: doc.outroButtonText || "Submit",
      userId: doc.userId,
      workspaceId: doc.workspaceId,
      isPublic: doc.isPublic || false,
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      submissionCount: doc.submissionCount || 0,
      slug: doc.slug,
      settings: doc.settings ? JSON.parse(doc.settings) : {},
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
    };
  }
}
