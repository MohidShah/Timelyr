import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader } from './ui/Card';
import { parseNaturalLanguage, getUserTimezone } from '../lib/timezone';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { Clock, Calendar, Globe } from 'lucide-react';

interface TimeInputProps {
  onTimeSelect: (date: Date, timezone: string, title: string) => void;
}

export const TimeInput: React.FC<TimeInputProps> = ({ onTimeSelect }) => {
  const [mode, setMode] = useState<'natural' | 'guided'>('natural');
  const [naturalInput, setNaturalInput] = useState('');
  const [title, setTitle] = useState('');
  const [parsedTime, setParsedTime] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [selectedTimezone, setSelectedTimezone] = useState(getUserTimezone());

  useEffect(() => {
    if (naturalInput) {
      const parsed = parseNaturalLanguage(naturalInput);
      setParsedTime(parsed);
    } else {
      setParsedTime(null);
    }
  }, [naturalInput]);

  const handleNaturalSubmit = () => {
    if (parsedTime && title) {
      onTimeSelect(parsedTime, getUserTimezone(), title);
    }
  };

  const handleGuidedSubmit = () => {
    if (selectedDate && selectedTime && title) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const date = new Date(selectedDate);
      const finalDate = setHours(setMinutes(date, minutes), hours);
      onTimeSelect(finalDate, selectedTimezone, title);
    }
  };

  const quickPresets = [
    { label: 'Tomorrow 9 AM', action: () => setNaturalInput('Tomorrow 9 AM') },
    { label: 'Tomorrow 2 PM', action: () => setNaturalInput('Tomorrow 2 PM') },
    { label: 'Next Monday 10 AM', action: () => setNaturalInput('Next Monday 10 AM') },
    { label: 'Next Friday 3 PM', action: () => setNaturalInput('Next Friday 3 PM') },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('natural')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === 'natural'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Natural Language
          </button>
          <button
            onClick={() => setMode('guided')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === 'guided'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Guided Selection
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Input
          label="Event Title"
          placeholder="Team meeting, Coffee chat, etc."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {mode === 'natural' ? (
          <div className="space-y-4">
            <Input
              label="When is this happening?"
              placeholder="Tomorrow 2 PM PST, Next Monday 9am, Jan 15 at 2pm Pacific"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              helper="Try: 'Tomorrow 2 PM', 'Next Monday 9am', or 'Jan 15 at 2pm'"
            />

            {parsedTime && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✓ Parsed: {format(parsedTime, 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {quickPresets.map((preset, index) => (
                <Button
                  key={index}
                  variant="tertiary"
                  size="sm"
                  onClick={preset.action}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleNaturalSubmit}
              disabled={!parsedTime || !title}
              className="w-full"
              size="lg"
            >
              Create Timezone Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Input
                label="Time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="w-4 h-4 inline mr-1" />
                Timezone
              </label>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <optgroup label="Common Timezones">
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Paris">Paris (CET/CEST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Beijing (CST)</option>
                  <option value="Asia/Karachi">Islamabad (PKT)</option>
                  <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                </optgroup>
              </select>
            </div>

            <Button
              onClick={handleGuidedSubmit}
              disabled={!selectedDate || !selectedTime || !title}
              className="w-full"
              size="lg"
            >
              Create Timezone Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};