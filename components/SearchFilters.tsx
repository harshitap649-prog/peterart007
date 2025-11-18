'use client'

import { useState, useEffect, useMemo } from 'react'
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch, FiSliders } from 'react-icons/fi'

interface SearchFiltersProps {
  artworks: any[]
  onFilterChange: (filtered: any[]) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  language?: 'en' | 'hi'
  filteredCount?: number
}

export default function SearchFilters({ 
  artworks, 
  onFilterChange, 
  searchTerm, 
  onSearchChange,
  language = 'en',
  filteredCount
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const translations = {
    en: {
      searchPlaceholder: 'Search artworks...',
      filters: 'Filters',
      clearFilters: 'Clear All',
      priceRange: 'Price Range',
      categories: 'Categories',
      sortBy: 'Sort By',
      newest: 'Newest First',
      oldest: 'Oldest First',
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low',
      popularity: 'Most Popular',
      rating: 'Highest Rated',
      applyFilters: 'Apply Filters',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      noResults: 'No results found',
      showingResults: 'Showing',
      of: 'of',
      results: 'results',
      result: 'result'
    },
    hi: {
      searchPlaceholder: 'कलाकृतियां खोजें...',
      filters: 'फ़िल्टर',
      clearFilters: 'सभी साफ़ करें',
      priceRange: 'मूल्य सीमा',
      categories: 'श्रेणियां',
      sortBy: 'क्रमबद्ध करें',
      newest: 'नवीनतम पहले',
      oldest: 'सबसे पुराना पहले',
      priceLowToHigh: 'मूल्य: कम से अधिक',
      priceHighToLow: 'मूल्य: अधिक से कम',
      popularity: 'सबसे लोकप्रिय',
      rating: 'उच्चतम रेटेड',
      applyFilters: 'फ़िल्टर लागू करें',
      minPrice: 'न्यूनतम मूल्य',
      maxPrice: 'अधिकतम मूल्य',
      noResults: 'कोई परिणाम नहीं मिला',
      showingResults: 'दिखा रहे हैं',
      of: 'का',
      results: 'परिणाम',
      result: 'परिणाम'
    }
  }

  const t = translations[language]

  // Get unique categories from artworks
  const categories = useMemo(() => {
    const cats = new Set<string>()
    artworks.forEach((artwork) => {
      if (artwork.category && artwork.category.trim()) {
        cats.add(artwork.category.trim())
      }
    })
    return Array.from(cats).sort()
  }, [artworks])

  // Calculate price range from artworks
  const priceBounds = useMemo(() => {
    if (artworks.length === 0) return [0, 100000]
    const prices = artworks.map((a) => a.price || 0).filter((p) => p > 0)
    if (prices.length === 0) return [0, 100000]
    const min = Math.floor(Math.min(...prices))
    const max = Math.ceil(Math.max(...prices))
    return [min, max]
  }, [artworks])

  // Initialize price range
  useEffect(() => {
    if (priceBounds[0] !== priceRange[0] || priceBounds[1] !== priceRange[1]) {
      setPriceRange([priceBounds[0], priceBounds[1]])
    }
  }, [priceBounds])

  // Calculate average rating for an artwork
  const getAverageRating = (artwork: any): number => {
    if (!artwork.comments || artwork.comments.length === 0) return 0
    const ratings = artwork.comments
      .map((c: any) => c.rating)
      .filter((r: any) => r && r > 0)
    if (ratings.length === 0) return 0
    return ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
  }

  // Generate search suggestions
  useEffect(() => {
    if (searchTerm.length > 0) {
      const searchLower = searchTerm.toLowerCase()
      const suggestionsSet = new Set<string>()
      
      artworks.forEach((artwork) => {
        // Title suggestions
        if (artwork.title?.toLowerCase().includes(searchLower)) {
          const words = artwork.title.split(' ')
          words.forEach((word: string) => {
            if (word.toLowerCase().startsWith(searchLower) && word.length > searchTerm.length) {
              suggestionsSet.add(word)
            }
          })
        }
        
        // Category suggestions
        if (artwork.category?.toLowerCase().includes(searchLower)) {
          suggestionsSet.add(artwork.category)
        }
        
        // Description keywords
        if (artwork.description?.toLowerCase().includes(searchLower)) {
          const descWords = artwork.description.split(/\s+/)
          descWords.forEach((word: string) => {
            if (word.toLowerCase().startsWith(searchLower) && word.length > searchTerm.length && word.length > 2) {
              suggestionsSet.add(word)
            }
          })
        }
      })
      
      setSuggestions(Array.from(suggestionsSet).slice(0, 5))
      setShowSuggestions(suggestionsSet.size > 0)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }, [searchTerm, artworks])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...artworks]

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (artwork) =>
          artwork.title?.toLowerCase().includes(term) ||
          artwork.description?.toLowerCase().includes(term) ||
          artwork.category?.toLowerCase().includes(term)
      )
    }

    // Price range filter
    filtered = filtered.filter(
      (artwork) =>
        (artwork.price || 0) >= priceRange[0] && (artwork.price || 0) <= priceRange[1]
    )

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((artwork) =>
        selectedCategories.includes(artwork.category?.trim() || '')
      )
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })
        break
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateA - dateB
        })
        break
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'popularity':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        break
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = getAverageRating(a)
          const ratingB = getAverageRating(b)
          return ratingB - ratingA
        })
        break
    }

    onFilterChange(filtered)
  }, [searchTerm, priceRange, selectedCategories, sortBy, artworks, onFilterChange])

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const clearAllFilters = () => {
    setPriceRange([priceBounds[0], priceBounds[1]])
    setSelectedCategories([])
    setSortBy('newest')
    onSearchChange('')
  }

  const hasActiveFilters = 
    priceRange[0] !== priceBounds[0] ||
    priceRange[1] !== priceBounds[1] ||
    selectedCategories.length > 0 ||
    sortBy !== 'newest' ||
    searchTerm.trim() !== ''

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Search Bar with Suggestions */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="input-field pl-4 pr-12 text-sm md:text-base py-3 w-full border-2 border-gray-200 focus:border-orange-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="text-lg" />
            </button>
          )}
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-black text-lg md:text-xl" />
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  onSearchChange(suggestion)
                  setShowSuggestions(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-orange-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
              >
                <FiSearch className="inline mr-2 text-xs text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toggle Button and Results Count */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base font-medium ${
            showFilters || hasActiveFilters
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FiSliders className="text-base md:text-lg" />
          <span className="hidden sm:inline">{t.filters}</span>
          {hasActiveFilters && (
            <span className="bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {[selectedCategories.length, sortBy !== 'newest' ? 1 : 0, priceRange[0] !== priceBounds[0] || priceRange[1] !== priceBounds[1] ? 1 : 0].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 flex-1 justify-end">
          {filteredCount !== undefined && (
            <span className="text-xs md:text-sm text-gray-600 font-medium">
              {filteredCount} {filteredCount === 1 ? t.result : t.results}
            </span>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs md:text-sm text-gray-900 hover:text-orange-700 font-medium flex items-center gap-1 px-2 py-1 hover:bg-orange-50 rounded transition-colors"
            >
              <FiX className="text-xs" />
              <span className="hidden sm:inline">{t.clearFilters}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 md:p-6 space-y-4 md:space-y-6 border-2 border-orange-100 bg-gradient-to-br from-orange-50/50 to-white">
          {/* Sort By */}
          <div>
            <label className="block text-sm md:text-base font-semibold mb-2 text-gray-900">
              {t.sortBy}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { value: 'newest', label: t.newest },
                { value: 'oldest', label: t.oldest },
                { value: 'price-low', label: t.priceLowToHigh },
                { value: 'price-high', label: t.priceHighToLow },
                { value: 'popularity', label: t.popularity },
                { value: 'rating', label: t.rating }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    sortBy === option.value
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm md:text-base font-semibold mb-2 text-gray-900">
              {t.priceRange}
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">{t.minPrice}</label>
                  <input
                    type="number"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Math.max(priceBounds[0], parseInt(e.target.value) || 0), priceRange[1]])
                    }
                    className="input-field text-sm py-2 w-full"
                  />
                </div>
                <span className="text-gray-400 mt-6">-</span>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">{t.maxPrice}</label>
                  <input
                    type="number"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Math.min(priceBounds[1], parseInt(e.target.value) || priceBounds[1])])
                    }
                    className="input-field text-sm py-2 w-full"
                  />
                </div>
              </div>
              <div className="relative py-2">
                <div className="relative h-2 bg-gray-200 rounded-lg">
                  {/* Active range indicator */}
                  <div
                    className="absolute h-2 bg-orange-600 rounded-lg"
                    style={{
                      left: `${((priceRange[0] - priceBounds[0]) / (priceBounds[1] - priceBounds[0])) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / (priceBounds[1] - priceBounds[0])) * 100}%`
                    }}
                  />
                  {/* Min range slider */}
                  <input
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value)
                      setPriceRange([Math.min(newMin, priceRange[1] - 100), priceRange[1]])
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                    style={{
                      background: 'transparent',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  />
                  {/* Max range slider */}
                  <input
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value)
                      setPriceRange([priceRange[0], Math.max(newMax, priceRange[0] + 100)])
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                    style={{
                      background: 'transparent',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>₹{priceBounds[0].toLocaleString()}</span>
                  <span className="font-semibold text-gray-900">
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </span>
                  <span>₹{priceBounds[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm md:text-base font-semibold mb-2 text-gray-900">
                {t.categories}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                    {selectedCategories.includes(category) && (
                      <FiX className="inline ml-1 text-xs" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

