import React, { useState, useEffect } from 'react';
import './ImageSlider.css';

export default function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="slider-wrapper">
      <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="slider-image" />
    </div>
  );
}
