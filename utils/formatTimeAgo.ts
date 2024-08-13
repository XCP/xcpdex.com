import { formatDistanceToNow } from 'date-fns';

export function formatTimeAgo(timestamp: number): string {
  // Convert the timestamp to milliseconds and format the time ago string
  const timeAgo = formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });

  // Clean up the output by removing unnecessary words and simplifying the time units
  return timeAgo
    .replace('over ', '')
    .replace('about ', '')
    .replace('almost ', '')
    .replace('seconds ago', 'seconds')
    .replace('second ago', 'second')
    .replace('minutes ago', 'minutes')
    .replace('minute ago', 'minute')
    .replace('hours ago', 'hours')
    .replace('hour ago', 'hour');
}
