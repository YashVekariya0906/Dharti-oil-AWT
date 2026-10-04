import React, { useEffect } from 'react';
import { FaWeightHanging, FaBoxOpen, FaExclamationTriangle, FaPhoneAlt, FaEnvelope, FaImage, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './ReturnPolicy.css';

const ReturnPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="policy-wrapper">
      <div className="policy-container">
        <header className="policy-header">
          <h1 className="animate-fade-in">Return & Exchange Policy</h1>
          <p className="animate-fade-in-delay">At Dharti Amrut Oil, we are committed to delivering high-quality and pure products to our customers.</p>
        </header>

        <div className="policy-grid">
          {/* Section 1: Weight & Packaging */}
          <div className="policy-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card-icon weight-icon">
              <FaWeightHanging />
            </div>
            <h3>1. Weight & Packaging Policy</h3>
            <ul className="policy-list">
              <li>All product weights mentioned (e.g., 15 kg) refer to the <strong>net oil weight only</strong>.</li>
              <li>The packaging/container weight is not included in the total weight.</li>
              <li>Minor variations due to packaging are normal and acceptable.</li>
            </ul>
          </div>

          {/* Section 2: Leakage or Damaged */}
          <div className="policy-card animate-slide-up highlight-card" style={{ animationDelay: '0.2s' }}>
            <div className="card-icon damage-icon">
              <FaBoxOpen />
            </div>
            <h3>2. Leakage or Damaged Product</h3>
            <p>If you receive a product that is leaking or damaged during delivery:</p>
            <div className="eligibility-badge">
              <FaCheckCircle /> You are eligible for a free exchange.
            </div>
            <div className="conditions-box">
              <h4>Conditions:</h4>
              <ul>
                <li>Report within 24–48 hours of delivery</li>
                <li>Share clear photos or videos as proof</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Quality Issue */}
          <div className="policy-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-icon quality-icon">
              <FaExclamationTriangle />
            </div>
            <h3>3. Product Quality Issue</h3>
            <p>If you are not satisfied with the product quality:</p>
            <ul className="policy-list">
              <li>Raise a request via contact number or email</li>
              <li>Provide valid proof (images/videos)</li>
            </ul>
            <div className="info-note">
              <p>📌 Our team will inspect the issue. If verified, we provide a replacement. If not verified, the request may be rejected.</p>
            </div>
          </div>

          {/* Section 4: How to Request */}
          <div className="policy-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="card-icon request-icon">
              <FaPhoneAlt />
            </div>
            <h3>4. How to Request</h3>
            <p>To initiate a request, contact us via phone or email and share:</p>
            <div className="request-steps">
              <div className="step"><span className="step-num">1</span> Order details</div>
              <div className="step"><span className="step-num">2</span> Issue description</div>
              <div className="step"><span className="step-num">3</span> Proof (photos/videos)</div>
            </div>
            <div className="contact-info-mini">
              <span><FaPhoneAlt /> +91 9824631331</span>
              <span><FaEnvelope /> dhartiamrut1212@gmail.com</span>
            </div>
          </div>
        </div>

        <section className="important-notes animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <h3><FaExclamationTriangle /> Important Notes</h3>
          <div className="notes-grid">
            <div className="note-item">
              <FaTimesCircle className="note-icon-err" />
              <p>Requests without proof may not be accepted</p>
            </div>
            <div className="note-item">
              <FaCheckCircle className="note-icon-success" />
              <p>Claims must be made within the specified time</p>
            </div>
            <div className="note-item">
              <FaExclamationTriangle className="note-icon-warn" />
              <p>The company reserves the right to approve or reject requests after verification</p>
            </div>
          </div>
        </section>

        <footer className="policy-footer animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="short-version">
            <h4>💬 Quick Summary</h4>
            <div className="summary-pills">
              <span>Net weight only</span>
              <span>Free exchange for damage</span>
              <span>Proof required</span>
              <span>Report within 48 hrs</span>
              <span>Final decision by company</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReturnPolicy;
