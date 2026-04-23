import React, { useState, useEffect, useRef } from 'react';
import './AboutUsSection.css';

const API_BASE = 'http://localhost:5000';

const AboutUsSection = () => {
  const [aboutData, setAboutData] = useState(null);
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const autoScrollRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    fetchAboutData();
    fetchMembers();
  }, []);

  // Auto-scroll management carousel
  useEffect(() => {
    if (members.length <= 1) return;
    autoScrollRef.current = setInterval(() => {
      setCurrentMember(prev => (prev + 1) % members.length);
    }, 5000);
    return () => clearInterval(autoScrollRef.current);
  }, [members]);

  const fetchAboutData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/about-us`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.faq_data === 'string') {
          try { data.faq_data = JSON.parse(data.faq_data); } catch { data.faq_data = []; }
        }
        setAboutData(data);
      }
    } catch (err) { console.error('AboutUs fetch error:', err); }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/about-us/members`);
      if (res.ok) setMembers(await res.json());
    } catch (err) { console.error('Members fetch error:', err); }
  };

  const goToMember = (index) => {
    clearInterval(autoScrollRef.current);
    setCurrentMember(index);
    // Restart auto-scroll after manual nav
    autoScrollRef.current = setInterval(() => {
      setCurrentMember(prev => (prev + 1) % members.length);
    }, 5000);
  };

  // If no data at all, render nothing
  if (!aboutData) return null;

  const hasAbout = aboutData.company_intro || aboutData.about_banner_image;
  const hasInfra = aboutData.infra_title || aboutData.infra_description ||
    [1, 2, 3, 4, 5, 6].some(i => aboutData[`infra_image_${i}`]);
  const hasManagement = members.length > 0;
  const faqList = Array.isArray(aboutData.faq_data) ? aboutData.faq_data : [];
  const hasFaq = faqList.length > 0;

  if (!hasAbout && !hasInfra && !hasManagement && !hasFaq) return null;

  const infraImages = [1, 2, 3, 4, 5, 6]
    .map(i => aboutData[`infra_image_${i}`])
    .filter(Boolean);

  return (
    <section className="aus-section" id="about-us">

      {/* ===== TOP BANNER IMAGE ===== */}
      {aboutData.about_banner_image && (
        <div className="aus-top-banner">
          <img src={aboutData.about_banner_image} alt="About Us Banner" />
        </div>
      )}

      {/* ===== ABOUT HEADER ROW ===== */}
      {hasAbout && (
        <div className="aus-about-row">
          <div className="aus-about-row-inner">
            <div className="aus-about-text">
              <h2 className="aus-section-label">About Us</h2>
              <div className="aus-about-bar" />
              <p className="aus-intro-text">{aboutData.company_intro}</p>
            </div>
            {aboutData.about_intro_image && (
              <div className="aus-about-images">
                <div className="aus-about-img-wrap">
                  <img src={aboutData.about_intro_image} alt="About Us - Intro" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== INFRASTRUCTURE SECTION ===== */}
      {hasInfra && (
        <div className="aus-infra-section">
          {aboutData.infra_title && (
            <h2 className="aus-infra-title">{aboutData.infra_title}</h2>
          )}
          {aboutData.infra_description && (
            <div className="aus-infra-description">
              {aboutData.infra_description.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
          {infraImages.length > 0 && (
            <div className={`aus-infra-grid aus-grid-${Math.min(infraImages.length, 6)}`}>
              {infraImages.map((src, idx) => (
                <div key={idx} className={`aus-infra-img-wrap img-slot-${idx}`}>
                  <img src={src} alt={`Infrastructure ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== MANAGEMENT CAROUSEL ===== */}
      {hasManagement && (
        <div className="aus-mgmt-section">
          <h2 className="aus-mgmt-title">{aboutData.mgmt_title || 'Management Behind Dharti Amrut'}</h2>
          <div className="aus-mgmt-carousel">
            {members.map((m, idx) => (
              <div
                key={m.id}
                className={`aus-mgmt-slide ${idx === currentMember ? 'active' : idx < currentMember ? 'prev' : 'next'}`}
              >
                <div className="aus-mgmt-content">
                  <div className="aus-mgmt-left">
                    <p className="aus-mgmt-bio">{m.bio}</p>
                    <div className="aus-mgmt-divider" />
                    <strong className="aus-mgmt-name">{m.name}</strong>
                    <span className="aus-mgmt-designation">{m.designation}</span>
                  </div>
                  <div className="aus-mgmt-right">
                    {m.member_image ? (
                      <img src={m.member_image} alt={m.name} className="aus-mgmt-photo" />
                    ) : (
                      <div className="aus-mgmt-photo-placeholder">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot navigation */}
          {members.length > 1 && (
            <div className="aus-mgmt-dots">
              {members.map((_, idx) => (
                <button
                  key={idx}
                  className={`aus-dot ${idx === currentMember ? 'active' : ''}`}
                  onClick={() => goToMember(idx)}
                  aria-label={`Go to member ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== FAQ SECTION ===== */}
      {hasFaq && (
        <div className="aus-faq-section">
          <h2 className="aus-faq-title">Frequently Asked Questions</h2>
          <div className="aus-faq-list">
            {faqList.map((item, idx) => (
              <div key={idx} className={`aus-faq-item ${openFaq === idx ? 'open' : ''}`}>
                <button
                  className="aus-faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{item.question}</span>
                  <span className="aus-faq-icon">{openFaq === idx ? '−' : '+'}</span>
                </button>
                <div className="aus-faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AboutUsSection;
