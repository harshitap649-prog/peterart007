'use client'

import { useState } from 'react'
import { createSupportMessage } from '@/lib/support'
import { getUserOrders } from '@/lib/orders'
import toast from 'react-hot-toast'
import { FiHelpCircle, FiSend, FiMessageSquare, FiChevronDown, FiChevronUp, FiPackage, FiCreditCard, FiTruck, FiShield, FiMail, FiImage, FiX } from 'react-icons/fi'
import { useLanguage } from '@/contexts/LanguageContext'

interface FAQ {
  question: string
  answer: string
  category: 'order' | 'payment' | 'shipping' | 'general'
}

export default function HelpSupport({ user, language: languageProp }: { user: any; language?: 'en' | 'hi' }) {
  const { language: contextLanguage } = useLanguage()
  const language = languageProp || contextLanguage
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
    orderId: ''
  })
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const translations = {
    en: {
      helpSupportCenter: 'Help & Support Center',
      wereHereToHelp: "We're here to help you!",
      orderHelp: 'Order Help',
      payment: 'Payment',
      shipping: 'Shipping',
      general: 'General',
      frequentlyAskedQuestions: 'Frequently Asked Questions',
      stillNeedHelp: 'Still Need Help?',
      cantFindWhat: "Can't find what you're looking for? Our support team is ready to assist you!",
      contactSupport: 'Contact Support',
      issueType: 'Issue Type',
      relatedOrder: 'Related Order (Optional)',
      selectOrder: 'Select an order',
      subject: 'Subject',
      message: 'Message',
      sendMessage: 'Send Message',
      sending: 'Sending...',
      cancel: 'Cancel',
      briefDescription: 'Brief description of your issue',
      provideDetails: 'Please provide detailed information about your issue or question. The more details you provide, the better we can assist you...',
      generalInquiry: 'General Inquiry',
      orderRelated: 'Order Related',
      paymentIssue: 'Payment Issue',
      shippingDelivery: 'Shipping & Delivery',
      websiteIssue: 'Website Issue',
      other: 'Other',
      messageSent: 'Your message has been sent! We will get back to you soon.',
      fillAllFields: 'Please fill in all required fields',
      failedToSend: 'Failed to send message',
      attachImage: 'Attach Image (Optional)',
      attachedImages: 'Attached Images',
      removeImage: 'Remove',
      maxImages: 'Maximum 5 images allowed',
      imageSizeLimit: 'Each image should be less than 5MB',
      addImage: 'Add Image',
      noImageSelected: 'No image selected',
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'Browse our collection, select an artwork you love, click "Buy Now", and complete the checkout process. You\'ll receive an order confirmation email once your order is placed.'
        },
        {
          question: 'Can I cancel my order?',
          answer: 'Yes, you can cancel your order within 1 hour of placement. Go to "My Orders" section, find your order, and click the "Cancel Order" button. After 1 hour, orders cannot be cancelled.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, debit cards, UPI, and net banking. All payments are processed securely through our payment gateway.'
        },
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping typically takes 5-7 business days. Express shipping (if available) takes 2-3 business days. You\'ll receive tracking information once your order ships.'
        },
        {
          question: 'What is your return policy?',
          answer: 'We offer a 7-day return policy for unused items in original packaging. Please contact our support team to initiate a return. Custom or personalized items may not be eligible for return.'
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order is shipped, you\'ll receive a tracking number via email. You can also check the status in your "My Orders" section. Orders typically show as "Order Confirmed" initially, then "Delivered" when completed.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Yes, absolutely! We use industry-standard encryption and secure payment gateways to protect your financial information. We never store your complete payment details on our servers.'
        },
        {
          question: 'What if I receive a damaged item?',
          answer: 'If you receive a damaged item, please contact us immediately with photos of the damage. We\'ll arrange a replacement or full refund at no extra cost to you.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Currently, we ship within India. International shipping may be available for select items. Please contact support for more information about international orders.'
        },
        {
          question: 'How do I add items to my wishlist?',
          answer: 'Simply click the heart icon on any artwork to add it to your wishlist. You can view all your saved items in the "Wishlist" tab. Click the heart again to remove items.'
        }
      ]
    },
    hi: {
      helpSupportCenter: 'सहायता और समर्थन केंद्र',
      wereHereToHelp: 'हम आपकी मदद के लिए यहाँ हैं!',
      orderHelp: 'ऑर्डर सहायता',
      payment: 'भुगतान',
      shipping: 'शिपिंग',
      general: 'सामान्य',
      frequentlyAskedQuestions: 'अक्सर पूछे जाने वाले प्रश्न',
      stillNeedHelp: 'अभी भी मदद चाहिए?',
      cantFindWhat: 'आपको जो चाहिए वह नहीं मिल रहा? हमारी सहायता टीम आपकी सहायता के लिए तैयार है!',
      contactSupport: 'सहायता से संपर्क करें',
      issueType: 'समस्या का प्रकार',
      relatedOrder: 'संबंधित ऑर्डर (वैकल्पिक)',
      selectOrder: 'एक ऑर्डर चुनें',
      subject: 'विषय',
      message: 'संदेश',
      sendMessage: 'संदेश भेजें',
      sending: 'भेजा जा रहा है...',
      cancel: 'रद्द करें',
      briefDescription: 'अपनी समस्या का संक्षिप्त विवरण',
      provideDetails: 'कृपया अपनी समस्या या प्रश्न के बारे में विस्तृत जानकारी प्रदान करें। जितनी अधिक जानकारी आप प्रदान करेंगे, उतना बेहतर हम आपकी सहायता कर सकेंगे...',
      generalInquiry: 'सामान्य पूछताछ',
      orderRelated: 'ऑर्डर संबंधित',
      paymentIssue: 'भुगतान समस्या',
      shippingDelivery: 'शिपिंग और डिलीवरी',
      websiteIssue: 'वेबसाइट समस्या',
      other: 'अन्य',
      messageSent: 'आपका संदेश भेज दिया गया है! हम जल्द ही आपसे संपर्क करेंगे।',
      fillAllFields: 'कृपया सभी आवश्यक फ़ील्ड भरें',
      failedToSend: 'संदेश भेजने में विफल',
      attachImage: 'छवि संलग्न करें (वैकल्पिक)',
      attachedImages: 'संलग्न छवियां',
      removeImage: 'हटाएं',
      maxImages: 'अधिकतम 5 छवियां अनुमत',
      imageSizeLimit: 'प्रत्येक छवि 5MB से कम होनी चाहिए',
      addImage: 'छवि जोड़ें',
      noImageSelected: 'कोई छवि चयनित नहीं',
      faqs: [
        {
          question: 'मैं ऑर्डर कैसे करूं?',
          answer: 'हमारे संग्रह को ब्राउज़ करें, एक कलाकृति चुनें जिसे आप पसंद करते हैं, "अभी खरीदें" पर क्लिक करें, और चेकआउट प्रक्रिया पूरी करें। आपका ऑर्डर लगाने के बाद आपको एक ऑर्डर पुष्टिकरण ईमेल प्राप्त होगा।'
        },
        {
          question: 'क्या मैं अपना ऑर्डर रद्द कर सकता हूं?',
          answer: 'हाँ, आप प्लेसमेंट के 1 घंटे के भीतर अपना ऑर्डर रद्द कर सकते हैं। "मेरे ऑर्डर" अनुभाग पर जाएं, अपना ऑर्डर खोजें, और "ऑर्डर रद्द करें" बटन पर क्लिक करें। 1 घंटे के बाद, ऑर्डर रद्द नहीं किए जा सकते।'
        },
        {
          question: 'आप कौन से भुगतान तरीके स्वीकार करते हैं?',
          answer: 'हम सभी प्रमुख क्रेडिट कार्ड, डेबिट कार्ड, UPI, और नेट बैंकिंग स्वीकार करते हैं। सभी भुगतान हमारे भुगतान गेटवे के माध्यम से सुरक्षित रूप से संसाधित किए जाते हैं।'
        },
        {
          question: 'शिपिंग में कितना समय लगता है?',
          answer: 'मानक शिपिंग में आमतौर पर 5-7 व्यावसायिक दिन लगते हैं। एक्सप्रेस शिपिंग (यदि उपलब्ध हो) में 2-3 व्यावसायिक दिन लगते हैं। आपका ऑर्डर शिप होने के बाद आपको ट्रैकिंग जानकारी प्राप्त होगी।'
        },
        {
          question: 'आपकी वापसी नीति क्या है?',
          answer: 'हम मूल पैकेजिंग में अप्रयुक्त वस्तुओं के लिए 7-दिवसीय वापसी नीति प्रदान करते हैं। कृपया वापसी शुरू करने के लिए हमारी सहायता टीम से संपर्क करें। कस्टम या व्यक्तिगत वस्तुएं वापसी के लिए पात्र नहीं हो सकती हैं।'
        },
        {
          question: 'मैं अपने ऑर्डर को कैसे ट्रैक करूं?',
          answer: 'एक बार आपका ऑर्डर शिप हो जाने के बाद, आपको ईमेल के माध्यम से एक ट्रैकिंग नंबर प्राप्त होगा। आप अपने "मेरे ऑर्डर" अनुभाग में स्थिति भी देख सकते हैं। ऑर्डर आमतौर पर शुरू में "ऑर्डर पुष्टि" के रूप में दिखाई देते हैं, फिर पूरा होने पर "डिलीवर" होते हैं।'
        },
        {
          question: 'क्या मेरी भुगतान जानकारी सुरक्षित है?',
          answer: 'हाँ, बिल्कुल! हम आपकी वित्तीय जानकारी की सुरक्षा के लिए उद्योग-मानक एन्क्रिप्शन और सुरक्षित भुगतान गेटवे का उपयोग करते हैं। हम कभी भी आपके पूर्ण भुगतान विवरण को अपने सर्वर पर संग्रहीत नहीं करते हैं।'
        },
        {
          question: 'अगर मुझे क्षतिग्रस्त आइटम मिले तो क्या होगा?',
          answer: 'यदि आपको क्षतिग्रस्त आइटम मिलता है, तो कृपया क्षति की तस्वीरों के साथ तुरंत हमसे संपर्क करें। हम आपको बिना किसी अतिरिक्त लागत के प्रतिस्थापन या पूर्ण धनवापसी की व्यवस्था करेंगे।'
        },
        {
          question: 'क्या आप अंतरराष्ट्रीय स्तर पर शिप करते हैं?',
          answer: 'वर्तमान में, हम भारत के भीतर शिप करते हैं। चयनित वस्तुओं के लिए अंतरराष्ट्रीय शिपिंग उपलब्ध हो सकती है। अंतरराष्ट्रीय ऑर्डर के बारे में अधिक जानकारी के लिए कृपया सहायता से संपर्क करें।'
        },
        {
          question: 'मैं अपनी इच्छा सूची में आइटम कैसे जोड़ूं?',
          answer: 'किसी भी कलाकृति पर हृदय आइकन पर क्लिक करके इसे अपनी इच्छा सूची में जोड़ें। आप "इच्छा सूची" टैब में अपने सभी सहेजे गए आइटम देख सकते हैं। आइटम हटाने के लिए फिर से हृदय पर क्लिक करें।'
        }
      ]
    }
  }

  const t = translations[language]

  const faqs: FAQ[] = t.faqs.map((faq: any) => ({
    question: faq.question,
    answer: faq.answer,
    category: 'general' as const
  }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: File[] = []
    const newPreviews: string[] = []

    // Check total images count
    if (images.length + files.length > 5) {
      toast.error(t.maxImages)
      return
    }

    const validFiles: File[] = []
    
    Array.from(files).forEach((file) => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: ${t.imageSizeLimit}`)
        return
      }

      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: Please select an image file`)
        return
      }

      validFiles.push(file)
    })

    // Read all valid files
    const previewPromises = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(previewPromises).then((previews) => {
      setImages([...images, ...validFiles])
      setImagePreviews([...imagePreviews, ...previews])
    })
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const convertImagesToBase64 = async (files: File[]): Promise<string[]> => {
    const base64Images: string[] = []
    for (const file of files) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      base64Images.push(base64)
    }
    return base64Images
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!formData.subject.trim() || !formData.message.trim()) {
        toast.error(t.fillAllFields)
        return
      }

      // Convert images to base64
      const imageBase64 = images.length > 0 ? await convertImagesToBase64(images) : []
      
      await createSupportMessage({
        userId: user?.uid || '',
        userEmail: user?.email || '',
        userName: user?.displayName || user?.email?.split('@')[0] || 'User',
        subject: formData.subject,
        message: formData.message,
        type: formData.type,
        orderId: formData.orderId || null,
        images: imageBase64
      })
      
      toast.success(t.messageSent)
      setFormData({ type: 'general', subject: '', message: '', orderId: '' })
      setImages([])
      setImagePreviews([])
      setShowForm(false)
    } catch (error: any) {
      toast.error(error.message || t.failedToSend)
    } finally {
      setLoading(false)
    }
  }

  const loadUserOrders = async () => {
    if (user && userOrders.length === 0) {
      try {
        const orders = await getUserOrders(user.uid)
        setUserOrders(orders)
      } catch (error) {
        console.error('Error loading orders:', error)
      }
    }
  }

  if (showForm) {
    loadUserOrders()
  }

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {/* Header Section with Gradient */}
      <div className="card p-4 md:p-6 bg-gradient-to-br from-orange-50 via-white to-purple-50 border-2 border-orange-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-purple-500 rounded-lg">
            <FiHelpCircle className="text-2xl md:text-3xl text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t.helpSupportCenter}</h2>
            <p className="text-xs md:text-sm text-gray-600">{t.wereHereToHelp}</p>
          </div>
        </div>
      </div>

      {!showForm ? (
        <>
          {/* Quick Help Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div 
              className="card p-3 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200" 
              onClick={() => {
                setFormData({ ...formData, type: 'order' })
                setShowForm(true)
              }}
            >
              <FiPackage className="text-2xl text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-900">{t.orderHelp}</p>
            </div>
            <div 
              className="card p-3 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border border-green-200" 
              onClick={() => {
                setFormData({ ...formData, type: 'payment' })
                setShowForm(true)
              }}
            >
              <FiCreditCard className="text-2xl text-green-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-900">{t.payment}</p>
            </div>
            <div 
              className="card p-3 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200" 
              onClick={() => {
                setFormData({ ...formData, type: 'shipping' })
                setShowForm(true)
              }}
            >
              <FiTruck className="text-2xl text-gray-900 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-900">{t.shipping}</p>
            </div>
            <div 
              className="card p-3 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200" 
              onClick={() => setShowForm(true)}
            >
              <FiShield className="text-2xl text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-900">{t.general}</p>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiMessageSquare className="text-xl text-gray-900" />
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{t.frequentlyAskedQuestions}</h3>
            </div>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-3 md:p-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm md:text-base font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {expandedFAQ === index ? (
                      <FiChevronUp className="text-gray-600 flex-shrink-0" />
                    ) : (
                      <FiChevronDown className="text-gray-600 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="p-3 md:p-4 pt-0 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support Section */}
          <div className="card p-4 md:p-6 bg-gradient-to-br from-orange-50 to-purple-50 border-2 border-orange-100">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-500 rounded-full mb-3">
                <FiMail className="text-2xl text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t.stillNeedHelp}</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4">
                {t.cantFindWhat}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2 mx-auto text-sm py-2.5 px-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <FiSend className="text-sm" />
                {t.contactSupport}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-purple-500 rounded-lg">
                <FiMessageSquare className="text-xl text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{t.contactSupport}</h3>
            </div>
            <button
              onClick={() => {
                setShowForm(false)
                setFormData({ type: 'general', subject: '', message: '', orderId: '' })
                setImages([])
                setImagePreviews([])
              }}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                {t.issueType} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field text-sm py-2.5 border-2 border-gray-200 focus:border-orange-500 transition-colors"
                required
              >
                <option value="general">{t.generalInquiry}</option>
                <option value="order">{t.orderRelated}</option>
                <option value="payment">{t.paymentIssue}</option>
                <option value="shipping">{t.shippingDelivery}</option>
                <option value="website">{t.websiteIssue}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>

            {formData.type === 'order' && userOrders.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  {t.relatedOrder}
                </label>
                <select
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="input-field text-sm py-2.5 border-2 border-gray-200 focus:border-orange-500 transition-colors"
                >
                  <option value="">{t.selectOrder}</option>
                  {userOrders.map((order: any) => (
                    <option key={order.id} value={order.id}>
                      Order #{order.id.slice(0, 8)} - {order.artworkTitle} - ₹{order.total}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                {t.subject} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-field text-sm py-2.5 border-2 border-gray-200 focus:border-orange-500 transition-colors"
                placeholder={t.briefDescription}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                {t.message} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field text-sm py-2.5 border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
                rows={6}
                placeholder={t.provideDetails}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                {t.attachImage}
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  <FiImage className="text-lg text-gray-900" />
                  <span className="text-sm text-gray-700 font-medium">{t.addImage}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={images.length >= 5}
                  />
                </label>
                {images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 font-medium">{t.attachedImages} ({images.length}/5)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-24 md:h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{t.maxImages}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-3 font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
              >
                <FiSend className="text-sm" />
                {loading ? t.sending : t.sendMessage}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ type: 'general', subject: '', message: '', orderId: '' })
                  setImages([])
                  setImagePreviews([])
                }}
                className="btn-secondary flex-1 text-sm py-3 font-semibold"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

