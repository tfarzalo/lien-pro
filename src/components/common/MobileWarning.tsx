import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';

export const MobileWarning: React.FC = () => {
  return (
    <div className="lg:hidden fixed inset-0 z-[100] bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="relative">
            <Smartphone className="h-20 w-20 text-white/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-1 w-16 bg-red-500 rotate-45"></div>
            </div>
          </div>
          <Monitor className="h-20 w-20 text-white" />
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-icon.png"
            alt="Lien Professor"
            className="h-16 w-16 rounded-lg"
          />
          <h1 className="text-2xl font-bold text-white">Lien Professor</h1>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Desktop View Required
          </h2>
          <p className="text-lg text-white/90 leading-relaxed">
            For the best experience, please visit Lien Professor on your desktop or laptop computer.
          </p>
          <p className="text-base text-white/80">
            Our mobile experience is coming soon!
          </p>
        </div>

        {/* Additional Info */}
        <div className="pt-6 border-t border-white/20">
          <p className="text-sm text-white/70">
            You can bookmark this page and return on your desktop
          </p>
        </div>
      </div>
    </div>
  );
};
