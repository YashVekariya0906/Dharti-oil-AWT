import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';
import './ContactUs.css';

export default function ContactUs({ user, onRequireLogin }) {
  const [details, setDetails] = useState({
    address: 'B-16, Privilon, Behind ISKCON Temple, Ambli-Bopal Road, Ahmedabad-380059, Gujarat, India.',
    email: 'info@nkproteins.com',
    mobile: '+91 6359891941',
    facebook_link: '',
    instagram_link: '',
    youtube_link: '',
    banner_image: ''
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if we have a pending form saved in local storage
    const savedForm = localStorage.getItem('pendingContactForm');
    if (savedForm) {
      try {
        setFormData(JSON.parse(savedForm));
        localStorage.removeItem('pendingContactForm');
      } catch (e) {
        console.error("Could not parse saved form.");
      }
    }

    // Fetch Admin contact details
    fetch('http://localhost:5000/api/contact-details')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setDetails({
            address: data.address || details.address,
            email: data.email || details.email,
            mobile: data.mobile || details.mobile,
            facebook_link: data.facebook_link || '',
            instagram_link: data.instagram_link || '',
            youtube_link: data.youtube_link || '',
            banner_image: data.banner_image || ''
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      // User is not logged in. Save state and Redirect.
      localStorage.setItem('pendingContactForm', JSON.stringify(formData));
      localStorage.setItem('redirectAfterAuth', 'contact');
      // Also save email to auto-fill if possible, but form data is enough.
      onRequireLogin();
      return;
    }

    // Process submission
    setIsSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5000/api/contact-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.user_id })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Thank you! Your message has been sent successfully.' });
        setFormData({ first_name: '', last_name: '', phone: '', email: '', message: '' }); // Clear form
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to send message. Please try again.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Network error occurred. Please try again.' });
    }
    setIsSubmitting(false);
  };

  const bannerStyle = details.banner_image 
    ? { backgroundImage: `url(${details.banner_image.startsWith('http') ? details.banner_image : 'http://localhost:5000'+details.banner_image})` }
    : { background: '#2d8a48' }; // Fallback color

  return (
    <div className="contact-page fade-up">
      {/* Top Banner (100% width, 300px height) */}
      <div className="contact-hero-image" style={bannerStyle}>
        {details.banner_image && <div className="contact-hero-overlay"></div>}
      </div>

      <div className="contact-wrapper">
        <h2 className="contact-title">Contact Us</h2>
        
        <div className="contact-container">
          {/* Left Side: Contact Details */}
          <div className="contact-info-list">
            <div className="info-card">
              <div className="info-icon"><FaMapMarkerAlt /></div>
              <div className="info-content">
                <h4>Address</h4>
                <p>{details.address}</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon"><FaEnvelope /></div>
              <div className="info-content">
                <h4>Email</h4>
                <p>{details.email}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon"><FaPhoneAlt /></div>
              <div className="info-content">
                <h4>Mobile</h4>
                <p>{details.mobile}</p>
              </div>
            </div>

            <div className="social-section">
              <h3>Social</h3>
              <div className="social-icons">
                {details.facebook_link && (
                  <a href={details.facebook_link} target="_blank" rel="noopener noreferrer" className="social-btn btn-facebook">
                    <FaFacebookF />
                  </a>
                )}
                {details.youtube_link && (
                  <a href={details.youtube_link} target="_blank" rel="noopener noreferrer" className="social-btn btn-youtube">
                    <FaYoutube />
                  </a>
                )}
                {details.instagram_link && (
                  <a href={details.instagram_link} target="_blank" rel="noopener noreferrer" className="social-btn btn-instagram">
                    <FaInstagram />
                  </a>
                )}
                {/* Always show icons as fallback if none filled by admin to match mockup */}
                {!details.facebook_link && !details.youtube_link && !details.instagram_link && (
                   <>
                     <span className="social-btn btn-facebook"><FaFacebookF /></span>
                     <span className="social-btn btn-youtube"><FaYoutube /></span>
                     <span className="social-btn btn-instagram"><FaInstagram /></span>
                   </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <form className="contact-form" onSubmit={handleSubmit}>
            {statusMsg.text && (
              <div className={`contact-message ${statusMsg.type === 'success' ? 'msg-success' : 'msg-error'}`}>
                {statusMsg.text}
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label>First Name (required)</label>
                <input type="text" name="first_name" placeholder="First name" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name (required)</label>
                <input type="text" name="last_name" placeholder="Last name" value={formData.last_name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Your Phone (required)</label>
                <input type="tel" name="phone" placeholder="Your phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Your Email (required)</label>
                <input type="email" name="email" placeholder="Your email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Your Message</label>
              <textarea name="message" placeholder="Your message" rows="5" value={formData.message} onChange={handleChange}></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
