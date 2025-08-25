// Mock data to use when Appwrite is rate limited or has issues
export const mockUser = {
  $id: "mock-user",
  email: "user@example.com",
  name: "John Doe",
  preferences: {},
  registration: "2024-01-15T10:00:00Z",
  status: true,
  labels: [],
  emailVerification: true,
  phoneVerification: false,
  mfa: false,
  prefs: {},
  targets: [],
  accessedAt: "2024-01-20T14:30:00Z",
};

export const mockWorkspaces = [
  {
    $id: "mock-workspace-1",
    name: "My First Workspace",
    description: "Default workspace for getting started",
    ownerId: "mock-user",
    status: "active" as const,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    $id: "mock-workspace-2",
    name: "Marketing Team",
    description: "Workspace for marketing forms and campaigns",
    ownerId: "mock-user",
    status: "active" as const,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    isDefault: false,
  },
];

export const mockForms = [
  {
    $id: "mock-form-1",
    name: "Contact Form",
    description: "Simple contact form for website",
    workspaceId: "mock-workspace-1",
    ownerId: "mock-user",
    status: "active" as const,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    submissions: 25,
  },
  {
    $id: "mock-form-2",
    name: "Newsletter Signup",
    description: "Email newsletter subscription form",
    workspaceId: "mock-workspace-1",
    ownerId: "mock-user",
    status: "active" as const,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    submissions: 150,
  },
];
