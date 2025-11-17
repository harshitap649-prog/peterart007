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
      className={`flex items-center gap-3 ${className} ${clickable && artist.status === 'approved' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={handleClick}
    >
      {/* Artist Profile Image */}
      {artist.profileImage ? (
        <img
          src={artist.profileImage}
          alt={artist.artistName}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-200 object-cover shadow-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
          }}
        />
      ) : (
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center shadow-sm">
          <FiUser className="text-lg md:text-xl text-gray-400" />
        </div>
      )}
      
      {/* Artist Name - Highlighted */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Artist</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base md:text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors">
              {artist.artistName}
            </span>
            {showVerified && artist.verificationStatus === 'verified' && (
              <FiCheckCircle className="text-sm text-green-500" title="Verified Artist" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

