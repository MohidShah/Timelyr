import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Globe, Zap } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card, CardContent, CardHeader } from './ui/Card';
import { parseNaturalLanguage, getUserTimezone } from '../lib/timezone';
import { hasFeatureAccess } from '../lib/plans';

interface TimeInputProps {
  onTimeSelect: (date: Date, timezone: string, title: string, description?: string) => void;
  userPlan?: 'starter' | 'pro';
  initialData?: {
    title: string;
    description?: string;
    date: Date;
    timezone: string;
  };
  loading?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  onTimeSelect,
  userPlan = 'starter',
  initialData,
  loading = false
}) => {
  const [inputMode, setInputMode] = useState<'natural' | 'manual'>('natural');
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
  const [parsedTime, setParsedTime] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timezones = [
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

  useEffect(() => {
    if (inputMode === 'natural' && naturalInput) {
      const parsed = parseNaturalLanguage(naturalInput);
      setParsedTime(parsed);
    }
  }, [naturalInput, inputMode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (description && description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (inputMode === 'natural') {
      if (!naturalInput.trim()) {
        newErrors.naturalInput = 'Please enter a time';
      } else if (!parsedTime) {
        newErrors.naturalInput = 'Could not understand the time format. Try "Tomorrow 2 PM" or "Next Monday 9 AM"';
      }
    } else {
      if (!selectedDate) {
        newErrors.date = 'Date is required';
      }
      if (!selectedTime) {
        newErrors.time = 'Time is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    let finalDate: Date;
    
    if (inputMode === 'natural' && parsedTime) {
      finalDate = parsedTime;
    } else {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      finalDate = new Date(selectedDate);
      finalDate.setHours(hours, minutes, 0, 0);
    }

    // Validate that the date is not in the past
    if (finalDate < new Date()) {
      setErrors({ date: 'Cannot schedule events in the past' });
      return;
    }

    onTimeSelect(finalDate, selectedTimezone, title, description);
  };

  const quickTimeOptions = [
    { label: 'Tomorrow 9 AM', value: 'tomorrow 9 am' },
    { label: 'Tomorrow 2 PM', value: 'tomorrow 2 pm' },
    { label: 'Next Monday 10 AM', value: 'next monday 10 am' },
    { label: 'Next Friday 3 PM', value: 'next friday 3 pm' },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Schedule Your Meeting
        </h2>
        <p className="text-gray-600">
          Create a timezone link that works for everyone, everywhere.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            label="Meeting Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Weekly team standup"
            error={errors.title}
            required
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the meeting..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Input Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setInputMode('natural')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                inputMode === 'natural'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Zap className="w-4 h-4 mr-2 inline" />
              Natural Language
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                inputMode === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Date & Time
            </button>
          </div>

          {/* Natural Language Input */}
          {inputMode === 'natural' && (
            <div className="space-y-4">
              <Input
                label="When is your meeting?"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                placeholder="Tomorrow 2 PM PST, Next Monday 9 AM, etc."
                error={errors.naturalInput}
              />
              
              {/* Quick Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Options
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {quickTimeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNaturalInput(option.value)}
                      className="p-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parsed Time Preview */}
              {parsedTime && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">Parsed Time:</h4>
                  <p className="text-blue-700">
                    {format(parsedTime, 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Date/Time Input */}
          {inputMode === 'manual' && (
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                error={errors.date}
                required
              />
              <Input
                label="Time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                error={errors.time}
                required
              />
            </div>
          )}

          {/* Timezone Selection */}
          <Select
            label="Timezone"
            value={selectedTimezone}
            onChange={setSelectedTimezone}
            options={timezones}
          />

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            loading={loading}
          >
            <Clock className="w-4 h-4 mr-2" />
            Create Timezone Link
          </Button>

          {/* Pro Features Hint */}
          {userPlan === 'starter' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                💡 <strong>Pro tip:</strong> Upgrade to Pro for custom URLs, advanced analytics, 
                and business hours intelligence.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};