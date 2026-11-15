import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getAdherenceColor(rate: number): string {
  if (rate >= 90) return 'text-green-600';
  if (rate >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export function getAdherenceBg(rate: number): string {
  if (rate >= 90) return 'bg-green-100 border-green-200';
  if (rate >= 70) return 'bg-yellow-100 border-yellow-200';
  return 'bg-red-100 border-red-200';
}

export function frequencyLabel(freq: string): string {
  const map: Record<string, string> = {
    daily: 'Once daily',
    twice_daily: 'Twice daily',
    three_times: 'Three times daily',
    weekly: 'Weekly',
    as_needed: 'As needed',
    custom: 'Custom schedule',
  };
  return map[freq] || freq;
}
