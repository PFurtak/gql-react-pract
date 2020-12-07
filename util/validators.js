module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if (username.trim() === '') {
    errors.username = 'Must provide a username';
  }
  if (email.trim() === '') {
    errors.email = 'Must provide and email adress';
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = 'Email must be a valid email adress';
    }
  }
  if (password === '') {
    errors.password = 'Must provide a password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === '') {
    errors.username = 'Must provide a username';
  }
  if (password === '') {
    errors.password = 'Must provide a password';
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
