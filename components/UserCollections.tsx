'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiLock, FiUnlock, FiImage } from 'react-icons/fi'

interface UserCollectionsProps {
  userId: string
  language?: 'en' | 'hi'
}

export default function UserCollections({ userId, language = 'en' }: UserCollectionsProps) {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCollection, setEditingCollection] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false
  })

  useEffect(() => {
    loadCollections()
  }, [userId])

  const loadCollections = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/collections?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Error loading collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error(language === 'hi' ? 'कृपया नाम दर्ज करें' : 'Please enter a name')
      return
    }

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        })
      })

      if (response.ok) {
        toast.success(language === 'hi' ? 'कलेक्शन बनाया गया' : 'Collection created')
        setShowCreateModal(false)
        setFormData({ name: '', description: '', isPublic: false })
        loadCollections()
      }
    } catch (error) {
      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप इस कलेक्शन को हटाना चाहते हैं?' : 'Are you sure you want to delete this collection?')) {
      return
    }

    try {
      const response = await fetch(`/api/collections?id=${id}&userId=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(language === 'hi' ? 'कलेक्शन हटाया गया' : 'Collection deleted')
        loadCollections()
      }
    } catch (error) {
      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {language === 'hi' ? 'मेरे कलेक्शन' : 'My Collections'}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus />
          <span>{language === 'hi' ? 'नया कलेक्शन' : 'New Collection'}</span>
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12">
          <FiImage className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'hi' ? 'अभी तक कोई कलेक्शन नहीं' : 'No collections yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {collections.map((collection: any) => (
            <div key={collection.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                <div className="flex gap-2">
                  {collection.isPublic ? (
                    <FiUnlock className="text-green-500" />
                  ) : (
                    <FiLock className="text-gray-400" />
                  )}
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              {collection.description && (
                <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
              )}
              <p className="text-xs text-gray-500">
                {collection.artworkIds?.length || 0} {language === 'hi' ? 'कलाकृतियां' : 'artworks'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {language === 'hi' ? 'नया कलेक्शन बनाएं' : 'Create New Collection'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === 'hi' ? 'नाम' : 'Name'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder={language === 'hi' ? 'कलेक्शन का नाम' : 'Collection name'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === 'hi' ? 'विवरण' : 'Description'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm">
                  {language === 'hi' ? 'सार्वजनिक कलेक्शन' : 'Public collection'}
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreate} className="btn-primary flex-1">
                  {language === 'hi' ? 'बनाएं' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', isPublic: false })
                  }}
                  className="btn-secondary flex-1"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

