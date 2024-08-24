/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import './UpdateProfile.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateProfileValidation from './UpdateProfileValidation';

const UpdateProfile = ({ setUser }) => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/user/${id}`)
      .then(res => {
        setName(res.data.name);
        setEmail(res.data.email);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const values = { currentPassword, newPassword };
    const validationErrors = UpdateProfileValidation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!currentPassword && !newPassword) {
      updateProfile({ name });
      return;
    }

    if (currentPassword) {
      try {
        const response = await axios.post('http://localhost:5000/check-password', {
          id,
          password: currentPassword
        });

        if (!response.data.valid) {
          setErrors(prev => ({
            ...prev,
            currentPassword: 'Current password is incorrect'
          }));
          toast.error('Current password is incorrect', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Zoom,
          });
          return;
        }
      } catch (error) {
        console.error('Error checking password:', error);
        toast.error('Failed to verify current password', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Zoom,
        });
        return;
      }
    }

    updateProfile({ name, password: newPassword });
  };

  const updateProfile = async (dataToUpdate) => {
    setLoading(true);

    axios.put(`http://127.0.0.1:5000/update/${id}`, dataToUpdate)
      .then(res => {
        setLoading(false);
        if (res.data.updated) {
          const updatedUser = { ...JSON.parse(localStorage.getItem('user')), name: dataToUpdate.name };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          navigate('/home');
          toast.success('Profile updated successfully', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Zoom,
          });
        } else {
          toast.error('Failed to update', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Zoom,
          });
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        toast.error('Failed to update', {
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
  };
  
  const handleCancel = () => {
    navigate('/home');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='update-container'>
      <div className='pf-update'>
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div className='mb-2'>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Enter Name"
              className='form-control'
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className='mb-2'>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              disabled
              placeholder="Enter Email"
              className='form-control'
            />
          </div>
          <div className='mb-2'>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              placeholder="Enter Current Password"
              className='form-control'
              onChange={e => setCurrentPassword(e.target.value)}
            />
            {errors.currentPassword && <span>{errors.currentPassword}</span>}
          </div>
          <div className='mb-2'>
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              placeholder="Enter New Password"
              className='form-control'
              onChange={e => setNewPassword(e.target.value)}
            />
            {errors.newPassword && <span>{errors.newPassword}</span>}
          </div>
          <div className='btn-update'>
          <button type="submit" className='btn btn-info'>Update</button>
          <button type="button" className='btn btn-secondary' onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
