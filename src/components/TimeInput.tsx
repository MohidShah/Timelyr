import React from 'react';
import { useState } from 'react';
import { Calendar, Clock, Globe, Plus, Loader2 } from 'lucide-react';
import { format, addDays, setHours, setMinutes, parseISO } from 'date-fns';
import { parseNaturalLanguage, getUserTimezone } from '../lib/timezone';
import { validateLinkCreation } from '../lib/validation';
import { hasFeatureAccess } from '../lib/plans';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Card, CardContent, CardHeader } from './ui/Card';
import { useToast } from './ui/Toast';

interface TimeInputProps {
  onTimeSelect: (date: Date, timezone: string, title: string, description?: string) => void;
  initialData?: {
    title: string;
    description: string;
    date: Date;
    timezone: string;
  };
  userPlan?: 'starter' | 'pro';
  loading?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  onTimeSelect,
  initialData,
  userPlan = 'starter',
  loading = false
}) => {
  const [inputMethod, setInputMethod] = useState<'natural' | 'manual'>('natural');
  const [naturalInput, setNaturalInput] = useState('');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedDate, setSelectedDate] = useState(
    initialData?.date ? format(initialData.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedTime, setSelectedTime] = useState(
    initialData?.date ? format(initialData.date, 'HH:mm') : '14:00'
  );
  const [selectedTimezone, setSelectedTimezone] = useState(
    initialData?.timezone || getUserTimezone()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [parsedTime, setParsedTime] = useState<Date | null>(null);
  const { addToast } = useToast();

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Beijing (CST)' },
    { value: 'Asia/Karachi', label: 'Karachi (PKT)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  ];

  const handleNaturalInputChange = (value: string) => {
    setNaturalInput(value);
    const parsed = parseNaturalLanguage(value);
    setParsedTime(parsed);
    
    if (parsed && !title) {
      // Auto-suggest title based on input
      const suggestions = [
        'Team Meeting',
        'Project Review',
        'Weekly Standup',
        'Client Call',
        'Planning Session'
      ];
      setTitle(suggestions[Math.floor(Math.random() * suggestions.length)]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let finalDate: Date;

    if (inputMethod === 'natural' && parsedTime) {
      finalDate = parsedTime;
    } else {
      // Combine manual date and time
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      if (isNaN(dateTime.getTime())) {
        setErrors({ time: 'Invalid date or time' });
        return;
      }
      finalDate = dateTime;
    }

    // Validate the form
    const validation = validateLinkCreation({
      title,
      description,
      scheduledTime: finalDate
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onTimeSelect(finalDate, selectedTimezone, title, description);
  };

  const hasCustomSlugs = hasFeatureAccess(userPlan, 'hasCustomSlugs');

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Create Timezone Link
        </h2>
        <p className="text-gray-600">
          Share a time that automatically converts to everyone's local timezone
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Method Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setInputMethod('natural')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                inputMethod === 'natural'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Natural Language
            </button>
            <button
              type="button"
              onClick={() => setInputMethod('manual')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                inputMethod === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Date & Time
            </button>
          </div>

          {/* Natural Language Input */}
          {inputMethod === 'natural' && (
            <div className="space-y-4">
              <Input
                label="When is your meeting?"
                value={naturalInput}
                onChange={(e) => handleNaturalInputChange(e.target.value)}
                placeholder="Tomorrow 2 PM, Next Monday 9 AM, Jan 15 at 3:30 PM..."
                error={errors.time}
              />
              {parsedTime && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Parsed as: {format(parsedTime, 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Date/Time Input */}
          {inputMethod === 'manual' && (
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                error={errors.date}
              />
              <Input
                label="Time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                error={errors.time}
              />
            </div>
          )}

          {/* Timezone Selection */}
          <Select
            label="Timezone"
            value={selectedTimezone}
            onChange={setSelectedTimezone}
            options={timezoneOptions}
            error={errors.timezone}
          />

          {/* Meeting Details */}
          <div className="space-y-4">
            <Input
              label="Meeting Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly Team Standup"
              error={errors.title}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add meeting agenda, dial-in details, or other information..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Pro Features Preview */}
          {!hasCustomSlugs && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-amber-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Upgrade to Pro for custom URLs
                  </p>
                  <p className="text-xs text-amber-600">
                    Create memorable links like timelyr.com/my-weekly-meeting
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            loading={loading}
            disabled={loading || (!parsedTime && inputMethod === 'natural') || !title}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Link...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Timezone Link
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

    </div>
  );
};