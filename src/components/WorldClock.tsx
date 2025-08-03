import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Card, CardContent } from './ui/Card';
import { WORLD_CITIES } from '../lib/timezone';

export const WorldClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {WORLD_CITIES.map((city) => {
        const cityTime = utcToZonedTime(currentTime, city.timezone);
        const timeString = format(cityTime, 'h:mm a');
        const dateString = format(cityTime, 'MMM d');

        return (
          <Card key={city.name} className="text-center" hover>
            <CardContent className="py-6">
              <div className="text-3xl mb-2">{city.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{city.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{city.country}</p>
              <div className="font-mono text-xl font-bold text-blue-600 mb-1">
                {timeString}
              </div>
              <div className="text-sm text-gray-500">{dateString}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};