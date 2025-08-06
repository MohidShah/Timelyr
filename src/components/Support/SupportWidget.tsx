import React, { useState } from 'react';
import { MessageCircle, X, Send, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { createSupportTicket, submitFeedback, SUPPORT_CATEGORIES, FEEDBACK_TYPES } from '../../lib/support';

interface SupportWidgetProps {
  userId: string;
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'help' | 'ticket' | 'feedback'>('help');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Support ticket form
  const [ticketData, setTicketData] = useState({
    subject: '',
    message: '',
    category: 'technical' as const,
    priority: 'medium' as const
  });
  
  // Feedback form
  const [feedbackData, setFeedbackData] = useState({
    type: 'improvement' as const,
    rating: 0,
    message: ''
  });

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.subject || !ticketData.message) return;
    
    try {
      setLoading(true);
      await createSupportTicket(userId, ticketData);
      setSubmitted(true);
      setTicketData({ subject: '', message: '', category: 'technical', priority: 'medium' });
    } catch (error) {
      console.error('Error creating support ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackData.message) return;
    
    try {
      setLoading(true);
      await submitFeedback(userId, {
        ...feedbackData,
        page_url: window.location.href
      });
      setSubmitted(true);
      setFeedbackData({ type: 'improvement', rating: 0, message: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickHelp = [
    {
      question: 'How do I create a timezone link?',
      answer: 'Click the "Create Link" button and enter your meeting details. We\'ll generate a shareable link automatically.'
    },
    {
      question: 'Why isn\'t my link working?',
      answer: 'Check if your link has expired or been deactivated. You can reactivate it from your dashboard.'
    },
    {
      question: 'How do I upgrade to Pro?',
      answer: 'Go to Settings > Billing or visit our Pricing page to upgrade your account.'
    },
    {
      question: 'Can I customize my link URLs?',
      answer: 'Yes! Pro users can create custom URLs. Upgrade to Pro to access this feature.'
    }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 max-h-[500px] shadow-xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {mode === 'help' && 'Help & Support'}
              {mode === 'ticket' && 'Contact Support'}
              {mode === 'feedback' && 'Send Feedback'}
            </h3>
            <Button variant="tertiary" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {mode === 'help' && (
            <div className="flex space-x-1 mt-4">
              <Button size="sm" onClick={() => setMode('ticket')}>
                Contact Support
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setMode('feedback')}>
                Send Feedback
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 overflow-y-auto max-h-80">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {mode === 'ticket' ? 'Ticket Submitted!' : 'Feedback Sent!'}
              </h4>
              <p className="text-gray-600 mb-4">
                {mode === 'ticket' 
                  ? 'We\'ll respond to your support request within 24 hours.'
                  : 'Thank you for helping us improve Timelyr!'
                }
              </p>
              <Button onClick={() => {
                setSubmitted(false);
                setMode('help');
              }}>
                Back to Help
              </Button>
            </div>
          ) : mode === 'help' ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 mb-3">Frequently Asked Questions</h4>
              {quickHelp.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800 mb-2">{item.question}</h5>
                  <p className="text-sm text-gray-600">{item.answer}</p>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  Still need help? We're here for you!
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => setMode('ticket')}>
                    Contact Support
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setMode('feedback')}>
                    Send Feedback
                  </Button>
                </div>
              </div>
            </div>
          ) : mode === 'ticket' ? (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={ticketData.category}
                  onChange={(e) => setTicketData({ ...ticketData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="bug_report">Bug Report</option>
                </select>
              </div>
              
              <Input
                label="Subject"
                value={ticketData.subject}
                onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={ticketData.message}
                  onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                  placeholder="Please provide as much detail as possible..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" loading={loading} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Ticket
                </Button>
                <Button variant="secondary" onClick={() => setMode('help')}>
                  Back
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback Type
                </label>
                <select
                  value={feedbackData.type}
                  onChange={(e) => setFeedbackData({ ...feedbackData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="improvement">Improvement Suggestion</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="compliment">Compliment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (Optional)
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                      className={`p-1 ${
                        star <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={feedbackData.message}
                  onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                  placeholder="Tell us what you think..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" loading={loading} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
                <Button variant="secondary" onClick={() => setMode('help')}>
                  Back
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};