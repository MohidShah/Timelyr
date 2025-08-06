import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

interface PlanUpgradePromptProps {
  feature: string;
  description: string;
  onClose?: () => void;
  className?: string;
}

export const PlanUpgradePrompt: React.FC<PlanUpgradePromptProps> = ({
  feature,
  description,
  onClose,
  className = ''
}) => {
  return (
    <Card className={`border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Upgrade to Pro for {feature}
              </h3>
              <p className="text-gray-600 mb-4">{description}</p>
              <div className="flex items-center space-x-3">
                <Link to="/pricing">
                  <Button size="sm">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="tertiary" size="sm">
                    Compare Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};