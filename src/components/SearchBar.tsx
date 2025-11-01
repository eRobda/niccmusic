import React, { useState } from 'react'
import { Search, Music, Disc, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type SearchType = 'track' | 'album' | 'artist'

interface SearchBarProps {
  onSearch: (query: string, type: SearchType) => void
  isLoading: boolean
  onTypeChange?: (type: SearchType) => void
  type?: SearchType
  query: string
  onQueryChange: (value: string) => void
}

export function SearchBar({ onSearch, isLoading, onTypeChange, type, query, onQueryChange }: SearchBarProps) {
  const [searchType, setSearchType] = useState<SearchType>('track')

  React.useEffect(() => {
    if (type && type !== searchType) {
      setSearchType(type)
    }
  }, [type])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), searchType)
    }
  }

  const getSearchTypeIcon = (type: SearchType) => {
    switch (type) {
      case 'track':
        return <Music className="h-4 w-4" />
      case 'album':
        return <Disc className="h-4 w-4" />
      case 'artist':
        return <User className="h-4 w-4" />
    }
  }

  const getSearchTypeLabel = (type: SearchType) => {
    switch (type) {
      case 'track':
        return 'Skladba'
      case 'album':
        return 'Album'
      case 'artist':
        return 'Umělec'
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Zadejte název skladby, alba nebo umělce..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="text-lg"
            />
          </div>
          <Button type="submit" disabled={isLoading || !query.trim()}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Hledám...' : 'Hledat'}
          </Button>
        </div>
        
        <Tabs value={searchType} onValueChange={(value) => {
          const t = value as SearchType
          setSearchType(t)
          onTypeChange?.(t)
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="track" 
              className="flex items-center gap-2 transition-colors duration-300"
            >
              {getSearchTypeIcon('track')}
              {getSearchTypeLabel('track')}
            </TabsTrigger>
            <TabsTrigger 
              value="album" 
              className="flex items-center gap-2 transition-colors duration-300"
            >
              {getSearchTypeIcon('album')}
              {getSearchTypeLabel('album')}
            </TabsTrigger>
            <TabsTrigger 
              value="artist" 
              className="flex items-center gap-2 transition-colors duration-300"
            >
              {getSearchTypeIcon('artist')}
              {getSearchTypeLabel('artist')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </form>
    </div>
  )
}
