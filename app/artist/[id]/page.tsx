'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getArtistById } from '@/lib/artists'
import { getArtistArtworks } from '@/lib/artists'
import { getArtistFollowers } from '@/lib/follows'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiUser, FiLink, FiImage, FiInstagram, FiFacebook, FiTwitter, FiGlobe, FiCheckCircle, FiShoppingCart, FiMessageCircle, FiUsers } from 'react-icons/fi'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading artist profile...</p>
        </div>
      </div>
    )
  }

  if (!artist) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Professional Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all hover:bg-gray-100 px-3 py-2 rounded-lg font-medium group"
          >
            <FiArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </div>

      {/* Professional Artist Profile Header */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Premium Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            {/* Profile Image - Enhanced */}
            <div className="relative flex-shrink-0 mx-auto md:mx-0">
              {artist.profileImage ? (
                <div className="relative">
                  <img
                    src={artist.profileImage}
                    alt={artist.artistName}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white object-cover shadow-xl ring-4 ring-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  {artist.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-2 border-4 border-white shadow-lg">
                      <FiCheckCircle className="text-white text-lg" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl ring-4 ring-gray-100">
                    <FiUser className="text-5xl md:text-6xl text-white" />
                  </div>
                  {artist.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-2 border-4 border-white shadow-lg">
                      <FiCheckCircle className="text-white text-lg" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Artist Info - Professional Layout */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              {/* Name */}
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{artist.artistName}</h1>
              </div>
              
              {/* Premium Stats Cards */}
              <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl px-4 py-3 border border-blue-200/50 shadow-sm">
                  <p className="text-2xl font-bold text-blue-700">{artworks.length}</p>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Artworks</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl px-4 py-3 border border-purple-200/50 shadow-sm">
                  <p className="text-2xl font-bold text-purple-700">{followersCount}</p>
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Followers</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl px-4 py-3 border border-gray-200/50 shadow-sm">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Joined</p>
                  <p className="text-sm font-bold text-gray-700">
                    {new Date(artist.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Bio - Enhanced */}
              {artist.bio && (
                <div className="mb-5">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-200/50">
                    {artist.bio}
                  </p>
                </div>
              )}

              {/* Premium Action Buttons */}
              {user && user.uid !== artist.userId && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <FollowButton
                    userId={user.uid}
                    artistId={artist.id}
                    language="en"
                  />
                  <button
                    onClick={() => router.push(`/chat/${artist.userId}`)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <FiMessageCircle className="text-lg" />
                    <span>Message</span>
                  </button>
                </div>
              )}

              {/* Social Links - Enhanced */}
              {(artist.socialLinks?.website || artist.socialLinks?.instagram || artist.socialLinks?.facebook || artist.socialLinks?.twitter) && (
                <div className="flex items-center justify-center md:justify-start gap-3">
                  {artist.socialLinks.website && (
                    <a
                      href={artist.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all shadow-sm hover:shadow-md"
                      title="Website"
                    >
                      <FiGlobe className="text-lg" />
                    </a>
                  )}
                  {artist.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${artist.socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center justify-center text-white transition-all shadow-sm hover:shadow-md"
                      title="Instagram"
                    >
                      <FiInstagram className="text-lg" />
                    </a>
                  )}
                  {artist.socialLinks.facebook && (
                    <a
                      href={artist.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all shadow-sm hover:shadow-md"
                      title="Facebook"
                    >
                      <FiFacebook className="text-lg" />
                    </a>
                  )}
                  {artist.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${artist.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-600 flex items-center justify-center text-white transition-all shadow-sm hover:shadow-md"
                      title="Twitter"
                    >
                      <FiTwitter className="text-lg" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Links - Enhanced */}
        {artist.portfolio && artist.portfolio.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200/50 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Portfolio Links</h3>
            <div className="flex flex-wrap gap-2">
              {artist.portfolio.map((link: string, idx: number) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-800 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-blue-200/50"
                >
                  <FiLink className="text-base" />
                  Portfolio {idx + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Professional Artworks Section */}
        {artworks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FiImage className="text-5xl text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold text-lg mb-2">No artworks available yet</p>
            <p className="text-gray-500 text-sm">Check back soon for new creations!</p>
          </div>
        ) : (
          <>
            {/* Premium Section Header */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200/50 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <FiImage className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Artworks</h2>
                    <p className="text-xs text-gray-500 font-medium">{artworks.length} {artworks.length === 1 ? 'piece' : 'pieces'} available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Artworks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {artworks.map((artwork: any) => (
                <div
                  key={artwork.id}
                  className="group relative aspect-square bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200/50 hover:border-blue-300"
                  onClick={() => router.push(`/artwork/${artwork.id}`)}
                >
                  {artwork.images && artwork.images[0] ? (
                    <>
                      <img
                        src={artwork.images[0]}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
                        }}
                      />
                      {/* Premium Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                        <p className="text-white font-bold text-sm mb-1 line-clamp-1 drop-shadow-lg">{artwork.title}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-orange-400 font-bold text-base drop-shadow-lg">₹{artwork.price}</p>
                          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <FiShoppingCart className="text-white text-sm" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <FiImage className="text-3xl text-gray-400" />
                    </div>
                  )}
                  
                  {/* Corner Badge */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-bold text-gray-900">View</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

