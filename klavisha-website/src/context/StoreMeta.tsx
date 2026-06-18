import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getStoreMetadata } from '../lib/medusa'

type StoreMeta = Record<string, unknown> | null

const StoreMetaContext = createContext<StoreMeta>(null)

export function StoreMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<StoreMeta>(null)

  useEffect(() => {
    getStoreMetadata().then(setMeta).catch(() => setMeta(null))
  }, [])

  return <StoreMetaContext.Provider value={meta}>{children}</StoreMetaContext.Provider>
}

export function useStoreMeta() {
  return useContext(StoreMetaContext)
}
