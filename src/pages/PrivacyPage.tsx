import React from 'react';
import { Shield, Eye, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is important to us. Here's how we protect and handle your data.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: January 2024</p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                Privacy Overview
              </h2>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                At Timelyr, we believe in transparency and your right to privacy. This policy explains 
                what information we collect, how we use it, and your rights regarding your personal data.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Minimal Collection</h3>
                  <p className="text-sm text-gray-600">We only collect data necessary for our service</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Lock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Secure Storage</h3>
                  <p className="text-sm text-gray-600">Your data is encrypted and securely stored</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">GDPR Compliant</h3>
                  <p className="text-sm text-gray-600">Full compliance with privacy regulations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Information We Collect</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Account Information</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Email address (required for account creation)</li>
                  <li>• Full name (optional)</li>
                  <li>• Username (optional, for custom URLs)</li>
                  <li>• Profile picture (optional)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Timezone Links</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Meeting titles and descriptions you create</li>
                  <li>• Scheduled times and timezones</li>
                  <li>• Link creation and expiration dates</li>
                  <li>• View counts (anonymous)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Usage Data</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Browser type and version</li>
                  <li>• Device information</li>
                  <li>• IP address (for timezone detection only)</li>
                  <li>• Pages visited and features used</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">How We Use Your Information</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-600">
                <p><strong>Service Delivery:</strong> To provide timezone conversion and link sharing functionality</p>
                <p><strong>Account Management:</strong> To maintain your account and provide customer support</p>
                <p><strong>Communication:</strong> To send important service updates and respond to inquiries</p>
                <p><strong>Improvement:</strong> To analyze usage patterns and improve our service (anonymized data only)</p>
                <p><strong>Security:</strong> To protect against fraud, abuse, and security threats</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Data Sharing and Disclosure</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">We DO NOT sell your data</h3>
                  <p className="text-green-700 text-sm">
                    We never sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Limited Sharing</h3>
                  <p className="text-gray-600 mb-2">We may share your information only in these specific cases:</p>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• With your explicit consent</li>
                    <li>• To comply with legal obligations</li>
                    <li>• To protect our rights and prevent fraud</li>
                    <li>• With service providers who help us operate (under strict confidentiality)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Your Privacy Rights</h2>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Access & Control</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• View all data we have about you</li>
                    <li>• Update or correct your information</li>
                    <li>• Download your data</li>
                    <li>• Delete your account and data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Communication</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Opt out of marketing emails</li>
                    <li>• Control notification preferences</li>
                    <li>• Request data processing restrictions</li>
                    <li>• File complaints with authorities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Data Security</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-600">
                <p><strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard protocols</p>
                <p><strong>Access Controls:</strong> Strict access controls limit who can view your data</p>
                <p><strong>Regular Audits:</strong> We regularly review and update our security practices</p>
                <p><strong>Incident Response:</strong> We have procedures in place to respond to any security incidents</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Contact Us</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have questions about this privacy policy or want to exercise your rights, contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@timelyr.com</p>
                <p><strong>Address:</strong> Timelyr Inc., 123 Privacy Street, San Francisco, CA 94105</p>
                <p><strong>Response Time:</strong> We respond to all privacy requests within 30 days</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};