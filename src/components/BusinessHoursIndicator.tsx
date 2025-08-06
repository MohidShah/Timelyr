import React from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { getBusinessHoursStatus } from '../lib/timezone';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface BusinessHoursIndicatorProps {
  scheduledTime: Date;
  className?: string;
  userPlan?: 'starter' | 'pro';
}

export const BusinessHoursIndicator: React.FC<BusinessHoursIndicatorProps> = ({
  scheduledTime,
  className = '',
  userPlan = 'starter',
}) => {
  const businessHoursStatus = getBusinessHoursStatus(scheduledTime);
  const isProFeature = userPlan !== 'pro';

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Business Hours Impact
          {isProFeature && (
            <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
              Pro Feature
            </span>
          )}
        </h3>
      </CardHeader>
      <CardContent className={isProFeature ? 'filter blur-sm opacity-60' : ''}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessHoursStatus.map((region) => (
            <div
              key={region.name}
              className={`p-4 rounded-lg border-2 ${
                region.isBusinessHours
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center mb-2">
                {region.isBusinessHours ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className="font-medium text-gray-800">{region.name}</span>
              </div>
              <p className="text-sm text-gray-600">{region.localTime}</p>
              <p className={`text-xs font-medium ${
                region.isBusinessHours ? 'text-green-700' : 'text-red-700'
              }`}>
                {region.isBusinessHours ? 'Business Hours' : 'Outside Business Hours'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};