import React from 'react';
import { Clock, Link2, Share2, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      icon: Clock,
      title: 'Input Your Time',
      description: 'Use natural language like "Tomorrow 2 PM" or pick a specific date and time.',
      details: [
        'Smart parsing understands natural language',
        'Visual date and time pickers available',
        'Automatic timezone detection',
        'Support for all global timezones',
      ],
    },
    {
      icon: Link2,
      title: 'Get Your Link',
      description: 'Instantly generate a clean, shareable link that works everywhere.',
      details: [
        'Clean URLs like timelyr.com/meeting-jan-15',
        'No account required for basic links',
        'Links work immediately',
        'QR codes for mobile sharing',
      ],
    },
    {
      icon: Share2,
      title: 'Share Anywhere',
      description: 'Copy, email, or share your link through any platform.',
      details: [
        'One-click copy to clipboard',
        'Email and social media integration',
        'Native mobile sharing',
        'Works in Slack, Teams, WhatsApp',
      ],
    },
    {
      icon: Globe,
      title: 'Everyone Sees Their Time',
      description: 'Viewers automatically see the time in their local timezone.',
      details: [
        'Automatic timezone detection',
        'No manual selection needed',
        'Works globally, instantly',
        'Business hours intelligence',
      ],
    },
  ];

  const examples = [
    {
      input: '"Tomorrow 2 PM PST"',
      locations: [
        { city: 'San Francisco', time: '2:00 PM', date: 'Jan 16' },
        { city: 'New York', time: '5:00 PM', date: 'Jan 16' },
        { city: 'London', time: '10:00 PM', date: 'Jan 16' },
        { city: 'Tokyo', time: '7:00 AM', date: 'Jan 17' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Timelyr Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Four simple steps to eliminate timezone confusion forever. 
            No downloads, no signups required for basic use.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-1">
                <Card className={`${index % 2 === 0 ? 'mr-8' : 'ml-8'}`} hover>
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <step.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-600 mb-1">
                          Step {index + 1}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center w-16">
                  <ArrowRight className="w-8 h-8 text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Example */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            See It In Action
          </h2>
          {examples.map((example, index) => (
            <Card key={index} className="max-w-4xl mx-auto" hover>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    When you input: <span className="text-blue-600">{example.input}</span>
                  </h3>
                  <p className="text-gray-600">Here's what people see around the world:</p>
                </div>
                <div className="grid md:grid-cols-4 gap-6">
                  {example.locations.map((location, locationIndex) => (
                    <div key={locationIndex} className="text-center p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {location.city}
                      </h4>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {location.time}
                      </div>
                      <div className="text-sm text-gray-600">{location.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center" hover>
            <CardContent className="py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No More Confusion</h3>
              <p className="text-gray-600">
                Eliminate "What time is that for me?" questions forever. 
                Everyone sees their local time automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" hover>
            <CardContent className="py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save Time</h3>
              <p className="text-gray-600">
                No more back-and-forth messages to coordinate meeting times. 
                Share once, work everywhere.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" hover>
            <CardContent className="py-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Ready</h3>
              <p className="text-gray-600">
                Works with all timezones, handles daylight saving time, 
                and supports international date formats.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to try it yourself?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Create your first timezone link in seconds. No signup required.
            </p>
            <Button variant="secondary" size="lg" className="text-blue-600">
              Create Your First Link
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};