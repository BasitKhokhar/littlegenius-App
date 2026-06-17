// Form Validation Helpers

export const validateSignup = (data) => {
  const errors = {};

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Please enter child's nickname!";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters!";
  }

  // Validate email
  if (!data.email) {
    errors.email = 'Email is required!';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email!';
  }

  // Validate password
  if (!data.password) {
    errors.password = 'Password is required!';
  } else if (data.password.length < 4) {
    errors.password = 'Password must be at least 4 characters!';
  }

  // Validate age
  if (!data.age) {
    errors.age = 'Please select child age!';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = (data) => {
  const errors = {};

  // Validate email
  if (!data.email) {
    errors.email = 'Email is required!';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email!';
  }

  // Validate password
  if (!data.password) {
    errors.password = 'Password is required!';
  } else if (data.password.length < 4) {
    errors.password = 'Invalid password!';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

export const isValidAge = (age) => {
  const ageNum = parseInt(age, 10);
  return ageNum >= 3 && ageNum <= 12;
};

export default {
  validateSignup,
  validateLogin,
  isValidEmail,
  isValidName,
  isValidAge,
};
