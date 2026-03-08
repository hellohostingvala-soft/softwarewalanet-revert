import React from 'react';
import { Users, UserPlus } from 'lucide-react';

export function GCStudents() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">People</h1>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1967d2] text-white rounded-lg hover:bg-[#1557b0] text-sm font-medium">
          <UserPlus className="w-4 h-4" /> Invite
        </button>
      </div>

      {/* Teachers Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 border-b border-[#1967d2] pb-2 mb-4">Teachers</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1967d2] flex items-center justify-center text-white font-medium">T</div>
            <div>
              <p className="font-medium text-gray-800 text-sm">Class Owner</p>
              <p className="text-xs text-gray-500">Teacher</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Section */}
      <div>
        <div className="flex items-center justify-between border-b border-[#1967d2] pb-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Students</h2>
          <span className="text-sm text-gray-500">0 students</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No students have joined yet</p>
          <p className="text-gray-400 text-xs mt-1">Share the class code to invite students</p>
        </div>
      </div>
    </div>
  );
}
