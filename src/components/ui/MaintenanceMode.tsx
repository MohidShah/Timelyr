import React from 'react';
import { Wrench, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from './Card';

interface MaintenanceModeProps {
  estimatedDuration?: string;
  message?: string;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({
  estimatedDuration = '30 minutes',
  message = 'We\'re performing scheduled maintenance to improve your experience.'
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-8 h-8 text-orange-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Scheduled Maintenance
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center text-orange-700">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Estimated duration: {estimatedDuration}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p className="mb-2">We apologize for any inconvenience.</p>
            <p>Follow us on Twitter @timelyr for updates.</p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center text-gray-400">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="text-xs">
                Status: timelyr.com/status
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};