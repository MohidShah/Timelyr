import React from 'react';
import { Check, Clock, Zap, Shield, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export const PricingPage: React.FC = () => {
  const features = {
    starter: [
      '50 links per month',
      'Basic timezone conversion',
      '30-day link expiration',
      'Timelyr branding on links',
      'Community support',
      'Mobile responsive',
      'Calendar export (.ics)',
    ],
    pro: [
      'Unlimited link creation',
      'Custom username-based slugs',
      'Advanced analytics dashboard',
      '1-year link expiration',
      'Calendar integration',
      'Remove Timelyr branding',
      'Profile customization',
      'Email reminders',
      'Two-factor authentication',
      'Priority support',
      'QR code generation',
      'Business hours intelligence',
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade when you need more features. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <Card className="relative border-2 border-gray-200" hover>
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Starter</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">Free</span>
                <span className="text-gray-500 ml-2">forever</span>
              </div>
              <p className="text-gray-600 mt-2">Perfect for getting started</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                {features.starter.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full" size="lg">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-blue-300 shadow-lg" hover>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                <Star className="w-4 h-4 mr-1" />
                Most Popular
              </div>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$12</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                or $120/year (save 17%)
              </div>
              <p className="text-gray-600 mt-2">For teams and power users</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                {features.pro.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg">
                Start Pro Trial
              </Button>
              <p className="text-center text-sm text-gray-500 mt-3">
                14-day free trial, then $12/month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Can I upgrade or downgrade at any time?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade to Pro anytime or downgrade at the end of your billing cycle. 
                Your links remain active during transitions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                What happens when I hit the 50 link limit?
              </h3>
              <p className="text-gray-600">
                Your existing links continue to work, but you'll need to upgrade to Pro to create new ones. 
                We'll send you a friendly reminder as you approach the limit.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Do links expire automatically?
              </h3>
              <p className="text-gray-600">
                Starter links expire after 30 days, Pro links after 1 year. You can always extend or 
                reactivate expired links from your dashboard.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Is there a team or enterprise plan?
              </h3>
              <p className="text-gray-600">
                We're working on team features! If you need something specific for your organization, 
                reach out to us and we'll work something out.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-2" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};