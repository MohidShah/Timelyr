import React, { useState } from 'react';
import { Database, X, Info } from 'lucide-react';
import { Button } from './ui/Button';

export const MockDataIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Only show if we're using mock data
  const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
  
  if (!isMockMode || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Database className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                Demo Mode Active
              </h4>
              <p className="text-xs text-amber-700 mb-2">
                You're viewing simulated data. All features are functional but data resets on refresh.
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => window.open('https://supabase.com', '_blank')}
                  className="text-xs"
                >
                  <Info className="w-3 h-3 mr-1" />
                  Setup Real DB
                </Button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};