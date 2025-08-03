import { format, parseISO, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { parse, format as formatDate, isValid, addDays, setHours, setMinutes } from 'date-fns';

// Major cities with their timezones and icons
export const WORLD_CITIES = [
  { name: 'New York', timezone: 'America/New_York', icon: '🌉', country: 'USA' },
  { name: 'London', timezone: 'Europe/London', icon: '🏰', country: 'UK' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', icon: '🗾', country: 'Japan' },
  { name: 'Sydney', timezone: 'Australia/Sydney', icon: '🏛️', country: 'Australia' },
  { name: 'Islamabad', timezone: 'Asia/Karachi', icon: '🕌', country: 'Pakistan' },
  { name: 'Moscow', timezone: 'Europe/Moscow', icon: '🏛️', country: 'Russia' },
  { name: 'Berlin', timezone: 'Europe/Berlin', icon: '🏛️', country: 'Germany' },
  { name: 'Beijing', timezone: 'Asia/Shanghai', icon: '🏯', country: 'China' },
];

// Business hours detection (9 AM - 5 PM)
export const isBusinessHours = (time: Date, timezone: string): boolean => {
  const localTime = utcToZonedTime(time, timezone);
  const hour = localTime.getHours();
  return hour >= 9 && hour < 17;
};

export const getBusinessHoursStatus = (scheduledTime: Date) => {
  const majorRegions = [
    { name: 'US East Coast', timezone: 'America/New_York' },
    { name: 'US West Coast', timezone: 'America/Los_Angeles' },
    { name: 'Europe', timezone: 'Europe/London' },
    { name: 'Asia Pacific', timezone: 'Asia/Tokyo' },
  ];

  return majorRegions.map(region => ({
    ...region,
    isBusinessHours: isBusinessHours(scheduledTime, region.timezone),
    localTime: formatInTimezone(scheduledTime, region.timezone),
  }));
};

export const formatInTimezone = (date: Date, timezone: string): string => {
  return format(utcToZonedTime(date, timezone), 'MMM d, yyyy \'at\' h:mm a zzz', { timeZone: timezone });
};

export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const parseNaturalLanguage = (input: string): Date | null => {
  const now = new Date();
  const cleanInput = input.toLowerCase().trim();

  // Handle "tomorrow" cases
  if (cleanInput.includes('tomorrow')) {
    const tomorrow = addDays(now, 1);
    const timeMatch = cleanInput.match(/(\d{1,2})\s*(am|pm|:\d{2})/);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      if (timeMatch[2] === 'pm' && hour !== 12) hour += 12;
      if (timeMatch[2] === 'am' && hour === 12) hour = 0;
      return setHours(setMinutes(tomorrow, 0), hour);
    }
    return setHours(setMinutes(tomorrow, 0), 9); // Default to 9 AM
  }

  // Handle "next [day]" cases
  const dayMatch = cleanInput.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (dayMatch) {
    const targetDay = dayMatch[1];
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = days.indexOf(targetDay);
    const currentDayIndex = now.getDay();
    const daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7 || 7;
    const targetDate = addDays(now, daysUntilTarget);
    
    const timeMatch = cleanInput.match(/(\d{1,2})\s*(am|pm)/);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      if (timeMatch[2] === 'pm' && hour !== 12) hour += 12;
      if (timeMatch[2] === 'am' && hour === 12) hour = 0;
      return setHours(setMinutes(targetDate, 0), hour);
    }
    return setHours(setMinutes(targetDate, 0), 9);
  }

  // Handle time formats like "2 PM", "2:30 PM"
  const timeOnlyMatch = cleanInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (timeOnlyMatch) {
    let hour = parseInt(timeOnlyMatch[1]);
    const minute = parseInt(timeOnlyMatch[2] || '0');
    if (timeOnlyMatch[3] === 'pm' && hour !== 12) hour += 12;
    if (timeOnlyMatch[3] === 'am' && hour === 12) hour = 0;
    return setHours(setMinutes(now, minute), hour);
  }

  return null;
};

export const generateSlug = (title: string, date: Date): string => {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  
  const dateSlug = formatDate(date, 'MMM-d').toLowerCase();
  return `${titleSlug}-${dateSlug}`;
};