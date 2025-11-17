'use client'

import { useState, useEffect } from 'react'
import { getUserFollowing } from '@/lib/follows'
import { getAllArtworks } from '@/lib/artworks'
import { getArtistById } from '@/lib/artists'
import toast from 'react-hot-toast'
import { FiImage, FiUser, FiCalendar } from 'react-icons/fi'
import ArtistBadge from './ArtistBadge'

interface ArtistFeedProps {
  userId: string
  language?: 'en' | 'hi'
}

export default function ArtistFeed({ userId, language = 'en' }: ArtistFeedProps) {
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeed()
  }, [userId])

  const loadFeed = async () => {
    setLoading(true)
    try {
      // Get artists user follows
      const following = await getUserFollowing(userId)
      const artistIds = following.map((f: any) => f.artistId)
      
      if (artistIds.length === 0) {
        setArtworks([])
        setLoading(false)
        return
      }

      // Get all artworks
      const allArtworks = await getAllArtworks()
      
      // Filter artworks by followed artists, sorted by date (newest first)
      const feedArtworks = allArtworks
        .filter((artwork: any) => artistIds.includes(artwork.artistId))
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })
        .slice(0, 20) // Limit to 20 most recent

      setArtworks(feedArtworks)
    } catch (error) {
      console.error('Error loading feed:', error)
      toast.error(language === 'hi' ? 'फीड लोड करने में त्रुटि' : 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading feed...'}</p>
      </div>
    )
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <FiUser className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {language === 'hi' ? 'कोई नई कलाकृतियां नहीं' : 'No new artworks'}
        </h3>
        <p className="text-gray-600">
          {language === 'hi' 
            ? 'अपने पसंदीदा कलाकारों को फॉलो करना शुरू करें' 
            : 'Start following your favorite artists to see their latest works'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {language === 'hi' ? 'आपके फॉलो किए गए कलाकारों की कलाकृतियां' : 'Artworks from Artists You Follow'}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {artworks.map((artwork: any) => (
          <div key={artwork.id} className="card p-3 hover:shadow-lg transition-shadow">
            {artwork.images && artwork.images[0] ? (
              <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden">
                <img
                  src={artwork.images[0]}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-32 mb-2 rounded-lg bg-gray-200 flex items-center justify-center">
                <FiImage className="text-gray-400 text-2xl" />
              </div>
            )}
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{artwork.title}</h3>
            {artwork.artistId && (
              <div className="mb-1">
                <ArtistBadge artistId={artwork.artistId} className="text-xs" />
              </div>
            )}
            <p className="text-gray-900 font-bold text-sm">₹{artwork.price}</p>
            {artwork.createdAt && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <FiCalendar className="text-xs" />
                {new Date(artwork.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

