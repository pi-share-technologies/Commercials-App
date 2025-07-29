import { useEffect, useState } from 'react'

/**
 * Returns a stable field (device) identifier.
 * Priority:
 *   1. Compile-time env var VITE_FIELD_ID (set per kiosk build or via .env.local)
 *   2. Cached value in localStorage
 *   3. Prompt the operator once
 */
export default function useFieldId() {
  const [fieldId, setFieldId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const envId = import.meta.env.VITE_FIELD_ID as string | undefined
    if (envId) {
      setFieldId(envId)
      return
    }

    const cached = localStorage.getItem('fieldName')
    if (cached) {
      setFieldId(cached)
      return
    }

    const input = window.prompt('Enter field name')?.trim()
    if (input) {
      localStorage.setItem('fieldName', input)
      setFieldId(input)
    }
  }, [])

  return fieldId
}
