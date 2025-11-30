'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getArtistById } from '@/lib/artists'
import { FiUser, FiCheckCircle } from 'react-icons/fi'

interface ArtistBadgeProps {
  artistId?: string | null
  className?: string
  showVerified?: boolean
  clickable?: boolean
}

export default function ArtistBadge({ artistId, className = '', showVerified = true, clickable = true }: ArtistBadgeProps) {
  const router = useRouter()
  const [artist, setArtist] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (artistId) {
      loadArtist()
    } else {
      setLoading(false)
    }
  }, [artistId])

  const loadArtist = async () => {
    if (!artistId) return
    try {
      const artistData = await getArtistById(artistId)
      setArtist(artistData)
    } catch (error) {
      console.error('Error loading artist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    if (clickable && artistId && artist?.status === 'approved') {
      router.push(`/artist/${artistId}`)
    }
  }

  if (!artistId || loading) {
    return null
  }

  if (!artist) {
    return null
  }

  // Only show badge if artist is approved
  if (artist.status !== 'approved') {
    return null
  }

  return (
    <div 
      className={`flex items-center gap-2 md:gap-3 ${className} ${clickable && artist.status === 'approved' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={handleClick}
    >
      {/* Artist Profile Image */}
      {artist.profileImage ? (
        <img
          src={artist.profileImage}
          alt={artist.artistName}
          className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-gray-200 object-cover shadow-sm flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
          }}
        />
      ) : (
        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-gray-200 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-sm flex-shrink-0">
          <FiUser className="text-sm md:text-xl text-orange-600" />
        </div>
      )}
      
      {/* Artist Name - Professional Layout */}
      <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">Artist</span>
          <div className="flex items-center gap-1 md:gap-1.5">
            <span className="text-sm md:text-lg font-bold text-gray-900 hover:text-orange-600 transition-colors truncate">
              {artist.artistName}
            </span>
            {showVerified && artist.verificationStatus === 'verified' && (
              <FiCheckCircle className="text-xs md:text-sm text-green-500 flex-shrink-0" title="Verified Artist" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

