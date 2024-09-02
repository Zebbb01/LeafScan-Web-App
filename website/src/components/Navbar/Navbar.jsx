import { useEffect, useState, useRef } from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';
import menu_icon from '../../assets/menu.png';
import { Link, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';

const Navbar = ({ user, onLogout }) => {
  const [sticky, setSticky] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMobileMenu(!mobileMenu);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
    toast.info('Logged out successfully!', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      transition: Zoom,
    });
  };

  return (
    <nav className={`container ${sticky ? 'dark-nav' : ''}`}>
      <ScrollLink to='hero' smooth={true} offset={0} duration={500}><img src={logo} alt="logo" className='logo' /></ScrollLink>
      <ul ref={mobileMenuRef} className={mobileMenu ? '' : 'hide-mobile-menu'}>
        <li><ScrollLink to='hero' smooth={true} offset={0} duration={500}>Home</ScrollLink></li>
        <li><ScrollLink to='scan-container' smooth={true} offset={-180} duration={500}>Scan</ScrollLink></li>
        <li><ScrollLink to='forecast-chart-container' smooth={true} offset={-180} duration={500}>Forecast</ScrollLink></li>
        <li><ScrollLink to='about' smooth={true} offset={-260} duration={500}>About</ScrollLink></li>
        <li><ScrollLink to='contact' smooth={true} offset={-260} duration={500}>Contact</ScrollLink></li>
        {user ? (
          <li className='dropdown' ref={dropdownRef}>
            <button
              type='button'
              className='btn btn-danger dropdown-toggle'
              onClick={toggleDropdown}
            >
              {user.name} <span className="dropdown-icon"> ▼ </span>
            </button>
            <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
              <li>
                <Link to={`/update/${user.id}`} className="dropdown-item">Edit Profile</Link>
              </li>
              <li><a className="dropdown-item" onClick={handleLogout}>Logout</a></li>
            </ul>
          </li>
        ) : (
          <li><Link to='/login'>Login</Link></li>
        )}
      </ul>
      <img src={menu_icon} alt="menu" className='menu-icon' onClick={toggleMenu} />
    </nav>
  );
};

Navbar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }),
  onLogout: PropTypes.func.isRequired
};

export default Navbar;
