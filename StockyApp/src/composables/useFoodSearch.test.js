import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFoodSearch } from './useFoodSearch'
import { useFoodItemsStore } from '@/stores/foodItems'

describe('useFoodSearch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function seedItems() {
    const store = useFoodItemsStore()
    store.items = [
      { id: '1', name: 'Banana', calories: 105 },
      { id: '2', name: 'Bread', calories: 80 },
      { id: '3', name: 'Chicken Breast', calories: 165 },
    ]
    return store
  }

  it('returns all items sorted by name when the search term is empty', () => {
    seedItems()
    const { results } = useFoodSearch()
    expect(results.value.map((i) => i.name)).toEqual(['Banana', 'Bread', 'Chicken Breast'])
  })

  it('filters items case-insensitively by substring', () => {
    seedItems()
    const { searchTerm, results } = useFoodSearch()
    searchTerm.value = 'bre'
    expect(results.value.map((i) => i.name)).toEqual(['Bread', 'Chicken Breast'])
  })

  it('trims whitespace in the search term', () => {
    seedItems()
    const { searchTerm, results } = useFoodSearch()
    searchTerm.value = '  banana  '
    expect(results.value.map((i) => i.name)).toEqual(['Banana'])
  })

  it('reports hasExactMatch only for an exact case-insensitive name match', () => {
    seedItems()
    const { searchTerm, hasExactMatch } = useFoodSearch()

    searchTerm.value = 'banana'
    expect(hasExactMatch.value).toBe(true)

    searchTerm.value = 'ban'
    expect(hasExactMatch.value).toBe(false)

    searchTerm.value = 'BANANA'
    expect(hasExactMatch.value).toBe(true)
  })
})
