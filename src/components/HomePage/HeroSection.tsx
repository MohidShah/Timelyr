import React, { useState } from 'react';
import { Clock, ArrowRight, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { TimeInput } from '../TimeInput';

interface HeroSectionProps {
  onCreateLink: (date: Date, timezone: string, title: string, description?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCreateLink }) => {
  const [showTimeInput, setShowTimeInput] = useState(false);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Never miss a meeting
            <span className="text-blue-600"> across timezones</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Share meeting times that automatically show in everyone's local timezone. 
            No more "What time is that for me?" confusion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!showTimeInput ? (
              <>
                <Button 
                  size="lg" 
                  onClick={() => setShowTimeInput(true)}
                  className="text-lg px-8 py-4"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Create Your First Link
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => {
                    document.getElementById('demo-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                  className="text-lg px-8 py-4"
                >
                  <Play className="w-5 h-5 mr-2" />
                  See How It Works
                </Button>
              </>
            ) : (
              <div className="w-full max-w-2xl mx-auto">
                <TimeInput onTimeSelect={onCreateLink} userPlan="starter" />
              </div>
            )}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span>50+ Countries</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              <span>10,000+ Links Created</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};