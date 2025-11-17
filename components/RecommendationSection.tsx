'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiTrendingUp, FiHeart, FiArrowRight, FiEye, FiMessageCircle } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { 
  getPersonalizedRecommendations, 
  getTrendingArtworks, 
  getBecauseYouLiked,
  getSimilarArtworks
} from '@/lib/recommendations-client'
import { getUserWishlist, isInWishlist } from '@/lib/wishlist'
import ArtistBadge from './ArtistBadge'
import toast from 'react-hot-toast'

interface RecommendationSectionProps {
  userId?: string
  type: 'personalized' | 'trending' | 'becauseYouLiked' | 'similar'
  artworkId?: string
  title?: string
  subtitle?: string
  limit?: number
  language?: 'en' | 'hi'
}

export default function RecommendationSection({
  userId,
  type,
  artworkId,
  title,
  subtitle,
  limit = 10,
  language = 'en'
}: RecommendationSectionProps) {
  const router = useRouter()
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])

  const translations = {
    en: {
      personalized: 'For You',
      personalizedSubtitle: 'Artworks curated just for you',
      trending: 'Trending This Week',
      trendingSubtitle: 'Most popular artworks right now',
      becauseYouLiked: 'Because You Liked',
      becauseYouLikedSubtitle: 'Similar artworks you might enjoy',
      viewAll: 'View All',
      buy: 'Buy',
      loading: 'Loading recommendations...',
      noResults: 'No recommendations available'
    },
    hi: {
      personalized: 'आपके लिए',
      personalizedSubtitle: 'आपके लिए विशेष रूप से चुने गए कलाकृतियां',
      trending: 'इस सप्ताह ट्रेंडिंग',
      trendingSubtitle: 'अभी सबसे लोकप्रिय कलाकृतियां',
      becauseYouLiked: 'क्योंकि आपको पसंद आया',
      becauseYouLikedSubtitle: 'समान कलाकृतियां जो आपको पसंद आ सकती हैं',
      viewAll: 'सभी देखें',
      buy: 'खरीदें',
      loading: 'सुझाव लोड हो रहे हैं...',
      noResults: 'कोई सुझाव उपलब्ध नहीं'
    }
  }

  const t = translations[language]

  useEffect(() => {
    loadRecommendations()
    if (userId) {
      loadWishlist()
    }
  }, [userId, type, limit, artworkId])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      let recommendations: any[] = []
      
      switch (type) {
        case 'personalized':
          if (userId) {
            recommendations = await getPersonalizedRecommendations(userId, limit)
          } else {
            recommendations = await getTrendingArtworks(limit)
          }
          break
        case 'trending':
          recommendations = await getTrendingArtworks(limit)
          break
        case 'becauseYouLiked':
          if (userId) {
            recommendations = await getBecauseYouLiked(userId, limit)
          }
          break
        case 'similar':
          if (artworkId) {
            recommendations = await getSimilarArtworks(artworkId, limit)
          }
          break
      }
      
      setArtworks(recommendations)
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWishlist = async () => {
    if (!userId) return
    try {
      const wish = await getUserWishlist(userId)
      setWishlist(wish)
    } catch (error) {
      console.error('Error loading wishlist:', error)
    }
  }

  const handleToggleWishlist = async (artworkId: string) => {
    if (!userId) {
      toast.error(language === 'hi' ? 'कृपया लॉगिन करें' : 'Please login first')
      return
    }

    try {
      const isInWish = await isInWishlist(userId, artworkId)
      if (isInWish) {
        const { removeFromWishlist } = await import('@/lib/wishlist')
        await removeFromWishlist(userId, artworkId)
        setWishlist(wishlist.filter(id => id !== artworkId))
        toast.success(language === 'hi' ? 'विशलिस्ट से हटाया गया' : 'Removed from wishlist')
      } else {
        const { addToWishlist } = await import('@/lib/wishlist')
        await addToWishlist(userId, artworkId)
        setWishlist([...wishlist, artworkId])
        toast.success(language === 'hi' ? 'विशलिस्ट में जोड़ा गया' : 'Added to wishlist')
      }
    } catch (error) {
      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'An error occurred')
    }
  }

  const getDisplayTitle = () => {
    if (title) return title
    switch (type) {
      case 'personalized':
        return t.personalized
      case 'trending':
        return t.trending
      case 'becauseYouLiked':
        return t.becauseYouLiked
      default:
        return t.personalized
    }
  }

  const getDisplaySubtitle = () => {
    if (subtitle) return subtitle
    switch (type) {
      case 'personalized':
        return t.personalizedSubtitle
      case 'trending':
        return t.trendingSubtitle
      case 'becauseYouLiked':
        return t.becauseYouLikedSubtitle
      default:
        return t.personalizedSubtitle
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (artworks.length === 0) {
    return null // Don't show section if no recommendations
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {type === 'trending' && <FiTrendingUp className="text-2xl text-orange-600" />}
            {type === 'personalized' && <FiHeart className="text-2xl text-orange-600" />}
            {type === 'becauseYouLiked' && <FiArrowRight className="text-2xl text-orange-600" />}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{getDisplayTitle()}</h2>
          </div>
          <p className="text-gray-600 text-sm md:text-base">{getDisplaySubtitle()}</p>
        </div>
      </div>

      {/* Artworks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            className="card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => router.push(`/artwork/${artwork.id}`)}
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={artwork.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3EImage%3C/text%3E%3C/svg%3E'}
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3EImage%3C/text%3E%3C/svg%3E'
                }}
              />
              <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleWishlist(artwork.id)
                  }}
                  className="text-orange-600 hover:text-orange-700 transition-colors"
                  aria-label="Add to wishlist"
                >
                  {wishlist.includes(artwork.id) ? <FaHeart className="text-lg" /> : <FiHeart className="text-lg" />}
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{artwork.title}</h3>
              {artwork.artistId && (
                <div className="mb-2">
                  <ArtistBadge artistId={artwork.artistId} />
                </div>
              )}
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{artwork.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-orange-600 font-bold text-xl">₹{artwork.price}</span>
                <div className="flex items-center text-gray-500 text-xs">
                  <FiEye className="mr-1" /> {artwork.views || 0}
                  <FiMessageCircle className="ml-3 mr-1" /> {artwork.comments?.length || 0}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/artwork/${artwork.id}`)
                }}
                className="btn-primary w-full py-2.5 text-sm"
              >
                {t.buy}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

