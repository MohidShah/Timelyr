import React from 'react';
import { FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using Timelyr.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: January 2024</p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Agreement Overview
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                By using Timelyr, you agree to these terms. We've written them in plain English 
                to make them as clear as possible.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Scale className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Fair Terms</h3>
                  <p className="text-sm text-gray-600">Reasonable and balanced for everyone</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Clear Rights</h3>
                  <p className="text-sm text-gray-600">Your rights and responsibilities</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Important Limits</h3>
                  <p className="text-sm text-gray-600">What we can and cannot do</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Our Service</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Timelyr provides timezone conversion and link sharing services to help coordinate 
                meetings across different time zones. Our service includes:
              </p>
              <ul className="text-gray-600 space-y-2 ml-4">
                <li>• Creating shareable timezone links</li>
                <li>• Automatic timezone detection and conversion</li>
                <li>• User accounts and link management</li>
                <li>• Business hours intelligence</li>
                <li>• Calendar integration features</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Your Responsibilities</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Account Security</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Keep your login credentials secure</li>
                  <li>• Don't share your account with others</li>
                  <li>• Notify us immediately of any security breaches</li>
                  <li>• Use strong, unique passwords</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Acceptable Use</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Use the service for legitimate meeting coordination</li>
                  <li>• Don't create misleading or harmful content</li>
                  <li>• Respect others' privacy and data</li>
                  <li>• Don't attempt to hack or abuse the system</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Content Guidelines</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Keep meeting titles and descriptions professional</li>
                  <li>• Don't include personal or sensitive information</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Follow applicable laws and regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Service Availability</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-600">
                <strong>Uptime Goal:</strong> We strive for 99.9% uptime but cannot guarantee uninterrupted service.
              </p>
              <p className="text-gray-600">
                <strong>Maintenance:</strong> We may perform scheduled maintenance with advance notice.
              </p>
              <p className="text-gray-600">
                <strong>Service Changes:</strong> We may modify or discontinue features with reasonable notice.
              </p>
              <p className="text-gray-600">
                <strong>Data Backup:</strong> We maintain regular backups but recommend you keep copies of important information.
              </p>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Payment and Billing</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Free Plan</h3>
                <p className="text-gray-600">
                  Our Starter plan is free forever with usage limits. No payment required.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Pro Plan</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Billed monthly ($12) or annually ($120)</li>
                  <li>• Automatic renewal unless cancelled</li>
                  <li>• 14-day free trial for new subscribers</li>
                  <li>• Cancel anytime with immediate effect</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Refund Policy</h3>
                <p className="text-gray-600">
                  We offer prorated refunds for annual subscriptions cancelled within 30 days. 
                  Monthly subscriptions are not refundable but you can cancel anytime.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Limitations and Disclaimers</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-2">Service Limitations</h3>
                <ul className="text-amber-700 space-y-1 text-sm ml-4">
                  <li>• We provide the service "as is" without warranties</li>
                  <li>• Timezone data accuracy depends on third-party sources</li>
                  <li>• We're not liable for missed meetings or scheduling errors</li>
                  <li>• Service availability may vary by location</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Liability Limits</h3>
                <p className="text-gray-600">
                  Our liability is limited to the amount you've paid us in the past 12 months. 
                  We're not responsible for indirect damages or business losses.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Account Termination</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-600">
                <strong>Your Right:</strong> You can delete your account anytime from your profile settings.
              </p>
              <p className="text-gray-600">
                <strong>Our Right:</strong> We may suspend or terminate accounts that violate these terms.
              </p>
              <p className="text-gray-600">
                <strong>Data Retention:</strong> We'll delete your data within 30 days of account termination.
              </p>
              <p className="text-gray-600">
                <strong>Survival:</strong> Some terms (like payment obligations) survive account termination.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Changes to These Terms</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3">
                We may update these terms occasionally. When we do:
              </p>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• We'll notify you by email and in-app notification</li>
                <li>• Changes take effect 30 days after notification</li>
                <li>• Continued use means you accept the new terms</li>
                <li>• You can cancel your account if you disagree</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Questions?</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have questions about these terms, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> legal@timelyr.com</p>
                <p><strong>Address:</strong> Timelyr Inc., 123 Legal Street, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};