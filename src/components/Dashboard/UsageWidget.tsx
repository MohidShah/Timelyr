import React from 'react';
import { Crown, TrendingUp, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

interface UsageWidgetProps {
  userProfile: any;
  analytics: {
    linksCreatedThisMonth: number;
    totalViews: number;
    activeLinks: number;
  };
}

export const UsageWidget: React.FC<UsageWidgetProps> = ({
  userProfile,
  analytics
}) => {
  const plan = userProfile?.plan || 'starter';
  const isProUser = plan === 'pro';
  const monthlyLimit = isProUser ? null : 50;
  const usagePercentage = monthlyLimit ? (analytics.linksCreatedThisMonth / monthlyLimit) * 100 : 0;
  
  const getUsageColor = () => {
    if (usagePercentage < 50) return 'green';
    if (usagePercentage < 80) return 'yellow';
    return 'red';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Usage Overview</h3>
          <Badge variant={isProUser ? 'default' : 'secondary'}>
            {isProUser && <Crown className="w-3 h-3 mr-1" />}
            {plan}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Links Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Links This Month</span>
            <span className="text-sm font-bold text-gray-800">
              {analytics.linksCreatedThisMonth}
              {monthlyLimit && ` / ${monthlyLimit}`}
            </span>
          </div>
          {monthlyLimit ? (
            <ProgressBar
              value={analytics.linksCreatedThisMonth}
              max={monthlyLimit}
              color={getUsageColor()}
              showPercentage
            />
          ) : (
            <div className="text-sm text-green-600 font-medium">
              ✨ Unlimited links
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">{analytics.activeLinks}</div>
            <div className="text-xs text-gray-600">Active Links</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Eye className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">{analytics.totalViews}</div>
            <div className="text-xs text-gray-600">Total Views</div>
          </div>
        </div>

        {/* Upgrade CTA for Starter users */}
        {!isProUser && usagePercentage > 70 && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-amber-800">Approaching Limit</h4>
                <p className="text-sm text-amber-600">
                  Upgrade to Pro for unlimited links
                </p>
              </div>
              <Link to="/pricing">
                <Button size="sm">
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};