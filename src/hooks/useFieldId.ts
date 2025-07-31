import { useEffect, useState } from "react";

/**
 * Returns a stable field (device) identifier.
 * Priority:
 *   1. Compile-time env var VITE_FIELD_ID (set per field via .env)
 *   2. Cached value in localStorage
 *   3. Prompt the operator once
 */
export default function useFieldId() {
  const [fieldId, setFieldId] = useState<string | undefined>(undefined);

  const getFieldIdInput = (promptText: string = "Enter field name") => {
    const input = window.prompt(promptText)?.trim();
    if (input) {
      localStorage.setItem("fieldName", input);
      setFieldId(input);
    }
  };

  useEffect(() => {
    const envId = import.meta.env.VITE_FIELD_ID as string | undefined;
    if (envId) {
      setFieldId(envId);
      return;
    }

    const cached = localStorage.getItem("fieldName");
    if (cached) {
      setFieldId(cached);
      return;
    }

    getFieldIdInput();
  }, []);

  // a reset function to prompt the user again in case the server
  const resetFieldId = () => {
    localStorage.removeItem("fieldName");
    setFieldId(undefined);
    getFieldIdInput("Field name does not exist. Please try again");
  };

  return { fieldId, resetFieldId } as const;
}
