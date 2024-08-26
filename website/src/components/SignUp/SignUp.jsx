import { useState } from 'react';
import './SignUp.css';
import { Link, useNavigate } from 'react-router-dom';
import SignUpValidation from './SignUpValidation';
import axios from 'axios';
import { toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logo2.png';
import Spinner from '../Spinner/Spinner';

const SignUp = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleInput = (e) => {
    setValues(prev => ({
      ...prev, [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = SignUpValidation(values);
    setErrors(validationErrors);

    if (!validationErrors.name && !validationErrors.email && !validationErrors.password && !validationErrors.confirmPassword) {
      setLoading(true);
      axios.post('http://127.0.0.1:5000/create_token1', values)
        .then(() => {
          setLoading(false);
          navigate('/');
          toast.success('Sign Up successfully!', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Zoom,
          });
        }).catch(err => {
          setLoading(false);
          const errorMessage = err.response?.data?.error || 'An error occurred while signing up';
          setErrors(prev => ({ ...prev, email: errorMessage }));
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Zoom,
          });
        });
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <div className='signup-container'>
      <div className='addUser'>
        <img src={logo} alt="logo" className='logo-signup' />
        <h1>Register</h1>
        {loading ? <Spinner /> : (
          <form className='addUserForm' onSubmit={handleSubmit}>
            <div className='inputGroup'>
              <label htmlFor='name'>Username:</label>
              <input type='text' id='name' name='name' placeholder='Enter Username' onChange={handleInput} />
              {errors.name && <span>{errors.name}</span>}
              <label htmlFor='email'>Email:</label>
              <input type='email' id='email' name='email' placeholder='Enter your Email' onChange={handleInput} />
              {errors.email && <span>{errors.email}</span>}
              <label htmlFor='password'>Password:</label>
              <div className='passwordWrapper'>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id='password'
                  name='password'
                  placeholder='Enter Password'
                  onChange={handleInput}
                />
                <FontAwesomeIcon
                  icon={passwordVisible ? faEyeSlash : faEye}
                  onClick={togglePasswordVisibility}
                  className='eyeIcon'
                />
              </div>
              {errors.password && <span>{errors.password}</span>}
              <label htmlFor='confirmPassword'>Confirm Password:</label>
              <div className='passwordWrapper'>
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  id='confirmPassword'
                  name='confirmPassword'
                  placeholder='Confirm your password'
                  onChange={handleInput}
                />
                <FontAwesomeIcon
                  icon={confirmPasswordVisible ? faEyeSlash : faEye}
                  onClick={toggleConfirmPasswordVisibility}
                  className='eyeIcon'
                />
              </div>
              {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
              <button type='submit' className='btn btn-success'>Sign Up</button>
            </div>
            <div className='logins'>
              <p>Already have an account?</p>
              <Link to='/' className='btn btn-primary'>Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
