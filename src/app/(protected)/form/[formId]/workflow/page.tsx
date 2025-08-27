import React from "react";
import { Settings, Clock } from "lucide-react";

export default function WorkflowPage() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100">
            <Settings className="w-10 h-10 text-blue-600" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">Workflow</h1>
            <p className="text-gray-600 leading-relaxed">
              Configure automation rules, conditional logic, and form behavior.
              This page will allow you to set up complex form workflows.
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
