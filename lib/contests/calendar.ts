/**
 * Utilities for generating calendar URLs (Google Calendar, Outlook, iCal)
 */

export interface CalendarContestDetails {
  title: string;
  description: string;
  url: string;
  startTime: Date;
  endTime: Date;
  platform: string;
}

function formatUtcForCalendar(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

/**
 * Generates a one-click Google Calendar creation URL
 */
export function generateGoogleCalendarUrl(details: CalendarContestDetails): string {
  const start = formatUtcForCalendar(details.startTime);
  const end = formatUtcForCalendar(details.endTime);
  const text = encodeURIComponent(details.title);
  const detailsParam = encodeURIComponent(
    `${details.description}\n\nContest Link: ${details.url}\nPlatform: ${details.platform.toUpperCase()}\n\nTracked via BigO Platform`
  );
  const location = encodeURIComponent(details.url);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${detailsParam}&location=${location}`;
}

/**
 * Generates an Outlook.com / Office 365 calendar URL
 */
export function generateOutlookCalendarUrl(details: CalendarContestDetails): string {
  const start = details.startTime.toISOString();
  const end = details.endTime.toISOString();
  const subject = encodeURIComponent(details.title);
  const body = encodeURIComponent(
    `${details.description}\n\nContest Link: ${details.url}\nPlatform: ${details.platform.toUpperCase()}`
  );
  const location = encodeURIComponent(details.url);

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&startdt=${start}&enddt=${end}&location=${location}`;
}

/**
 * Generates an iCalendar (.ics) string for direct download
 */
export function generateIcsContent(details: CalendarContestDetails): string {
  const start = formatUtcForCalendar(details.startTime);
  const end = formatUtcForCalendar(details.endTime);
  const stamp = formatUtcForCalendar(new Date());
  const uid = `contest-${details.platform}-${details.startTime.getTime()}@bigoprep.tech`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BigO//Contest Alert System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${details.title.replace(/[,;]/g, ' ')}`,
    `DESCRIPTION:${details.description.replace(/\n/g, '\\n')} - ${details.url}`,
    `URL:${details.url}`,
    `LOCATION:${details.url}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
