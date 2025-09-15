import React from 'react';
import { Plus, BarChart3, Settings, Download, Share2, Users, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface QuickActionsProps {
  onCreateLink: () => void;
  onViewAnalytics: () => void;
  onManageProfile: () => void;
  onExportData: () => void;
  userPlan?: 'starter' | 'pro';
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateLink,
  onViewAnalytics,
  onManageProfile,
  onExportData,
  userPlan = 'starter'
}) => {
  const actions = [
    {
      icon: Plus,
      label: 'Create Link',
      description: 'New timezone link',
      onClick: onCreateLink,
      variant: 'primary' as const,
      available: true
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'View performance',
      onClick: onViewAnalytics,
      variant: 'secondary' as const,
      available: userPlan === 'pro',
      proOnly: true
    },
    {
      icon: Settings,
      label: 'Profile',
      description: 'Manage settings',
      onClick: onManageProfile,
      variant: 'secondary' as const,
      available: true
    },
    {
      icon: Download,
      label: 'Export',
      description: 'Download data',
      onClick: onExportData,
      variant: 'secondary' as const,
      available: userPlan === 'pro',
      proOnly: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.available ? action.variant : 'tertiary'}
              className={`flex flex-col items-center justify-center h-20 space-y-1 relative ${
                !action.available ? 'opacity-50' : ''
              }`}
              onClick={action.available ? action.onClick : undefined}
              disabled={!action.available}
            >
              {action.proOnly && !action.available && (
                <Crown className="absolute top-1 right-1 w-3 h-3 text-amber-500" />
              )}
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
              <span className="text-xs text-gray-500">{action.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};