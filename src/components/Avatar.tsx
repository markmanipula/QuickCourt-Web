'use client';

export const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  blue:   { bg: 'bg-blue-500',   text: 'text-white' },
  red:    { bg: 'bg-red-500',    text: 'text-white' },
  green:  { bg: 'bg-green-500',  text: 'text-white' },
  purple: { bg: 'bg-purple-500', text: 'text-white' },
  orange: { bg: 'bg-orange-500', text: 'text-white' },
  pink:   { bg: 'bg-pink-500',   text: 'text-white' },
  indigo: { bg: 'bg-indigo-500', text: 'text-white' },
  teal:   { bg: 'bg-teal-500',   text: 'text-white' },
  amber:  { bg: 'bg-amber-500',  text: 'text-white' },
  cyan:   { bg: 'bg-cyan-500',   text: 'text-white' },
};

interface Props {
  name?: string | null;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };

export default function Avatar({ name, color = 'blue', size = 'md' }: Props) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const { bg, text } = AVATAR_COLORS[color] ?? AVATAR_COLORS.blue;
  return (
    <div className={`${SIZES[size]} ${bg} ${text} rounded-full flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}
