import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Share2, Globe, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { WorldClock } from '../components/WorldClock';
import { TimeInput } from '../components/TimeInput';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/timezone';

export const HomePage: React.FC = () => {
  const [showTimeInput, setShowTimeInput] = useState(false);
  const navigate = useNavigate();

  const handleTimeSelect = async (date: Date, timezone: string, title: string, description?: string) => {
    try {
      const slug = generateSlug(title, date);
      
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('timezone_links')
        .insert({
          title,
          description: description || null,
          scheduled_time: date.toISOString(),
          timezone,
          slug,
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          user_id: user?.id || null, // Use user ID if logged in, otherwise anonymous
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/link/${slug}`);
    } catch (error) {
      console.error('Error creating link:', error);
      alert('Failed to create link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Never miss a meeting
            <span className="text-blue-600"> across timezones</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Share meeting times that automatically show in everyone's local timezone. 
            No more "What time is that for me?" confusion.
          </p>
          
          {!showTimeInput ? (
            <Button 
              size="lg" 
              onClick={() => setShowTimeInput(true)}
              className="text-lg px-8 py-4"
            >
              <Clock className="w-5 h-5 mr-2" />
              Create Your First Link
            </Button>
          ) : (
            <TimeInput onTimeSelect={handleTimeSelect} userPlan="starter" />
          )}
        </div>

        {/* World Clock Demo */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            See the timezone problem in action
          </h2>
          <WorldClock />
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Right now, it's a different time in each of these cities. When you say "let's meet at 2 PM," 
            which timezone do you mean? Timelyr eliminates the confusion.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center" hover>
            <CardContent className="py-8">
              <Share2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Smart Link Sharing</h3>
              <p className="text-gray-600">
                Generate clean, shareable links that automatically display the correct time in each viewer's timezone.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" hover>
            <CardContent className="py-8">
              <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Auto Timezone Detection</h3>
              <p className="text-gray-600">
                No manual timezone selection needed. We automatically detect and convert to each person's local time.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" hover>
            <CardContent className="py-8">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Business Hours Intelligence</h3>
              <p className="text-gray-600">
                See if your meeting time works across different regions and get suggestions for better scheduling.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-20">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Loved by teams worldwide
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Links created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Accuracy</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 text-white rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to eliminate timezone confusion?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams who never miss a meeting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setShowTimeInput(true)}
            >
              Try It Free
            </Button>
            <Link to="/pricing">
              <Button size="lg" variant="tertiary" className="text-white hover:bg-blue-700">
                View Pricing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};