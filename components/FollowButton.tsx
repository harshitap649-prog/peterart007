'use client'

import { useState, useEffect } from 'react'
import { isFollowingArtist, followArtist, unfollowArtist } from '@/lib/follows'
import toast from 'react-hot-toast'
import { FiUserPlus, FiUserCheck } from 'react-icons/fi'

interface FollowButtonProps {
  userId: string | null
  artistId: string
  className?: string
  language?: 'en' | 'hi'
}

export default function FollowButton({ userId, artistId, className = '', language = 'en' }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (userId) {
      checkFollowStatus()
    } else {
      setLoading(false)
    }
  }, [userId, artistId])

  const checkFollowStatus = async () => {
    if (!userId) return
    try {
      const following = await isFollowingArtist(userId, artistId)
      setIsFollowing(following)
    } catch (error) {
      console.error('Error checking follow status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!userId) {
      toast.error(language === 'hi' ? 'कृपया साइन इन करें' : 'Please sign in to follow artists')
      return
    }

    setUpdating(true)
    try {
      if (isFollowing) {
        await unfollowArtist(userId, artistId)
        setIsFollowing(false)
        toast.success(language === 'hi' ? 'अनफॉलो किया गया' : 'Unfollowed')
      } else {
        await followArtist(userId, artistId)
        setIsFollowing(true)
        toast.success(language === 'hi' ? 'फॉलो किया गया' : 'Following')
      }
    } catch (error: any) {
      toast.error(error.message || (language === 'hi' ? 'त्रुटि हुई' : 'An error occurred'))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <button className={`btn-secondary ${className}`} disabled>
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </button>
    )
  }

  return (
    <button
      onClick={handleFollow}
      disabled={updating || !userId}
      className={`${isFollowing ? 'btn-secondary' : 'btn-primary'} ${className} flex items-center gap-2`}
    >
      {isFollowing ? (
        <>
          <FiUserCheck className="text-base" />
          <span>{language === 'hi' ? 'फॉलो किया गया' : 'Following'}</span>
        </>
      ) : (
        <>
          <FiUserPlus className="text-base" />
          <span>{language === 'hi' ? 'फॉलो करें' : 'Follow'}</span>
        </>
      )}
    </button>
  )
}

