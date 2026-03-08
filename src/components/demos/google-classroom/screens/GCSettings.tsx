import React from 'react';
import { Settings, Bell, Shield, Palette } from 'lucide-react';

export function GCSettings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>

      <div className="space-y-4">
        {[
          { icon: Bell, title: 'Notifications', desc: 'Configure email and push notifications for class activity' },
          { icon: Shield, title: 'Privacy', desc: 'Manage who can see your classes and profile' },
          { icon: Palette, title: 'Appearance', desc: 'Customize class colors and themes' },
          { icon: Settings, title: 'General', desc: 'Language, timezone, and account preferences' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">Software Vala Classroom v1.0</p>
      </div>
    </div>
  );
}
