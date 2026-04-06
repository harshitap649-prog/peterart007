interface ArtistBadgeProps {
  artist?: any;
  className?: string;
}

export default function ArtistBadge({ artist, className = '' }: ArtistBadgeProps) {
  if (!artist) return null;
  
  return (
    <div className={`inline-flex items-center gap-1 text-xs text-gray-600 ${className}`}>
      <span>{artist.displayName || artist.name || 'Unknown Artist'}</span>
    </div>
  );
}
