import React, { useState, useEffect } from 'react';

export default function ProductCard({ name, price, images }) {
  const [idx, setIdx] = useState(0);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);

  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <>
      <div className="product-card">
        <div className="img-wrapper">
          <img
            src={images[idx]}
            alt={name}
            onClick={() => setModal(true)}
          />
          <button className="carousel-btn prev" onClick={prev}>&#10094;</button>
          <button className="carousel-btn next" onClick={next}>&#10095;</button>
        </div>

        <div className="details">
          <div className="name">{name}</div>
          <div className="price">{price}</div>
          <button className="add-to-cart">Add to Cart</button>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <span className="modal-close">&times;</span>
          <img
            className="modal-img"
            src={images[idx]}
            alt={name}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}