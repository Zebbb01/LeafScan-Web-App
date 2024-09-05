import React from 'react'
import './Hero.css'
import arrow from '../../../assets/arrow.png'
import { Link } from 'react-scroll'

const Hero = () => {
  return (
    <div className='hero container'>
        <div className='hero-text'>
            <h1>Cacao Leaf Disease Detection</h1>
            <p>Upload an image of the cacao leaf to detect diseases using our advance detection system.</p>
            <Link to='hero container' smooth={true} offset={900} duration={500} className='btn'>Get Started <img src={arrow} alt=''/></Link >
        </div>
    </div>
  )
}
export default Hero