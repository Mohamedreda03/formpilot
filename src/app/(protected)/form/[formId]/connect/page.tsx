import React from "react";
import { Link, Clock } from "lucide-react";

export default function ConnectPage() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
            <Link className="w-10 h-10 text-green-600" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">Connect</h1>
            <p className="text-gray-600 leading-relaxed">
              Integrate your form with external services, webhooks, email
              notifications, and third-party applications like Google Sheets,
              Slack, and more.
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
