const SignUpValidation = (values) => {
  let errors = {};
  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

  if (!values.name) {
    errors.name = 'Name cannot be empty';
  } else {
    errors.name = '';
  }

  if (!values.email) {
    errors.email = 'Email cannot be empty';
  } else if (!email_pattern.test(values.email)) {
    errors.email = 'Email is invalid';
  } else {
    errors.email = '';
  }

  if (!values.password) {
    errors.password = 'Password cannot be empty';
  } else if (!password_pattern.test(values.password)) {
    errors.password = 'Password must be at least 8 characters long, number, uppercase and lowercase letter';
  } else {
    errors.password = '';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm password cannot be empty';
  } else if (!password_pattern.test(values.confirmPassword)) {
    errors.confirmPassword = 'Password must be at least 8 characters long, number, uppercase and lowercase letter';
  } else if (values.password !== values.confirmPassword){
    errors.confirmPassword = 'Wrong password';
  }else {
    errors.confirmPassword = '';
  }

  return errors;
};

export default SignUpValidation;