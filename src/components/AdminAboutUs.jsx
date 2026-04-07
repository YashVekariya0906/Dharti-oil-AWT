import React, { useState, useEffect, useRef } from 'react';
import './AdminAboutUs.css';

const API_BASE = 'http://localhost:5000';

const AdminAboutUs = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- About Section State ---
  const [aboutData, setAboutData] = useState({
    company_intro: '',
    about_banner_image: null,
    about_intro_image: null,
    infra_title: 'Infrastructure',
    infra_description: '',
    mgmt_title: 'Management Behind Dharti Amrut',
    infra_image_1: null, infra_image_2: null, infra_image_3: null,
    infra_image_4: null, infra_image_5: null, infra_image_6: null,
  });

  // Separate file states — do NOT mix URL strings with Files
  const [bannerFile, setBannerFile] = useState(null);
  const [introFile, setIntroFile] = useState(null);
  const [infraFiles, setInfraFiles] = useState({});

  // --- Members State ---
  const [members, setMembers] = useState([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', designation: '', bio: '', sort_order: 0 });
  const [memberImageFile, setMemberImageFile] = useState(null);
  const memberImageRef = useRef();

  // --- FAQ State ---
  const [faqList, setFaqList] = useState([]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  useEffect(() => {
    fetchAboutUs();
    fetchMembers();
  }, []);

  const fetchAboutUs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/about-us`);
      if (res.ok) {
        const data = await res.json();
        setAboutData(data);
        const faqs = Array.isArray(data.faq_data) ? data.faq_data : [];
        setFaqList(faqs);
      } else {
        console.error('Failed to fetch about us data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/about-us/members`);
      if (res.ok) setMembers(await res.json());
    } catch (err) {
      console.error('Members fetch error:', err);
    }
  };

  // ----------------------------------------------------------------
  // BUILD FormData CORRECTLY — no double-appending
  // ----------------------------------------------------------------
  const buildAboutFormData = () => {
    const fd = new FormData();

    // Text fields
    fd.append('company_intro', aboutData.company_intro || '');
    fd.append('infra_title', aboutData.infra_title || 'Infrastructure');
    fd.append('infra_description', aboutData.infra_description || '');
    fd.append('mgmt_title', aboutData.mgmt_title || 'Management Behind Dharti Amrut');
    fd.append('faq_data', JSON.stringify(faqList));

    // Banner image: send file if new, else send existing URL (or empty string)
    if (bannerFile) {
      fd.append('about_banner_image', bannerFile);
    } else {
      fd.append('about_banner_image', aboutData.about_banner_image || '');
    }

    // Intro image: same pattern
    if (introFile) {
      fd.append('about_intro_image', introFile);
    } else {
      fd.append('about_intro_image', aboutData.about_intro_image || '');
    }

    // Infra images: same pattern per slot
    for (let i = 1; i <= 6; i++) {
      const key = `infra_image_${i}`;
      if (infraFiles[key]) {
        fd.append(key, infraFiles[key]);
      } else {
        fd.append(key, aboutData[key] || '');
      }
    }

    return fd;
  };

  // ----------------------------------------------------------------
  // ABOUT + INFRASTRUCTURE SAVE
  // ----------------------------------------------------------------
  const saveSection = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const fd = buildAboutFormData();
      const res = await fetch(`${API_BASE}/api/about-us/update`, { method: 'POST', body: fd });
      const body = await res.json();
      if (res.ok) {
        showMessage('Saved successfully! ✅');
        setBannerFile(null);
        setIntroFile(null);
        setInfraFiles({});
        fetchAboutUs();
      } else {
        showMessage(`Failed: ${body.error || body.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      showMessage('Network error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (field) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/about-us/delete-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field })
      });
      if (res.ok) {
        setAboutData(prev => ({ ...prev, [field]: null }));
        showMessage('Image deleted');
      } else {
        showMessage('Delete failed', 'error');
      }
    } catch (err) {
      showMessage('Network error', 'error');
    }
  };

  // ----------------------------------------------------------------
  // MEMBERS CRUD
  // ----------------------------------------------------------------
  const openAddMember = () => {
    setEditingMember(null);
    setMemberForm({ name: '', designation: '', bio: '', sort_order: members.length });
    setMemberImageFile(null);
    if (memberImageRef.current) memberImageRef.current.value = '';
    setShowMemberForm(true);
  };

  const openEditMember = (m) => {
    setEditingMember(m);
    setMemberForm({ name: m.name, designation: m.designation, bio: m.bio || '', sort_order: m.sort_order });
    setMemberImageFile(null);
    if (memberImageRef.current) memberImageRef.current.value = '';
    setShowMemberForm(true);
  };

  const saveMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', memberForm.name);
      fd.append('designation', memberForm.designation);
      fd.append('bio', memberForm.bio);
      fd.append('sort_order', memberForm.sort_order);

      if (memberImageFile) {
        fd.append('member_image', memberImageFile);
      } else if (editingMember) {
        fd.append('existing_image', editingMember.member_image || '');
      }

      const url = editingMember
        ? `${API_BASE}/api/about-us/members/${editingMember.id}`
        : `${API_BASE}/api/about-us/members`;
      const method = editingMember ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: fd });
      const body = await res.json();

      if (res.ok) {
        showMessage(editingMember ? 'Member updated! ✅' : 'Member added! ✅');
        setShowMemberForm(false);
        fetchMembers();
      } else {
        showMessage(`Failed: ${body.error || body.message}`, 'error');
      }
    } catch (err) {
      showMessage('Network error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/about-us/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('Member deleted');
        fetchMembers();
      } else {
        showMessage('Delete failed', 'error');
      }
    } catch (err) {
      showMessage('Network error', 'error');
    }
  };

  // ----------------------------------------------------------------
  // FAQ CRUD
  // ----------------------------------------------------------------
  const addFaq = () => setFaqList(prev => [...prev, { question: '', answer: '' }]);

  const updateFaq = (index, field, value) => {
    setFaqList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeFaq = (index) => setFaqList(prev => prev.filter((_, i) => i !== index));

  const saveFaqOnly = async () => {
    setSaving(true);
    try {
      const fd = buildAboutFormData(); // reuses existing data + new FAQ list
      const res = await fetch(`${API_BASE}/api/about-us/update`, { method: 'POST', body: fd });
      const body = await res.json();
      if (res.ok) showMessage('FAQs saved! ✅');
      else showMessage(`Failed: ${body.error || body.message}`, 'error');
    } catch (err) {
      showMessage('Network error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------
  return (
    <div className="aau-container">
      <div className="aau-header">
        <h2>About Us Management</h2>
        <p>Manage all content shown on the About Us section of the home page.</p>
      </div>

      {message.text && (
        <div className={`aau-message ${message.type}`}>{message.text}</div>
      )}

      {/* Tab Navigation */}
      <div className="aau-tabs">
        {[
          { key: 'about', label: '📋 About & Banner' },
          { key: 'infra', label: '🏭 Infrastructure' },
          { key: 'management', label: '👥 Management Team' },
          { key: 'faq', label: '❓ FAQ' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`aau-tab ${activeSection === tab.key ? 'active' : ''}`}
            onClick={() => setActiveSection(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- ABOUT SECTION TAB ---- */}
      {activeSection === 'about' && (
        <form onSubmit={saveSection} className="aau-form">
          <div className="aau-section-title">About Us — Company Introduction</div>

          <div className="aau-field">
            <label>Company Introduction Text</label>
            <textarea
              rows={7}
              value={aboutData.company_intro || ''}
              onChange={e => setAboutData(prev => ({ ...prev, company_intro: e.target.value }))}
              placeholder="Write your company introduction here..."
            />
          </div>

          <div className="aau-two-col">
            {/* Banner Image */}
            <div className="aau-field">
              <label>Banner Image (right side, large)</label>
              {aboutData.about_banner_image && !bannerFile && (
                <div className="aau-img-preview">
                  <img src={aboutData.about_banner_image} alt="Banner" />
                  <button type="button" className="aau-del-img-btn" onClick={() => deleteImage('about_banner_image')}>✕ Remove</button>
                </div>
              )}
              {bannerFile && (
                <div className="aau-img-preview">
                  <img src={URL.createObjectURL(bannerFile)} alt="New Banner" />
                  <button type="button" className="aau-del-img-btn" onClick={() => setBannerFile(null)}>✕ Cancel</button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => setBannerFile(e.target.files[0] || null)}
              />
            </div>

            {/* Intro / Secondary Image */}
            <div className="aau-field">
              <label>Secondary Image (below banner)</label>
              {aboutData.about_intro_image && !introFile && (
                <div className="aau-img-preview">
                  <img src={aboutData.about_intro_image} alt="Intro" />
                  <button type="button" className="aau-del-img-btn" onClick={() => deleteImage('about_intro_image')}>✕ Remove</button>
                </div>
              )}
              {introFile && (
                <div className="aau-img-preview">
                  <img src={URL.createObjectURL(introFile)} alt="New Intro" />
                  <button type="button" className="aau-del-img-btn" onClick={() => setIntroFile(null)}>✕ Cancel</button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => setIntroFile(e.target.files[0] || null)}
              />
            </div>
          </div>

          <div className="aau-field">
            <label>Management Section Title</label>
            <input
              type="text"
              value={aboutData.mgmt_title || ''}
              onChange={e => setAboutData(prev => ({ ...prev, mgmt_title: e.target.value }))}
              placeholder="Management Behind Dharti Amrut"
            />
          </div>

          <button type="submit" className="aau-save-btn" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save About Section'}
          </button>
        </form>
      )}

      {/* ---- INFRASTRUCTURE TAB ---- */}
      {activeSection === 'infra' && (
        <form onSubmit={saveSection} className="aau-form">
          <div className="aau-section-title">Infrastructure Section</div>

          <div className="aau-field">
            <label>Infrastructure Section Title</label>
            <input
              type="text"
              value={aboutData.infra_title || ''}
              onChange={e => setAboutData(prev => ({ ...prev, infra_title: e.target.value }))}
              placeholder="Infrastructure"
            />
          </div>

          <div className="aau-field">
            <label>Infrastructure Description</label>
            <textarea
              rows={5}
              value={aboutData.infra_description || ''}
              onChange={e => setAboutData(prev => ({ ...prev, infra_description: e.target.value }))}
              placeholder="Describe your infrastructure..."
            />
          </div>

          <div className="aau-section-title" style={{ marginTop: '24px' }}>Infrastructure Images (up to 6)</div>
          <div className="aau-infra-grid">
            {[1, 2, 3, 4, 5, 6].map(i => {
              const key = `infra_image_${i}`;
              const localFile = infraFiles[key];
              const existingUrl = aboutData[key];
              return (
                <div key={key} className="aau-infra-slot">
                  <span className="aau-slot-label">Image {i}</span>
                  {localFile ? (
                    <div className="aau-img-preview small">
                      <img src={URL.createObjectURL(localFile)} alt={`Infra ${i} new`} />
                      <button type="button" className="aau-del-img-btn" onClick={() => setInfraFiles(prev => { const c = {...prev}; delete c[key]; return c; })}>✕</button>
                    </div>
                  ) : existingUrl ? (
                    <div className="aau-img-preview small">
                      <img src={existingUrl} alt={`Infra ${i}`} />
                      <button type="button" className="aau-del-img-btn" onClick={() => deleteImage(key)}>✕</button>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) setInfraFiles(prev => ({ ...prev, [key]: file }));
                    }}
                  />
                </div>
              );
            })}
          </div>

          <button type="submit" className="aau-save-btn" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Infrastructure'}
          </button>
        </form>
      )}

      {/* ---- MANAGEMENT TAB ---- */}
      {activeSection === 'management' && (
        <div className="aau-form">
          <div className="aau-section-title">Management Team</div>
          <p className="aau-hint">Add team members. They will auto-scroll on the home page.</p>

          <button className="aau-add-btn" onClick={openAddMember}>+ Add Team Member</button>

          <div className="aau-members-list">
            {members.length === 0 && (
              <p className="aau-empty">No team members yet. Click "Add" to get started.</p>
            )}
            {members.map(m => (
              <div key={m.id} className="aau-member-card">
                {m.member_image
                  ? <img src={m.member_image} alt={m.name} className="aau-member-thumb" />
                  : <div className="aau-member-avatar">{m.name.charAt(0)}</div>
                }
                <div className="aau-member-info">
                  <strong>{m.name}</strong>
                  <span>{m.designation}</span>
                  <p>{(m.bio || '').substring(0, 80)}{(m.bio || '').length > 80 ? '...' : ''}</p>
                </div>
                <div className="aau-member-actions">
                  <button className="aau-edit-btn" onClick={() => openEditMember(m)}>✏️ Edit</button>
                  <button className="aau-delete-btn" onClick={() => deleteMember(m.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Member Modal */}
          {showMemberForm && (
            <div className="aau-modal-overlay" onClick={() => setShowMemberForm(false)}>
              <div className="aau-modal" onClick={e => e.stopPropagation()}>
                <h3>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
                <form onSubmit={saveMember}>
                  <div className="aau-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={memberForm.name}
                      onChange={e => setMemberForm(p => ({ ...p, name: e.target.value }))}
                      required
                      placeholder="e.g. Raj Patel"
                    />
                  </div>
                  <div className="aau-field">
                    <label>Designation *</label>
                    <input
                      type="text"
                      value={memberForm.designation}
                      onChange={e => setMemberForm(p => ({ ...p, designation: e.target.value }))}
                      required
                      placeholder="e.g. Founder & CEO"
                    />
                  </div>
                  <div className="aau-field">
                    <label>Bio / Introduction</label>
                    <textarea
                      rows={5}
                      value={memberForm.bio}
                      onChange={e => setMemberForm(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Write a short biography..."
                    />
                  </div>
                  <div className="aau-field">
                    <label>Display Order</label>
                    <input
                      type="number"
                      min="0"
                      value={memberForm.sort_order}
                      onChange={e => setMemberForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="aau-field">
                    <label>Profile Photo</label>
                    {editingMember?.member_image && !memberImageFile && (
                      <img src={editingMember.member_image} alt="Current" className="aau-member-thumb" style={{ marginBottom: 8, display: 'block' }} />
                    )}
                    {memberImageFile && (
                      <img src={URL.createObjectURL(memberImageFile)} alt="New" className="aau-member-thumb" style={{ marginBottom: 8, display: 'block' }} />
                    )}
                    <input
                      type="file"
                      ref={memberImageRef}
                      accept="image/*"
                      onChange={e => setMemberImageFile(e.target.files[0] || null)}
                    />
                  </div>
                  <div className="aau-modal-actions">
                    <button type="button" className="aau-cancel-btn" onClick={() => setShowMemberForm(false)}>Cancel</button>
                    <button type="submit" className="aau-save-btn" disabled={saving}>
                      {saving ? 'Saving...' : editingMember ? '💾 Update Member' : '✅ Add Member'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- FAQ TAB ---- */}
      {activeSection === 'faq' && (
        <div className="aau-form">
          <div className="aau-section-title">Frequently Asked Questions</div>
          <p className="aau-hint">These Q&As appear in an accordion at the bottom of the About Us section.</p>

          <button className="aau-add-btn" onClick={addFaq}>+ Add Question</button>

          {faqList.length === 0 && (
            <p className="aau-empty" style={{ marginTop: 16 }}>No FAQs yet. Click "Add Question" above.</p>
          )}

          {faqList.map((faq, idx) => (
            <div key={idx} className="aau-faq-item">
              <div className="aau-faq-header">
                <span>FAQ #{idx + 1}</span>
                <button type="button" className="aau-delete-btn" onClick={() => removeFaq(idx)}>🗑️ Remove</button>
              </div>
              <div className="aau-field">
                <label>Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={e => updateFaq(idx, 'question', e.target.value)}
                  placeholder="e.g. What makes Dharti Amrut oil special?"
                />
              </div>
              <div className="aau-field">
                <label>Answer</label>
                <textarea
                  rows={3}
                  value={faq.answer}
                  onChange={e => updateFaq(idx, 'answer', e.target.value)}
                  placeholder="Write the answer here..."
                />
              </div>
            </div>
          ))}

          {faqList.length > 0 && (
            <button className="aau-save-btn" onClick={saveFaqOnly} disabled={saving} type="button">
              {saving ? 'Saving...' : '💾 Save All FAQs'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAboutUs;
