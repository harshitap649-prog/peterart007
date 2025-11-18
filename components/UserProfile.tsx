'use client'

import { useState, useEffect, useRef } from 'react'
import { FiUser, FiEdit2, FiCamera, FiMapPin, FiPlus, FiTrash2, FiCheck, FiX, FiDownload, FiSettings, FiMail, FiPhone, FiSave, FiLock, FiBell, FiShield } from 'react-icons/fi'
import { getUserProfile, updateUserProfile, uploadProfilePicture, getSavedAddresses, addSavedAddress, updateSavedAddress, deleteSavedAddress, setDefaultAddress } from '@/lib/profile'
import { exportOrdersToPDF } from '@/lib/pdfExport'
import { getUserOrders } from '@/lib/orders'
import toast from 'react-hot-toast'

interface UserProfileProps {
  user: any
  onProfileUpdate?: (user: any) => void
  language?: 'en' | 'hi'
}

export default function UserProfile({ user, onProfileUpdate, language = 'en' }: UserProfileProps) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'settings'>('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  })

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    isDefault: false
  })

  const translations = {
    en: {
      myProfile: 'My Profile',
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      profilePicture: 'Profile Picture',
      changePicture: 'Change Picture',
      personalInformation: 'Personal Information',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      bio: 'Bio',
      savedAddresses: 'Saved Addresses',
      addAddress: 'Add Address',
      defaultAddress: 'Default Address',
      setAsDefault: 'Set as Default',
      edit: 'Edit',
      delete: 'Delete',
      noAddresses: 'No saved addresses yet',
      addNewAddress: 'Add New Address',
      accountSettings: 'Account Settings',
      orderHistory: 'Order History',
      exportPDF: 'Export Order History (PDF)',
      exporting: 'Exporting...',
      notifications: 'Notifications',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      privacy: 'Privacy',
      changePassword: 'Change Password',
      deleteAccount: 'Delete Account',
      profileUpdated: 'Profile updated successfully',
      pictureUploaded: 'Profile picture uploaded successfully',
      addressAdded: 'Address added successfully',
      addressUpdated: 'Address updated successfully',
      addressDeleted: 'Address deleted successfully',
      defaultSet: 'Default address set successfully',
      exportSuccess: 'Order history exported successfully'
    },
    hi: {
      myProfile: 'मेरी प्रोफ़ाइल',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      saveChanges: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें',
      profilePicture: 'प्रोफ़ाइल चित्र',
      changePicture: 'चित्र बदलें',
      personalInformation: 'व्यक्तिगत जानकारी',
      fullName: 'पूरा नाम',
      email: 'ईमेल',
      phone: 'फ़ोन नंबर',
      bio: 'जीवनी',
      savedAddresses: 'सहेजे गए पते',
      addAddress: 'पता जोड़ें',
      defaultAddress: 'डिफ़ॉल्ट पता',
      setAsDefault: 'डिफ़ॉल्ट के रूप में सेट करें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      noAddresses: 'अभी तक कोई सहेजा गया पता नहीं',
      addNewAddress: 'नया पता जोड़ें',
      accountSettings: 'खाता सेटिंग्स',
      orderHistory: 'ऑर्डर इतिहास',
      exportPDF: 'ऑर्डर इतिहास निर्यात करें (PDF)',
      exporting: 'निर्यात हो रहा है...',
      notifications: 'सूचनाएं',
      emailNotifications: 'ईमेल सूचनाएं',
      smsNotifications: 'एसएमएस सूचनाएं',
      privacy: 'गोपनीयता',
      changePassword: 'पासवर्ड बदलें',
      deleteAccount: 'खाता हटाएं',
      profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई',
      pictureUploaded: 'प्रोफ़ाइल चित्र सफलतापूर्वक अपलोड किया गया',
      addressAdded: 'पता सफलतापूर्वक जोड़ा गया',
      addressUpdated: 'पता सफलतापूर्वक अपडेट किया गया',
      addressDeleted: 'पता सफलतापूर्वक हटा दिया गया',
      defaultSet: 'डिफ़ॉल्ट पता सफलतापूर्वक सेट किया गया',
      exportSuccess: 'ऑर्डर इतिहास सफलतापूर्वक निर्यात किया गया'
    }
  }

  const t = translations[language]

  useEffect(() => {
    if (user && user.uid) {
      loadProfile()
      loadAddresses()
      loadOrders()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const profileData = await getUserProfile(user.uid)
      if (profileData) {
        setProfile(profileData)
        setProfileData({
          name: profileData.name || user.displayName || '',
          email: profileData.email || user.email || '',
          phone: profileData.phone || '',
          bio: profileData.bio || ''
        })
      } else {
        // Initialize with user data
        setProfileData({
          name: user.displayName || user.email?.split('@')[0] || '',
          email: user.email || '',
          phone: '',
          bio: ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadAddresses = async () => {
    try {
      const addrs = await getSavedAddresses(user.uid)
      setAddresses(addrs)
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const ords = await getUserOrders(user.uid)
      setOrders(ords)
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingPhoto(true)
    try {
      const photoURL = await uploadProfilePicture(user.uid, file)
      setProfile({ ...profile, photoURL })
      if (onProfileUpdate) {
        onProfileUpdate({ ...user, photoURL })
      }
      toast.success(t.pictureUploaded)
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload picture')
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(user.uid, {
        name: profileData.name,
        phone: profileData.phone,
        bio: profileData.bio
      })
      setProfile({ ...profile, ...profileData })
      setEditing(false)
      toast.success(t.profileUpdated)
      if (onProfileUpdate) {
        onProfileUpdate({ ...user, displayName: profileData.name })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    }
  }

  const handleSaveAddress = async () => {
    try {
      if (!addressForm.fullName || !addressForm.phone || !addressForm.address1 || !addressForm.pincode || !addressForm.city) {
        toast.error('Please fill in all required fields')
        return
      }

      if (editingAddress) {
        await updateSavedAddress(user.uid, editingAddress.id, addressForm)
        toast.success(t.addressUpdated)
      } else {
        await addSavedAddress(user.uid, addressForm)
        toast.success(t.addressAdded)
      }

      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        fullName: '',
        phone: '',
        email: '',
        address1: '',
        address2: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India',
        isDefault: false
      })
      loadAddresses()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save address')
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      await deleteSavedAddress(user.uid, addressId)
      toast.success(t.addressDeleted)
      loadAddresses()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete address')
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(user.uid, addressId)
      toast.success(t.defaultSet)
      loadAddresses()
    } catch (error: any) {
      toast.error(error.message || 'Failed to set default address')
    }
  }

  const handleExportPDF = async () => {
    try {
      await exportOrdersToPDF(orders, {
        name: profileData.name || user.displayName || 'User',
        email: profileData.email || user.email || ''
      })
      toast.success(t.exportSuccess)
    } catch (error: any) {
      toast.error(error.message || 'Failed to export PDF')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="card p-4 md:p-6 bg-gradient-to-br from-orange-50 via-white to-purple-50 border-2 border-orange-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-purple-500 rounded-lg">
            <FiUser className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t.myProfile}</h2>
            <p className="text-xs md:text-sm text-gray-600">Manage your profile and account settings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-b-2 border-orange-600 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiUser className="inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'border-b-2 border-orange-600 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiMapPin className="inline mr-2" />
          Addresses
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-b-2 border-orange-600 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiSettings className="inline mr-2" />
          Settings
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-orange-200 bg-gray-100">
                {profile?.photoURL || user.photoURL ? (
                  <img
                    src={profile?.photoURL || user.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-purple-400">
                    <FiUser className="text-4xl md:text-5xl text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors shadow-lg"
              >
                {uploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiCamera className="text-sm md:text-base" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-2">{t.profilePicture}</p>
          </div>

          {/* Personal Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiUser className="text-gray-900" />
                {t.personalInformation}
              </h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
                >
                  <FiEdit2 className="text-sm" />
                  {t.editProfile}
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-field text-sm md:text-base py-2.5"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-1">
                    <FiMail className="text-xs" />
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="input-field text-sm md:text-base py-2.5 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-1">
                    <FiPhone className="text-xs" />
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-field text-sm md:text-base py-2.5"
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t.bio}
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="input-field text-sm md:text-base py-2.5 resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm md:text-base py-2.5"
                  >
                    <FiSave className="text-sm" />
                    {t.saveChanges}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      loadProfile()
                    }}
                    className="btn-secondary flex-1 text-sm md:text-base py-2.5"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">{t.fullName}</p>
                  <p className="font-semibold text-gray-900">{profileData.name || 'Not set'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">{t.email}</p>
                  <p className="font-semibold text-gray-900">{profileData.email || 'Not set'}</p>
                </div>
                {profileData.phone && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">{t.phone}</p>
                    <p className="font-semibold text-gray-900">{profileData.phone}</p>
                  </div>
                )}
                {profileData.bio && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">{t.bio}</p>
                    <p className="text-sm text-gray-900">{profileData.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiMapPin className="text-gray-900" />
              {t.savedAddresses}
            </h3>
            <button
              onClick={() => {
                setEditingAddress(null)
                setAddressForm({
                  fullName: '',
                  phone: '',
                  email: profileData.email || user.email || '',
                  address1: '',
                  address2: '',
                  pincode: '',
                  city: '',
                  state: '',
                  country: 'India',
                  isDefault: addresses.length === 0
                })
                setShowAddressForm(true)
              }}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <FiPlus className="text-sm" />
              {t.addAddress}
            </button>
          </div>

          {addresses.length === 0 && !showAddressForm ? (
            <div className="card p-8 md:p-12 text-center">
              <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t.noAddresses}</p>
              <button
                onClick={() => {
                  setAddressForm({
                    fullName: '',
                    phone: '',
                    email: profileData.email || user.email || '',
                    address1: '',
                    address2: '',
                    pincode: '',
                    city: '',
                    state: '',
                    country: 'India',
                    isDefault: true
                  })
                  setShowAddressForm(true)
                }}
                className="btn-primary text-sm py-2.5 px-6"
              >
                {t.addNewAddress}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`card p-4 md:p-5 ${
                    address.isDefault
                      ? 'border-2 border-orange-500 bg-orange-50'
                      : 'border border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {address.isDefault && (
                        <span className="inline-block px-2 py-1 bg-orange-600 text-white text-xs font-semibold rounded-full mb-2">
                          {t.defaultAddress}
                        </span>
                      )}
                      <p className="font-bold text-gray-900 text-sm md:text-base mb-1">
                        {address.fullName}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {address.address1}
                        {address.address2 && `, ${address.address2}`}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">{address.country}</p>
                      {address.phone && (
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          <FiPhone className="inline mr-1" />
                          {address.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="text-xs text-gray-900 hover:text-orange-700 font-medium"
                        >
                          {t.setAsDefault}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingAddress(address)
                          setAddressForm({ ...address })
                          setShowAddressForm(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <FiEdit2 className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {showAddressForm && (
                <div className="card p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {editingAddress ? 'Edit Address' : t.addNewAddress}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">
                        {t.fullName} *
                      </label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="input-field text-sm py-2"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">
                          {t.phone} *
                        </label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="input-field text-sm py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">
                          {t.email}
                        </label>
                        <input
                          type="email"
                          value={addressForm.email}
                          onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                          className="input-field text-sm py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={addressForm.address1}
                        onChange={(e) => setAddressForm({ ...addressForm, address1: e.target.value })}
                        className="input-field text-sm py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={addressForm.address2}
                        onChange={(e) => setAddressForm({ ...addressForm, address2: e.target.value })}
                        className="input-field text-sm py-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className="input-field text-sm py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">
                          City *
                        </label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="input-field text-sm py-2"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="input-field text-sm py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">
                          Country
                        </label>
                        <input
                          type="text"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          className="input-field text-sm py-2"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
                        {t.setAsDefault}
                      </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveAddress}
                        className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
                      >
                        <FiCheck className="text-sm" />
                        {editingAddress ? 'Update Address' : t.addAddress}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddressForm(false)
                          setEditingAddress(null)
                          setAddressForm({
                            fullName: '',
                            phone: '',
                            email: profileData.email || user.email || '',
                            address1: '',
                            address2: '',
                            pincode: '',
                            city: '',
                            state: '',
                            country: 'India',
                            isDefault: false
                          })
                        }}
                        className="btn-secondary text-sm py-2.5 px-4"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Order History Export */}
          <div className="card p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiDownload className="text-gray-900" />
              {t.orderHistory}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Export your complete order history as a PDF document.
            </p>
            <button
              onClick={handleExportPDF}
              className="btn-primary text-sm md:text-base py-2.5 px-6 flex items-center gap-2"
            >
              <FiDownload className="text-sm" />
              {t.exportPDF}
            </button>
          </div>

          {/* Notifications */}
          <div className="card p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiBell className="text-gray-900" />
              {t.notifications}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiMail className="text-gray-900" />
                  <span className="text-sm font-medium text-gray-700">{t.emailNotifications}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-900" />
                  <span className="text-sm font-medium text-gray-700">{t.smsNotifications}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="card p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiShield className="text-gray-900" />
              {t.privacy}
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiLock className="text-gray-900" />
                  <span className="text-sm font-medium text-gray-700">{t.changePassword}</span>
                </div>
                <FiX className="text-gray-400 text-xs">Coming Soon</FiX>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

