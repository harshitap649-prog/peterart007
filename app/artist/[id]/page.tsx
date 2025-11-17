'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getArtistById } from '@/lib/artists'
import { getArtistArtworks } from '@/lib/artists'
import { getArtistFollowers } from '@/lib/follows'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiUser, FiLink, FiImage, FiInstagram, FiFacebook, FiTwitter, FiGlobe, FiCheckCircle, FiShoppingCart, FiMessageCircle, FiUsers } from 'react-icons/fi'
import ArtistBadge from '@/components/ArtistBadge'
import FollowButton from '@/components/FollowButton'

export default function ArtistProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [artist, setArtist] = useState<any>(null)
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [followersCount, setFollowersCount] = useState(0)

  useEffect(() => {
    loadArtistData()
    loadUser()
  }, [params.id])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadArtistData = async () => {
    setLoading(true)
    try {
      const artistData = await getArtistById(params.id as string)
      if (!artistData) {
        toast.error('Artist not found')
        router.push('/user')
        return
      }

      // Only show approved artists to public
      if (artistData.status !== 'approved') {
        toast.error('Artist profile not available')
        router.push('/user')
        return
      }

      setArtist(artistData)

      // Load artist artworks
      const artworksData = await getArtistArtworks(artistData.id)
      setArtworks(artworksData)

      // Load followers count
      const followers = await getArtistFollowers(artistData.id)
      setFollowersCount(followers.length)
    } catch (error: any) {
      console.error('Error loading artist:', error)
      toast.error('Failed to load artist profile')
      router.push('/user')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading artist profile...</p>
        </div>
      </div>
    )
  }

  if (!artist) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            <span className="text-sm md:text-base">Back</span>
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Profile Image */}
            <div className="relative">
              {artist.profileImage ? (
                <img
                  src={artist.profileImage}
                  alt={artist.artistName}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
                  }}
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <FiUser className="text-4xl md:text-5xl text-gray-500" />
                </div>
              )}
              {artist.verificationStatus === 'verified' && (
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white">
                  <FiCheckCircle className="text-white text-sm md:text-base" />
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 text-gray-900">{artist.artistName}</h1>
              {artist.bio && (
                <p className="text-gray-600 text-sm md:text-base mb-3 line-clamp-2">
                  {artist.bio}
                </p>
              )}
              
              {/* Action Buttons */}
              {user && user.uid !== artist.userId && (
                <div className="flex flex-wrap gap-3 mb-3">
                  <FollowButton
                    userId={user.uid}
                    artistId={artist.id}
                    language="en"
                  />
                  <button
                    onClick={() => router.push(`/chat/${artist.userId}`)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiMessageCircle />
                    <span>Message</span>
                  </button>
                </div>
              )}
              
              {/* Social Links */}
              {(artist.socialLinks?.website || artist.socialLinks?.instagram || artist.socialLinks?.facebook || artist.socialLinks?.twitter) && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {artist.socialLinks.website && (
                    <a
                      href={artist.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-gray-100 border border-gray-200 rounded-full p-2 transition-colors"
                      title="Website"
                    >
                      <FiGlobe className="text-lg text-gray-700" />
                    </a>
                  )}
                  {artist.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${artist.socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-gray-100 border border-gray-200 rounded-full p-2 transition-colors"
                      title="Instagram"
                    >
                      <FiInstagram className="text-lg text-gray-700" />
                    </a>
                  )}
                  {artist.socialLinks.facebook && (
                    <a
                      href={artist.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-gray-100 border border-gray-200 rounded-full p-2 transition-colors"
                      title="Facebook"
                    >
                      <FiFacebook className="text-lg text-gray-700" />
                    </a>
                  )}
                  {artist.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${artist.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-gray-100 border border-gray-200 rounded-full p-2 transition-colors"
                      title="Twitter"
                    >
                      <FiTwitter className="text-lg text-gray-700" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-4 text-center">
            <FiImage className="text-2xl text-gray-700 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{artworks.length}</p>
            <p className="text-xs text-gray-600">Artworks</p>
          </div>
          <div className="card p-4 text-center">
            <FiUsers className="text-2xl text-gray-700 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{followersCount}</p>
            <p className="text-xs text-gray-600">Followers</p>
          </div>
          <div className="card p-4 text-center">
            <FiUser className="text-2xl text-gray-700 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Joined</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(artist.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Bio Section */}
        {artist.bio && (
          <div className="card p-4 md:p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About the Artist</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{artist.bio}</p>
          </div>
        )}

        {/* Portfolio Links */}
        {artist.portfolio && artist.portfolio.length > 0 && (
          <div className="card p-4 md:p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Portfolio</h2>
            <div className="flex flex-wrap gap-2">
              {artist.portfolio.map((link: string, idx: number) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                >
                  <FiLink className="text-sm" />
                  Portfolio {idx + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Artworks Section */}
        <div className="card p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Artworks by {artist.artistName}
          </h2>

          {artworks.length === 0 ? (
            <div className="text-center py-12">
              <FiImage className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No artworks available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {artworks.map((artwork: any) => (
                <div
                  key={artwork.id}
                  className="card p-2 md:p-3 hover:shadow-lg transition-shadow"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/artwork/${artwork.id}`)}
                  >
                    {artwork.images && artwork.images[0] ? (
                      <div className="relative w-full h-32 md:h-40 mb-2 rounded-lg overflow-hidden">
                        <img
                          src={artwork.images[0]}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 md:h-40 mb-2 rounded-lg bg-gray-200 flex items-center justify-center">
                        <FiImage className="text-2xl text-gray-400" />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{artwork.title}</h3>
                    <p className="text-gray-900 font-bold text-base mb-2">₹{artwork.price}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/artwork/${artwork.id}`)
                    }}
                    className="btn-primary w-full text-xs md:text-sm py-2 flex items-center justify-center gap-2 font-semibold"
                  >
                    <FiShoppingCart className="text-sm" />
                    Buy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

