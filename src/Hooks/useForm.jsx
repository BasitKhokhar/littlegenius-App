import { useState, useCallback } from 'react';

/**
 * useForm - Generic form state management hook
 * @param {object} initialValues - initial field values
 * @returns form helpers
 */
const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const setFieldError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const setAllErrors = useCallback((errs) => {
    setErrors(errs);
  }, []);

  return {
    values,
    errors,
    handleChange,
    setFieldError,
    setAllErrors,
    resetForm,
  };
};

export default useForm;
