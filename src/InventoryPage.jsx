import React, { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";

const BASE_URL =
  "https://trackinventory.ddns.net/api/Mobile/GetAllInventoryMobilesByUser";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1580910051074-4c9aab67e3e8?auto=format&fit=crop&w=400&q=60";

const STATUS_MAP = {
  0: { label: "Warranty", color: "#10b981" },
  1: { label: "Out of Warranty", color: "#f59e0b" },
  2: { label: "Damaged", color: "#ef4444" },
  3: { label: "Lost", color: "#6b7280" },
  4: { label: "Stolen", color: "#dc2626" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP[0];
  return (
    <span className="status-badge" style={{ background: s.color }}>
      {s.label}
    </span>
  );
};

const ConditionBadge = ({ condition }) => {
  if (!condition) return null;
  const isNew = condition.toLowerCase() === "new";
  return (
    <div className={`condition-badge ${isNew ? 'new' : 'old'}`}>
      {isNew ? '✨ New' : '📦 Old'}
    </div>
  );
};

export default function InventoryPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const business = location.state?.business || null;

  const userId = searchParams.get("userId");
  const skip = Number(searchParams.get("skip") ?? 0);
  const take = Number(searchParams.get("take") ?? 20);
  const sortBy = searchParams.get("sortBy") ?? "Newest";

  const [list, setList] = useState(null);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState(null);
  const [modalSrc, setModalSrc] = useState(null);

  const openModal = (src) => setModalSrc(src);
  const closeModal = () => setModalSrc(null);

  useEffect(() => {
    if (!userId) {
      setErr("No userId in QR code");
      setLoad(false);
      return;
    }
    axios
      .get(BASE_URL, { params: { userId, skip, take, sortBy } })
      .then((res) => setList(res.data))
      .catch(() => setErr("Please scan a valid QR code or try again later."))
      .finally(() => setLoad(false));
  }, [userId, skip, take, sortBy]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-wrapper">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const updateQuery = (newVals) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(newVals).forEach(([k, v]) => p.set(k, v));
    window.location.search = p.toString();
  };

  const sortOptions = [
    "Newest",
    "Oldest",
    "Price ↑",
    "Price ↓",
    "Name A-Z",
    "Name Z-A",
  ];

  function ImageCarousel({ medias }) {
    const [idx, setIdx] = useState(0);
    const len = medias?.length || 0;

    useEffect(() => {
      if (len <= 1) return;
      const t = setInterval(() => setIdx((i) => (i + 1) % len), 3000);
      return () => clearInterval(t);
    }, [len]);

    const next = (e) => {
      e.stopPropagation();
      setIdx((i) => (i + 1) % len);
    };
    const prev = (e) => {
      e.stopPropagation();
      setIdx((i) => (i - 1 + len) % len);
    };
    const currentSrc = len ? medias[idx].original : PLACEHOLDER;

    return (
      <div className="carousel-wrapper">
        <img
          src={currentSrc}
          alt="phone"
          className="carousel-img"
          onClick={() => openModal(currentSrc)}
        />
        {len > 1 && (
          <>
            <button className="carousel-btn prev" onClick={prev}>
              ‹
            </button>
            <button className="carousel-btn next" onClick={next}>
              ›
            </button>
            <div className="carousel-dots">
              {medias.map((_, i) => (
                <span
                  key={i}
                  className={i === idx ? "dot active" : "dot"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdx(i);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="inventory-page">
      {business && (
        <header className="business-header">
          <div className="business-content">
            <div className="business-logo-wrap">
              <img
                src={
                  business.logo ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt="Business Logo"
                className="business-logo"
              />
            </div>
            <div className="business-details">
              <h1>{business.name}</h1>
              <div className="business-info">
                <div className="info-item">
                  <span className="icon">📍</span>
                  <span>{business.address1}, {business.address2}</span>
                </div>
                <div className="info-item">
                  <span className="icon">🌍</span>
                  <span>{business.state}, {business.country}</span>
                </div>
                <div className="info-item">
                  <span className="icon">📞</span>
                  <span>{business.mobileNumber ?? "Not Provided"}</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {list?.mobiles?.length ? (
        <>
          <div className="controls">
            <div className="control-row">
              <select
                value={sortBy}
                onChange={(e) => updateQuery({ sortBy: e.target.value, skip: 0 })}
                className="sort-select"
              >
                {sortOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <div className="result-count">
                {list?.totalCount ?? 0} items
              </div>
            </div>
            <div className="pagination-bar">
              <button
                disabled={skip === 0}
                onClick={() => updateQuery({ skip: Math.max(0, skip - take) })}
                className="page-btn"
              >
                ← Prev
              </button>
              <span className="page-info">
                Page {Math.floor(skip / take) + 1}
              </span>
              <button
                disabled={skip + take >= (list?.totalCount ?? 0)}
                onClick={() => updateQuery({ skip: skip + take })}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="inventory-grid">
            {list.mobiles.map((m) => (
              <div key={m.id} className="mobile-card">
                <ConditionBadge condition={m.condition} />
                <ImageCarousel medias={m.mobileMedias} />
                <div className="card-body">
                  <h3>{m.name}</h3>
                  <div className="meta">
                    {m.storage ?? "N/A"} • {m.color ?? "N/A"}
                  </div>
                  <div className="badges">
                    <StatusBadge status={m.productStatus} />
                    <div className="battery">🔋 {m.batteryHealth}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="center-wrapper">
          <div className="empty-card">
            <div className="empty-icon">📦</div>
            <h2>No Products Found</h2>
            <p>
              Your inventory is empty. Add products to see them here.
            </p>
          </div>
        </div>
      )}

      {modalSrc && (
        <div className="img-modal" onClick={closeModal}>
          <button className="img-modal-close" onClick={closeModal}>✕</button>
          <img src={modalSrc} alt="Full view" className="img-modal-content" />
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        :root {
          --primary: #6366f1;
          --primary-dark: #4f46e5;
          --text: #1f2937;
          --text-light: #6b7280;
          --bg: #f9fafb;
          --card-bg: #ffffff;
          --border: #e5e7eb;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
          --shadow: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04);
          --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
          --radius: 16px;
          --radius-sm: 12px;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        .inventory-page {
          background: var(--bg);
          min-height: 100vh;
          padding: 1rem;
        }
        
        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 1rem;
        }
        
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Business Header */
        .business-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-radius: var(--radius);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-lg);
          color: white;
        }
        
        .business-content {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        
        .business-logo-wrap {
          flex-shrink: 0;
        }
        
        .business-logo {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: 16px;
          border: 3px solid rgba(255,255,255,0.3);
          background: white;
        }
        
        .business-details {
          flex: 1;
          min-width: 0;
        }
        
        .business-details h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }
        
        .business-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.95;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .info-item .icon {
          font-size: 1rem;
          flex-shrink: 0;
        }
        
        /* Controls */
        .controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .control-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        
        .sort-select {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--card-bg);
          font-size: 0.95rem;
          color: var(--text);
          font-weight: 500;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
        
        .result-count {
          font-size: 0.875rem;
          color: var(--text-light);
          font-weight: 500;
          white-space: nowrap;
        }
        
        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: var(--card-bg);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-sm);
        }
        
        .page-btn {
          border: none;
          background: var(--primary);
          color: white;
          padding: 0.625rem 1.25rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s;
          box-shadow: var(--shadow-sm);
        }
        
        .page-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow);
        }
        
        .page-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .page-info {
          font-size: 0.9rem;
          color: var(--text);
          font-weight: 600;
          min-width: 80px;
          text-align: center;
        }
        
        /* Inventory Grid */
        .inventory-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          padding-bottom: 2rem;
        }
        
        .mobile-card {
          background: var(--card-bg);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--border);
          position: relative;
        }
        
        .mobile-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        
        .card-body {
          padding: 1.25rem;
        }
        
        .card-body h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        
        .card-body .meta {
          font-size: 0.875rem;
          color: var(--text-light);
          margin-bottom: 0.75rem;
        }
        
        .badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .status-badge, .battery {
          color: white;
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
          border-radius: 999px;
          font-weight: 600;
          letter-spacing: 0.025em;
        }
        
        .battery {
          background: var(--primary);
        }
        
        /* Condition Badge */
        .condition-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          backdrop-filter: blur(8px);
        }
        
        .condition-badge.new {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
        }
        
        .condition-badge.old {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ea580c 100%);
        }
        
        /* Carousel */
        .carousel-wrapper {
          position: relative;
          width: 100%;
          height: 240px;
          background: #f3f4f6;
          overflow: hidden;
        }
        
        .carousel-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: zoom-in;
          transition: transform 0.3s;
        }
        
        .mobile-card:hover .carousel-img {
          transform: scale(1.05);
        }
        
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        
        .carousel-btn:hover {
          background: rgba(0,0,0,0.8);
          transform: translateY(-50%) scale(1.1);
        }
        
        .carousel-btn.prev { left: 12px; }
        .carousel-btn.next { right: 12px; }
        
        .carousel-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 2;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .dot.active {
          background: white;
          width: 24px;
          border-radius: 4px;
        }
        
        /* Modal */
        .img-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
          padding: 1rem;
        }
        
        .img-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          background: rgba(255,255,255,0.1);
          border: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 10000;
        }
        
        .img-modal-close:hover {
          background: rgba(255,255,255,0.2);
          transform: rotate(90deg);
        }
        
        .img-modal-content {
          max-width: 90%;
          max-height: 90%;
          border-radius: 12px;
          animation: scaleUp 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        /* Empty & Error States */
        .center-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem;
        }
        
        .empty-card, .error-card {
          background: var(--card-bg);
          padding: 3rem 2rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          text-align: center;
          max-width: 400px;
        }
        
        .empty-icon, .error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.8;
        }
        
        .empty-card h2, .error-card h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.75rem;
        }
        
        .empty-card p, .error-card p {
          color: var(--text-light);
          font-size: 1rem;
          line-height: 1.6;
        }
        
        /* Mobile Responsive */
        @media (max-width: 640px) {
          .inventory-page {
            padding: 0.75rem;
          }
          
          .business-header {
            padding: 1.25rem;
          }
          
          .business-logo {
            width: 64px;
            height: 64px;
          }
          
          .business-details h1 {
            font-size: 1.25rem;
          }
          
          .business-info {
            font-size: 0.8rem;
          }
          
          .inventory-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .carousel-wrapper {
            height: 220px;
          }
          
          .control-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .result-count {
            text-align: center;
          }
          
          .pagination-bar {
            flex-wrap: wrap;
          }
          
          .page-btn {
            flex: 1;
            min-width: 100px;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .inventory-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1025px) {
          .inventory-page {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
          }
          
          .inventory-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}