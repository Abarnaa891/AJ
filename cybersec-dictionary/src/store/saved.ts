import { create } from 'zustand'

type SavedState = {
  savedIds: Set<string>
  toggleSaved: (id: string) => void
}

export const useSavedStore = create<SavedState>((set) => ({
  savedIds: new Set<string>(JSON.parse(localStorage.getItem('saved-ids') || '[]')),
  toggleSaved: (id: string) => set((state) => {
    const next = new Set(state.savedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    localStorage.setItem('saved-ids', JSON.stringify(Array.from(next)))
    return { savedIds: next }
  }),
}))

