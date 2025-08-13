import { useEffect, useState } from "react";

/**
 * Returns a stable field (device) identifier.
 * Priority:
 *   1. Compile-time env var VITE_FIELD_ID (set per field via .env)
 *   2. Cached value in localStorage
 *   3. Prompt the operator once
 */
export default function useFieldId() {
  const [fieldName, setFieldName] = useState<string | undefined>(undefined);
  const [fieldId, setFieldId] = useState<string | undefined>(undefined);

  const getFieldNameInput = (promptText: string = "Enter field name") => {
    const input = window.prompt(promptText)?.trim();
    if (input) {
      localStorage.setItem("fieldName", input);
      setFieldName(input);
    }
  };

  useEffect(() => {
    const envId = import.meta.env.VITE_FIELD_ID as string | undefined;
    if (envId) {
      setFieldName(envId);
      return;
    }

    const cached = localStorage.getItem("fieldName");
    if (cached) {
      setFieldName(cached);
      return;
    }

    getFieldNameInput();
  }, []);

  // a reset function to prompt the user again in case the server
  const resetFieldName = () => {
    localStorage.removeItem("fieldName");
    setFieldName(undefined);
    getFieldNameInput("Field name does not exist. Please try again");
  };

  const updateFieldId = (id: string) => {
    if (!id) return;
    setFieldId(() => id);
  };


  return { fieldName, fieldId, resetFieldName, updateFieldId } as const;
}
