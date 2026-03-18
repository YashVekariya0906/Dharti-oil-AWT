import { useState, useEffect } from 'react';
import './nav_update.css';

export default function NavUpdate() {
  const [formData, setFormData] = useState({
    logo: '',
    image1: '',
    image2: '',
    image3: '',
    image4: '',
    image5: '',
  });

  const [fileInputs, setFileInputs] = useState({
    logo: null,
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing navbar data
  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/navbar');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            logo: data.logo || '',
            image1: data.image1 || '',
            image2: data.image2 || '',
            image3: data.image3 || '',
            image4: data.image4 || '',
            image5: data.image5 || '',
          });
        }
      } catch (error) {
        console.error('Error fetching navbar data:', error);
        setMessage('Error loading navbar data');
      } finally {
        setLoading(false);
      }
    };

    fetchNavbarData();
  }, []);

  // Handle file input changes
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFileInputs((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const updatedData = { ...formData };

      // Convert file inputs to base64 if files are selected
      for (const [fieldName, file] of Object.entries(fileInputs)) {
        if (file) {
          const base64 = await fileToBase64(file);
          updatedData[fieldName] = base64;
        }
      }

      const response = await fetch('http://localhost:5000/api/navbar/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Navbar updated successfully!');
        setFileInputs({
          logo: null,
          image1: null,
          image2: null,
          image3: null,
          image4: null,
          image5: null,
        });
        // Refresh data
        const navbarResponse = await fetch('http://localhost:5000/api/navbar');
        if (navbarResponse.ok) {
          const navbarData = await navbarResponse.json();
          setFormData({
            logo: navbarData.logo || '',
            image1: navbarData.image1 || '',
            image2: navbarData.image2 || '',
            image3: navbarData.image3 || '',
            image4: navbarData.image4 || '',
            image5: navbarData.image5 || '',
          });
        }
      } else {
        setMessage('Failed to update navbar');
      }
    } catch (error) {
      console.error('Error updating navbar:', error);
      setMessage('Error updating navbar data');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="nav-update-container"><p>Loading...</p></div>;
  }

  return (
    <div className="nav-update-container">
      <div className="nav-update-form-wrapper">
        <h2>Update Navbar</h2>
        
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="nav-update-form">
          {/* Logo Field */}
          <div className="form-group">
            <label htmlFor="logo">Logo Image</label>
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'logo')}
            />
            {fileInputs.logo && (
              <p className="file-name">Selected: {fileInputs.logo.name}</p>
            )}
            {formData.logo && !fileInputs.logo && (
              <p className="current-file">Current: {formData.logo.substring(0, 50)}...</p>
            )}
          </div>

          {/* Image 1 Field */}
          <div className="form-group">
            <label htmlFor="image1">Image 1</label>
            <input
              type="file"
              id="image1"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image1')}
            />
            {fileInputs.image1 && (
              <p className="file-name">Selected: {fileInputs.image1.name}</p>
            )}
            {formData.image1 && !fileInputs.image1 && (
              <p className="current-file">Current: {formData.image1.substring(0, 50)}...</p>
            )}
          </div>

          {/* Image 2 Field */}
          <div className="form-group">
            <label htmlFor="image2">Image 2</label>
            <input
              type="file"
              id="image2"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image2')}
            />
            {fileInputs.image2 && (
              <p className="file-name">Selected: {fileInputs.image2.name}</p>
            )}
            {formData.image2 && !fileInputs.image2 && (
              <p className="current-file">Current: {formData.image2.substring(0, 50)}...</p>
            )}
          </div>

          {/* Image 3 Field */}
          <div className="form-group">
            <label htmlFor="image3">Image 3</label>
            <input
              type="file"
              id="image3"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image3')}
            />
            {fileInputs.image3 && (
              <p className="file-name">Selected: {fileInputs.image3.name}</p>
            )}
            {formData.image3 && !fileInputs.image3 && (
              <p className="current-file">Current: {formData.image3.substring(0, 50)}...</p>
            )}
          </div>

          {/* Image 4 Field */}
          <div className="form-group">
            <label htmlFor="image4">Image 4</label>
            <input
              type="file"
              id="image4"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image4')}
            />
            {fileInputs.image4 && (
              <p className="file-name">Selected: {fileInputs.image4.name}</p>
            )}
            {formData.image4 && !fileInputs.image4 && (
              <p className="current-file">Current: {formData.image4.substring(0, 50)}...</p>
            )}
          </div>

          {/* Image 5 Field */}
          <div className="form-group">
            <label htmlFor="image5">Image 5</label>
            <input
              type="file"
              id="image5"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image5')}
            />
            {fileInputs.image5 && (
              <p className="file-name">Selected: {fileInputs.image5.name}</p>
            )}
            {formData.image5 && !fileInputs.image5 && (
              <p className="current-file">Current: {formData.image5.substring(0, 50)}...</p>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Navbar'}
          </button>
        </form>

        <p className="note">Note: All fields are optional. Only selected files will be updated.</p>
      </div>
    </div>
  );
}
