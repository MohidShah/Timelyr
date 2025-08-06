import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Copy, ExternalLink, Plus, ArrowLeft, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatInTimezone, getUserTimezone } from '../lib/timezone';
import { BusinessHoursIndicator } from '../components/BusinessHoursIndicator';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { PlanUpgradePrompt } from '../components/PlanUpgradePrompt';
import { trackLinkView } from '../lib/analytics';
import { hasFeatureAccess } from '../lib/plans';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import type { TimezoneLink } from '../lib/supabase';

export const LinkViewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [link, setLink] = useState<TimezoneLink | null>(null);
  const [linkOwner, setLinkOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;

    const fetchLink = async () => {
      try {
        const { data, error } = await supabase
          .from('timezone_links')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setLink(data);

        // Get link owner's profile to check plan
        if (data.user_id) {
          const { data: ownerProfile } = await supabase
            .from('user_profiles')
            .select('plan, profile_visibility')
            .eq('id', data.user_id)
            .single();
          setLinkOwner(ownerProfile);
        }

        // Track the view with analytics
        await trackLinkView(data.id, {
          timezone: getUserTimezone(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        });
      } catch (error) {
        console.error('Error fetching link:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [slug]);

  useEffect(() => {
    if (!link) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const eventTime = new Date(link.scheduled_time);
      const diff = eventTime.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes}m`);
        }
      } else {
        setTimeRemaining('Event has passed');
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [link]);

  const handleCopyLink = async () => {
    if (!link) return;
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const generateCalendarFile = () => {
    if (!link) return;

    const eventTime = new Date(link.scheduled_time);
    const endTime = new Date(eventTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatCalendarDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Timelyr//Timezone Link//EN
BEGIN:VEVENT
UID:${link.id}@timelyr.com
DTSTAMP:${formatCalendarDate(new Date())}
DTSTART:${formatCalendarDate(eventTime)}
DTEND:${formatCalendarDate(endTime)}
SUMMARY:${link.title}
DESCRIPTION:${link.description || 'Scheduled via Timelyr'}
URL:${window.location.href}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([calendarContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${link.title.replace(/[^a-z0-9]/gi, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!link) return;
    
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: `Join me for: ${link.title}`,
          url: url,
        });
      } catch (error) {
        // Fallback to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Link not found</h1>
            <p className="text-gray-600 mb-6">
              This timezone link doesn't exist or has been deactivated.
            </p>
            <Link to="/">
              <Button>Create Your Own Link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userTimezone = getUserTimezone();
  const eventTime = new Date(link.scheduled_time);
  const localTimeString = formatInTimezone(eventTime, userTimezone);
  const originalTimeString = formatInTimezone(eventTime, link.timezone);
  const showQRCode = linkOwner?.plan === 'pro' || !link.user_id; // Show for pro users or anonymous links
  const showBusinessHours = linkOwner?.plan === 'pro' || !link.user_id;
  const showBranding = linkOwner?.plan !== 'pro';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="tertiary"
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Main Event Card */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{link.title}</h1>
            {link.description && (
              <p className="text-gray-600">{link.description}</p>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Local Time Display */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-medium text-blue-800 mb-2">Your Local Time</h2>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {format(eventTime, 'h:mm a')}
              </div>
              <div className="text-xl text-blue-700">
                {format(eventTime, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-sm text-blue-600 mt-2">
                {userTimezone.replace('_', ' ')}
              </div>
            </div>

            {/* Time Remaining */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-lg font-medium text-gray-700">
                {timeRemaining === 'Event has passed' ? (
                  <span className="text-red-600">Event has passed</span>
                ) : (
                  <>
                    <Clock className="w-5 h-5 inline mr-2" />
                    {timeRemaining} remaining
                  </>
                )}
              </div>
            </div>

            {/* Original Time Reference */}
            <div className="text-sm text-gray-500">
              <p>Originally scheduled for:</p>
              <p className="font-medium">{originalTimeString}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={generateCalendarFile} size="lg">
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
              <Button onClick={handleCopyLink} variant="secondary" size="lg">
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button onClick={handleShare} variant="secondary" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours Indicator */}
        {showBusinessHours ? (
          <BusinessHoursIndicator 
            scheduledTime={eventTime} 
            className="mb-8"
            userPlan={linkOwner?.plan || 'starter'}
          />
        ) : (
          <PlanUpgradePrompt
            feature="Business Hours Intelligence"
            description="See if your meeting time works across different regions and get suggestions for better scheduling."
            className="mb-8"
          />
        )}

        {/* QR Code for Pro users */}
        {showQRCode && (
          <QRCodeGenerator 
            url={window.location.href}
            title={link.title}
            className="mb-8"
          />
        )}

        {/* Create Your Own CTA */}
        <Card className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="py-8">
            <h3 className="text-2xl font-bold mb-4">Need to schedule your own meeting?</h3>
            <p className="text-blue-100 mb-6">
              Create timezone links that work for everyone, anywhere in the world.
            </p>
            <Link to="/">
              <Button variant="secondary" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Your Link
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Timelyr Branding for Free Users */}
        {showBranding && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Powered by <span className="font-semibold ml-1">Timelyr</span>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This link has been viewed {link.view_count} times</p>
        </div>
      </div>
    </div>
  );
};