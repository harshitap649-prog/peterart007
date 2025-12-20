'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerAsArtist, getArtistByUserId } from '@/lib/artists'
import { addArtwork } from '@/lib/artworks'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiFileText, FiLink, FiPercent, FiCreditCard, FiUpload, FiX, FiImage, FiCheckCircle, FiClock, FiMail as FiMailIcon } from 'react-icons/fi'

interface ArtistRegistrationProps {
  user: any
  onSuccess?: (artist: any) => void
  language?: 'en' | 'hi'
}

export default function ArtistRegistration({ user, onSuccess, language = 'en' }: ArtistRegistrationProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    artistName: '',
    bio: '',
    portfolio: [] as string[],
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    commissionRate: '89',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: ''
  })
  const [artworks, setArtworks] = useState<Array<{
    title: string
    description: string
    price: string
    category: string
    images: File[]
    imagePreviews: string[]
  }>>([
    { title: '', description: '', price: '', category: '', images: [], imagePreviews: [] },
    { title: '', description: '', price: '', category: '', images: [], imagePreviews: [] }
  ])
  const [submitting, setSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredArtist, setRegisteredArtist] = useState<any>(null)

  const translations = {
    en: {
      title: 'Become an Artist',
      subtitle: 'Join our marketplace and showcase your art',
      artistName: 'Artist Name / Studio Name *',
      bio: 'Bio / About You *',
      artworks: 'Upload 2 Artworks *',
      artworkTitle: 'Artwork Title',
      artworkDescription: 'Description',
      artworkPrice: 'Price (₹)',
      artworkCategory: 'Category',
      artworkImages: 'Images',
      addImages: 'Add Images',
      removeImage: 'Remove',
      atLeastOneImage: 'At least one image is required',
      exactlyThreeArtworks: 'Please upload exactly 2 artworks',
      portfolio: 'Portfolio Links (Optional)',
      socialLinks: 'Social Media Links',
      commission: 'Commission Rate',
      commissionNote: 'You will receive this percentage of each sale (default: 89%)',
      bankDetails: 'Bank Details (for payouts)',
      accountName: 'Account Holder Name *',
      accountNumber: 'Account Number *',
      ifscCode: 'IFSC Code *',
      bankName: 'Bank Name *',
      register: 'Register as Artist',
      success: 'Registration submitted! Waiting for admin approval.',
      error: 'Failed to register',
      required: 'This field is required'
    },
    hi: {
      title: 'कलाकार बनें',
      subtitle: 'हमारे मार्केटप्लेस में शामिल हों और अपनी कला प्रदर्शित करें',
      artistName: 'कलाकार का नाम / स्टूडियो का नाम *',
      bio: 'जीवनी / आपके बारे में *',
      artworks: '2 कलाकृतियां अपलोड करें *',
      artworkTitle: 'कलाकृति का शीर्षक',
      artworkDescription: 'विवरण',
      artworkPrice: 'मूल्य (₹)',
      artworkCategory: 'श्रेणी',
      artworkImages: 'छवियां',
      addImages: 'छवियां जोड़ें',
      removeImage: 'हटाएं',
      atLeastOneImage: 'कम से कम एक छवि आवश्यक है',
      exactlyThreeArtworks: 'कृपया बिल्कुल 2 कलाकृतियां अपलोड करें',
      portfolio: 'पोर्टफोलियो लिंक (वैकल्पिक)',
      socialLinks: 'सोशल मीडिया लिंक',
      commission: 'कमीशन दर',
      commissionNote: 'आपको प्रत्येक बिक्री का यह प्रतिशत मिलेगा (डिफ़ॉल्ट: 89%)',
      bankDetails: 'बैंक विवरण (भुगतान के लिए)',
      accountName: 'खाता धारक का नाम *',
      accountNumber: 'खाता संख्या *',
      ifscCode: 'IFSC कोड *',
      bankName: 'बैंक का नाम *',
      register: 'कलाकार के रूप में पंजीकरण करें',
      success: 'पंजीकरण सबमिट किया गया! व्यवस्थापक अनुमोदन की प्रतीक्षा कर रहे हैं।',
      error: 'पंजीकरण विफल',
      required: 'यह फ़ील्ड आवश्यक है'
    }
  }

  const t = translations[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.artistName.trim()) {
      toast.error(language === 'hi' ? 'कृपया कलाकार का नाम दर्ज करें' : 'Please enter artist name')
      return
    }
    
    if (!formData.bio.trim()) {
      toast.error(language === 'hi' ? 'कृपया जीवनी दर्ज करें' : 'Please enter bio')
      return
    }
    
    // Validate artworks
    const validArtworks = artworks.filter(aw => 
      aw.title.trim() && 
      aw.description.trim() && 
      aw.price.trim() && 
      parseFloat(aw.price) > 0 &&
      aw.images.length > 0
    )
    
    if (validArtworks.length !== 2) {
      toast.error(t.exactlyThreeArtworks)
      return
    }
    
    setSubmitting(true)
    
    try {
      // First, register as artist
      const artist = await registerAsArtist({
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        artistName: formData.artistName,
        bio: formData.bio,
        portfolio: formData.portfolio.filter(p => p.trim()),
        socialLinks: {
          website: formData.website,
          instagram: formData.instagram,
          facebook: formData.facebook,
          twitter: formData.twitter
        },
        commissionRate: parseFloat(formData.commissionRate) || 89,
        bankDetails: (formData.accountName && formData.accountNumber && formData.ifscCode && formData.bankName) ? {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName
        } : null
      })
      
      // Then, upload the 3 artworks
      for (const artwork of validArtworks) {
        try {
          await addArtwork({
            title: artwork.title.trim(),
            description: artwork.description.trim(),
            price: parseFloat(artwork.price),
            category: artwork.category.trim() || 'General',
            artistId: artist.id
          }, artwork.images)
        } catch (error: any) {
          console.error('Error uploading artwork:', error)
          toast.error(language === 'hi' ? `कलाकृति अपलोड करने में त्रुटि: ${artwork.title}` : `Error uploading artwork: ${artwork.title}`)
        }
      }
      
      setRegisteredArtist(artist)
      setRegistrationSuccess(true)
      onSuccess?.(artist)
      
      // Redirect to artist dashboard tab after 3 seconds
      setTimeout(() => {
        router.push('/user?tab=artist')
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || t.error)
    } finally {
      setSubmitting(false)
    }
  }

  const addPortfolioLink = () => {
    setFormData({ ...formData, portfolio: [...formData.portfolio, ''] })
  }

  const updatePortfolioLink = (index: number, value: string) => {
    const updated = [...formData.portfolio]
    updated[index] = value
    setFormData({ ...formData, portfolio: updated })
  }

  const removePortfolioLink = (index: number) => {
    const updated = formData.portfolio.filter((_, i) => i !== index)
    setFormData({ ...formData, portfolio: updated })
  }

  const handleArtworkChange = (index: number, field: string, value: any) => {
    const updated = [...artworks]
    updated[index] = { ...updated[index], [field]: value }
    setArtworks(updated)
  }

  const handleImageUpload = (artworkIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const updated = [...artworks]
    const newFiles = Array.from(files)
    const newPreviews: string[] = []
    
    newFiles.forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        updated[artworkIndex].images.push(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string)
          updated[artworkIndex].imagePreviews = [...updated[artworkIndex].imagePreviews, ...newPreviews]
          setArtworks([...updated])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (artworkIndex: number, imageIndex: number) => {
    const updated = [...artworks]
    updated[artworkIndex].images.splice(imageIndex, 1)
    updated[artworkIndex].imagePreviews.splice(imageIndex, 1)
    setArtworks(updated)
  }

  // Success Screen
  if (registrationSuccess) {
    return (
      <div className="card p-6 md:p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          {/* Success Icon with Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiCheckCircle className="text-white text-5xl md:text-6xl" />
              </div>
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {language === 'hi' ? 'पंजीकरण सफलतापूर्वक सबमिट किया गया!' : 'Registration Submitted Successfully!'}
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              {language === 'hi' 
                ? 'आपका कलाकार पंजीकरण सफलतापूर्वक सबमिट कर दिया गया है। हमारी टीम इसे जल्द ही समीक्षा करेगी।' 
                : 'Your artist registration has been successfully submitted. Our team will review it shortly.'}
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiClock className="text-yellow-600 text-2xl" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-lg">
                  {language === 'hi' ? 'लंबित अनुमोदन' : 'Pending Approval'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'hi' 
                    ? 'आपका पंजीकरण व्यवस्थापक समीक्षा के लिए लंबित है' 
                    : 'Your registration is pending admin review'}
                </p>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 text-left space-y-4">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <FiMailIcon className="text-gray-900" />
              {language === 'hi' ? 'आगे क्या होगा?' : 'What Happens Next?'}
            </h3>
            <ul className="space-y-3 text-gray-700 text-sm md:text-base">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 font-bold text-xs">1</span>
                </div>
                <span>
                  {language === 'hi' 
                    ? 'हमारी टीम आपके पंजीकरण और अपलोड की गई कलाकृतियों की समीक्षा करेगी' 
                    : 'Our team will review your registration and uploaded artworks'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 font-bold text-xs">2</span>
                </div>
                <span>
                  {language === 'hi' 
                    ? 'एक बार अनुमोदित होने के बाद, आपको ईमेल के माध्यम से सूचित किया जाएगा' 
                    : 'Once approved, you will be notified via email'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 font-bold text-xs">3</span>
                </div>
                <span>
                  {language === 'hi' 
                    ? 'आप अपने कलाकार डैशबोर्ड तक पहुंच सकेंगे और अपनी कलाकृतियां बेचना शुरू कर सकेंगे' 
                    : 'You will gain access to your artist dashboard and can start selling your artworks'}
                </span>
              </li>
            </ul>
          </div>

          {/* Artist Info Summary */}
          {registeredArtist && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6 space-y-2 text-left">
              <h4 className="font-semibold text-gray-900 text-sm">
                {language === 'hi' ? 'पंजीकरण विवरण' : 'Registration Details'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">{language === 'hi' ? 'कलाकार नाम:' : 'Artist Name:'}</span>
                  <span className="ml-2 font-medium text-gray-900">{registeredArtist.artistName}</span>
                </div>
                <div>
                  <span className="text-gray-600">{language === 'hi' ? 'ईमेल:' : 'Email:'}</span>
                  <span className="ml-2 font-medium text-gray-900">{registeredArtist.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">{language === 'hi' ? 'कमीशन दर:' : 'Commission Rate:'}</span>
                  <span className="ml-2 font-medium text-gray-900">{registeredArtist.commissionRate}%</span>
                </div>
                <div>
                  <span className="text-gray-600">{language === 'hi' ? 'स्थिति:' : 'Status:'}</span>
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    {language === 'hi' ? 'लंबित' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => router.push('/user')}
              className="btn-primary flex-1 py-3 text-base font-semibold"
            >
              {language === 'hi' ? 'डैशबोर्ड पर जाएं' : 'Go to Dashboard'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-secondary flex-1 py-3 text-base font-semibold"
            >
              {language === 'hi' ? 'होम पेज पर वापस जाएं' : 'Back to Home'}
            </button>
          </div>
          
          {/* Auto-redirect notice */}
          <p className="text-xs text-gray-500 pt-2 text-center">
            {language === 'hi' 
              ? '3 सेकंड में स्वचालित रूप से डैशबोर्ड पर रीडायरेक्ट किया जाएगा...' 
              : 'You will be automatically redirected to dashboard in 3 seconds...'}
          </p>

          {/* Help Text */}
          <p className="text-xs text-gray-500 pt-4">
            {language === 'hi' 
              ? 'किसी भी प्रश्न के लिए, कृपया हमारे सहायता पृष्ठ पर जाएं या हमसे संपर्क करें।' 
              : 'For any questions, please visit our help page or contact us.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 md:px-6 py-4 md:py-8">
      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-lg p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-orange-500 rounded-lg flex-shrink-0">
            <FiUser className="text-xl md:text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">{t.title}</h2>
            <p className="text-gray-600 text-xs md:text-sm">{t.subtitle}</p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Basic Info */}
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2">
              <FiUser className="text-sm md:text-base" />
              {t.artistName}
            </label>
            <input
              type="text"
              value={formData.artistName}
              onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
              required
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="Your artist name or studio name"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
              {t.bio}
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              placeholder="Tell us about yourself and your art..."
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1000</p>
          </div>
        </div>

        {/* Artworks Upload Section */}
        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2">
            <FiImage className="text-sm md:text-base" />
            {t.artworks}
          </label>
          <p className="text-xs text-gray-600 mb-3 md:mb-4">
            {language === 'hi' ? 'कृपया अपनी 2 सर्वश्रेष्ठ कलाकृतियां अपलोड करें' : 'Please upload your 2 best artworks'}
          </p>
          
          <div className="space-y-4 md:space-y-6">
            {artworks.map((artwork, index) => (
              <div key={index} className="border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 lg:p-6 bg-gray-50/50">
                <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-3 md:mb-4">
                  {language === 'hi' ? `कलाकृति ${index + 1}` : `Artwork ${index + 1}`}
                </h4>
                
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1 font-medium">{t.artworkTitle} *</label>
                    <input
                      type="text"
                      value={artwork.title}
                      onChange={(e) => handleArtworkChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                      placeholder={language === 'hi' ? 'कलाकृति का शीर्षक' : 'Artwork title'}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-700 mb-1 font-medium">{t.artworkDescription} *</label>
                    <textarea
                      value={artwork.description}
                      onChange={(e) => handleArtworkChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none bg-white"
                      placeholder={language === 'hi' ? 'कलाकृति का विवरण' : 'Describe your artwork'}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1 font-medium">{t.artworkPrice} *</label>
                      <input
                        type="number"
                        value={artwork.price}
                        onChange={(e) => handleArtworkChange(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                        placeholder="0"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1 font-medium">{t.artworkCategory}</label>
                      <input
                        type="text"
                        value={artwork.category}
                        onChange={(e) => handleArtworkChange(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                        placeholder={language === 'hi' ? 'श्रेणी' : 'Category (optional)'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-700 mb-2 font-medium">{t.artworkImages} *</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {artwork.imagePreviews.map((preview, imgIndex) => (
                        <div key={imgIndex} className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                          <img src={preview} alt={`Preview ${imgIndex + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index, imgIndex)}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 md:p-1 rounded-bl-lg hover:bg-red-600 transition-colors"
                          >
                            <FiX className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <FiUpload className="text-sm md:text-base" />
                      {t.addImages}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files)}
                        className="hidden"
                      />
                    </label>
                    {artwork.images.length === 0 && (
                      <p className="text-xs text-red-500 mt-1.5">{t.atLeastOneImage}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Links */}
        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">
            {t.portfolio}
          </label>
          <div className="space-y-2">
            {formData.portfolio.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updatePortfolioLink(index, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => removePortfolioLink(index)}
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPortfolioLink}
              className="text-xs md:text-sm py-2 px-3 md:px-4 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              + Add Portfolio Link
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
            <FiLink className="text-sm md:text-base" />
            {t.socialLinks}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Instagram</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                placeholder="@yourusername"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Facebook</label>
              <input
                type="url"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Twitter</label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                placeholder="@yourusername"
              />
            </div>
          </div>
        </div>

        {/* Commission Rate */}
        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2">
            <FiPercent className="text-sm md:text-base" />
            {t.commission}
          </label>
          <input
            type="number"
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
            min="50"
            max="90"
            className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
          />
          <p className="text-xs text-gray-500 mt-1.5">{t.commissionNote}</p>
        </div>

        {/* Bank Details - Optional */}
        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2">
            <FiCreditCard className="text-sm md:text-base" />
            {t.bankDetails} <span className="text-xs text-gray-500 font-normal">({language === 'hi' ? 'वैकल्पिक' : 'Optional'})</span>
          </label>
          <p className="text-xs text-gray-600 mb-3 md:mb-4">
            {language === 'hi' ? 'आप बाद में भुगतान विवरण जोड़ सकते हैं' : 'You can add payment details later'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">{t.accountName}</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                placeholder={language === 'hi' ? 'वैकल्पिक' : 'Optional'}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">{t.accountNumber}</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                placeholder={language === 'hi' ? 'वैकल्पिक' : 'Optional'}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">{t.ifscCode}</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                maxLength={11}
                placeholder={language === 'hi' ? 'वैकल्पिक' : 'Optional'}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">{t.bankName}</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                placeholder={language === 'hi' ? 'वैकल्पिक' : 'Optional'}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 md:py-3.5 text-sm md:text-base font-bold bg-black text-white rounded-lg md:rounded-xl hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {language === 'hi' ? 'सबमिट हो रहा है...' : 'Submitting...'}
              </span>
            ) : (
              t.register
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

