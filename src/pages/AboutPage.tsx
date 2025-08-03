import React from 'react';
import { Clock, Globe, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Product Designer',
      bio: 'UX expert passionate about creating intuitive experiences for global teams.',
      avatar: '🎨',
    },
    {
      name: 'Michael Chen',
      role: 'Full Stack Developer',
      bio: 'Backend specialist focused on scalable timezone conversion algorithms.',
      avatar: '⚡',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Growth Marketing',
      bio: 'Data-driven marketer helping teams worldwide discover better collaboration.',
      avatar: '📈',
    },
  ];

  const stats = [
    { number: '50+', label: 'Countries' },
    { number: '10,000+', label: 'Links Created' },
    { number: '500+', label: 'Teams Helped' },
    { number: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Timelyr
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to eliminate timezone confusion and help teams 
            around the world collaborate effortlessly.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Timelyr was born out of frustration. As remote work became the norm, 
                our founder Alex was constantly dealing with timezone confusion in 
                his globally distributed team at Google.
              </p>
              <p>
                "What time is 2 PM PST in London?" "When you say tomorrow, do you 
                mean my tomorrow or your tomorrow?" These questions were consuming 
                valuable time in every meeting scheduling conversation.
              </p>
              <p>
                We realized that existing solutions were either too complicated 
                or didn't solve the core problem: making it effortless for anyone 
                to share a time that automatically works in everyone's timezone.
              </p>
              <p>
                So we built Timelyr - the simplest way to share meeting times 
                that work for everyone, everywhere.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center" hover>
            <CardContent className="py-8">
              <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Global First</h3>
              <p className="text-gray-600">
                We design for a world where teams span continents and time zones 
                are just another detail to handle automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" hover>
            <CardContent className="py-8">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">User Focused</h3>
              <p className="text-gray-600">
                Every feature we build starts with a real problem our users face. 
                We prioritize simplicity and effectiveness over complexity.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" hover>
            <CardContent className="py-8">
              <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Built with Care</h3>
              <p className="text-gray-600">
                We're a small team that cares deeply about the details. Every 
                pixel, every interaction, every feature is crafted with love.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Meet the Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center" hover>
                <CardContent className="py-8">
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="py-12">
            <Clock className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">
              Have questions or feedback?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              We'd love to hear from you. Reach out anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:hello@timelyr.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Send us an email
              </a>
              <a 
                href="https://twitter.com/timelyr"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Follow us on Twitter
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};