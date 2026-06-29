export const SPORT_EMOJIS: Record<string, string> = {
  volleyball: '🏐',
  'beach volleyball': '🏖️',
  basketball: '🏀',
  badminton: '🏸',
  gym: '💪',
  softball: '🥎',
  golf: '⛳',
  pickleball: '🏓',
  other: '🎯',
};

export function getSportEmoji(sport: string) {
  return SPORT_EMOJIS[sport?.toLowerCase()] ?? '🎯';
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
