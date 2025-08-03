import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setLoading(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help with your account or technical issues',
      contact: 'support@timelyr.com',
      response: 'Response within 24 hours',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      contact: 'Available 9 AM - 6 PM PST',
      response: 'Instant response',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our team (Pro users)',
      contact: '+1 (555) 123-4567',
      response: 'Available weekdays',
    },
  ];

  const faqs = [
    {
      question: 'How accurate are the timezone conversions?',
      answer: 'Our timezone conversions are highly accurate, using official timezone databases that are updated regularly to account for daylight saving time changes and political timezone modifications.',
    },
    {
      question: 'Can I use Timelyr without creating an account?',
      answer: 'Yes! You can create and share timezone links without an account. However, creating an account allows you to manage your links, track analytics, and access advanced features.',
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer: 'If you reach your monthly link limit on the Starter plan, you\'ll need to upgrade to Pro to create more links. Your existing links will continue to work normally.',
    },
    {
      question: 'Do timezone links expire?',
      answer: 'Starter plan links expire after 30 days, while Pro plan links last for 1 year. You can always extend or reactivate expired links from your dashboard.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions, feedback, or need help? We're here to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Methods */}
          {contactMethods.map((method, index) => (
            <Card key={index} className="text-center" hover>
              <CardContent className="py-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-3">{method.description}</p>
                <p className="font-medium text-blue-600 mb-1">{method.contact}</p>
                <p className="text-sm text-gray-500">{method.response}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-800">Send us a Message</h2>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">
                    Thank you for contacting us. We'll respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="py-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Office Info */}
            <Card className="mt-8">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Our Office
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-600">
                  <p>Timelyr Inc.</p>
                  <p>123 Innovation Drive</p>
                  <p>San Francisco, CA 94105</p>
                  <p>United States</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Office hours: Monday - Friday, 9 AM - 6 PM PST
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};