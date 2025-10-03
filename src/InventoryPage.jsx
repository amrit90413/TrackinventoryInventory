import React, { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";

const BASE_URL =
  "https://trackinventory.ddns.net/api/Mobile/GetAllInventoryMobilesByUser";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1580910051074-4c9aab67e3e8?auto=format&fit=crop&w=400&q=60";

/* ---------- status badge helpers ---------- */
const STATUS_MAP = {
  0: { label: "Warranty", color: "#22c55e" }, // green
  1: { label: "Out of Warranty", color: "#f59e0b" }, // amber
  2: { label: "Damaged", color: "#ef4444" }, // red
  3: { label: "Lost", color: "#6b7280" }, // grey
  4: { label: "Stolen", color: "#dc2626" }, // dark red
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP[0];
  return (
    <span className="status-badge" style={{ background: s.color }}>
      {s.label}
    </span>
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

  if (loading) return <p style={{ textAlign: "center" }}>Loading…</p>;

  if (error) {
    return (
      <div className="center-wrapper">
        <div className="error-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/463/463612.png"
            alt="Error"
          />
          <h2>Error</h2>
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

  /* -------- IMAGE CAROUSEL -------- */
  function ImageCarousel({ medias }) {
    const [idx, setIdx] = useState(0);
    const len = medias?.length || 0;

    useEffect(() => {
      if (len <= 1) return;
      const t = setInterval(() => setIdx((i) => (i + 1) % len), 3000);
      return () => clearInterval(t);
    }, [len]);

    const next = () => setIdx((i) => (i + 1) % len);
    const prev = () => setIdx((i) => (i - 1 + len) % len);
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
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  /* -------- RENDER -------- */
  return (
    <div className="inventory-page">
      {/* ✅ Business header with logo on right, details on left */}
      {business && (
        <header className="business-header">
          {/* Left side - details */}
          <div className="business-details">
            <h1>{business.name}</h1>
            <p><b>Address:</b> {business.address1}, {business.address2}</p>
            <p>
              <b>State:</b> {business.state}, <b>Country:</b> {business.country}
            </p>
            <p><b>📞</b> {business.mobileNumber ?? "Not Provided"}</p>
          </div>

          {/* Right side - logo */}
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
        </header>
      )}

      {list?.mobiles?.length ? (
        <>
          <div className="controls">
            <div className="pagination-bar">
              <button
                disabled={skip === 0}
                onClick={() => updateQuery({ skip: Math.max(0, skip - take) })}
              >
                Prev
              </button>
              <span>
                Page {Math.floor(skip / take) + 1} (total{" "}
                {list?.totalCount ?? 0})
              </span>
              <button
                disabled={skip + take >= (list?.totalCount ?? 0)}
                onClick={() => updateQuery({ skip: skip + take })}
              >
                Next
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => updateQuery({ sortBy: e.target.value, skip: 0 })}
            >
              {sortOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="inventory-grid">
            {list.mobiles.map((m) => (
              <div key={m.id} className="mobile-card">
                <ImageCarousel medias={m.mobileMedias} />
                <div className="card-body">
                  <h3>{m.name}</h3>
                  <div className="meta">
                    {m.storage ?? "N/A"} - {m.color ?? "N/A"}
                  </div>
                  <div className="badges">
                    <StatusBadge status={m.productStatus} />
                    <div className="battery">{m.batteryHealth}% battery</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="center-wrapper">
          <div className="empty-card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="Empty inventory"
            />
            <h2>No Product Found</h2>
            <p>
              Your inventory looks empty. Please add Product to see them here.
            </p>
          </div>
        </div>
      )}

      {/* full-screen modal */}
      {modalSrc && (
        <div className="img-modal" onClick={closeModal}>
          <span className="img-modal-close">&times;</span>
          <img src={modalSrc} alt="Full view" className="img-modal-content" />
        </div>
      )}

      <style>{`
        :root{
          --radius:12px;--shadow:0 2px 8px rgba(0,0,0,.08);--shadow-hover:0 4px 16px rgba(0,0,0,.12);
          --primary:#1976d2;--text:#212121;--text-light:#757575;--bg:#f5f5f5;--card-bg:#ffffff;
        }
        .inventory-page{background:var(--bg);min-height:100vh;padding:1rem}
        
        /* ---- business header ---- */
        .business-header{display:flex;justify-content:space-between;align-items:center;background:#fff;border-radius:var(--radius);padding:1.5rem 2rem;margin-bottom:2rem;box-shadow:var(--shadow)}
        .business-details{flex:1}
        .business-details h1{margin:0;font-size:1.6rem;color:var(--primary)}
        .business-details p{margin:.2rem 0;color:var(--text-light)}
        .business-logo-wrap{flex-shrink:0}
        .business-logo{width:80px;height:80px;object-fit:cover;border-radius:50%;border:2px solid var(--primary)}
        
        .controls{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:1rem}
        .pagination-bar{display:flex;align-items:center;gap:.8rem}
        .pagination-bar button{border:1px solid var(--primary);background:#fff;color:var(--primary);padding:.4rem 1rem;border-radius:var(--radius);cursor:pointer;transition:background .2s,color .2s}
        .pagination-bar button:hover:not(:disabled){background:var(--primary);color:#fff}
        .pagination-bar button:disabled{opacity:.4;cursor:not-allowed}
        select{padding:.4rem .6rem;border-radius:var(--radius);border:1px solid #ccc;background:#fff}
        
        .inventory-grid{display:grid;gap:1.5rem;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
        .mobile-card{background:var(--card-bg);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;transition:transform .2s,box-shadow .2s;display:flex;flex-direction:column}
        .mobile-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-hover)}
        .card-body{padding:1rem 1.25rem 1.25rem;flex:1;display:flex;flex-direction:column;justify-content:space-between}
        .card-body h3{font-size:1.1rem;font-weight:600;color:var(--text);margin:0 0 .5rem}
        .card-body .meta{font-size:.9rem;color:var(--text-light);margin-bottom:.5rem}
        .badges{display:flex;align-items:center;gap:.5rem;margin-top:.4rem;flex-wrap:wrap}
        .status-badge{color:#fff;font-size:.7rem;padding:.2rem .5rem;border-radius:999px;font-weight:500}
        .battery{background:var(--primary);color:#fff;font-size:.7rem;padding:.2rem .5rem;border-radius:999px;font-weight:500}

        /* ---- carousel ---- */
        .carousel-wrapper{position:relative;width:100%;height:200px}
        .carousel-img{width:100%;height:100%;object-fit:cover;background:#e0e0e0;cursor:zoom-in}
        .carousel-btn{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.45);color:#fff;border:none;width:32px;height:32px;border-radius:50%;font-size:20px;cursor:pointer;transition:background .2s}
        .carousel-btn:hover{background:rgba(0,0,0,.65)}
        .carousel-btn.prev{left:10px}
        .carousel-btn.next{right:10px}
        .carousel-dots{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:6px}
        .dot{width:10px;height:10px;border-radius:50%;background:#fff;opacity:.5;cursor:pointer}
        .dot.active{opacity:1}

        /* ---- modal ---- */
        .img-modal{position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:999;animation:fadeIn .3s ease}
        .img-modal-close{position:absolute;top:24px;right:32px;color:#fff;font-size:36px;cursor:pointer;line-height:1}
        .img-modal-content{max-width:90%;max-height:90%;border-radius:8px;animation:scaleUp .3s ease}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleUp{from{transform:scale(.9);opacity:.8}to{transform:scale(1);opacity:1}}

        /* ---- empty + error cards ---- */
        .center-wrapper{display:flex;align-items:center;justify-content:center;min-height:70vh}
        .empty-card,.error-card{background:#fff;padding:3rem 2rem;border-radius:var(--radius);box-shadow:var(--shadow);text-align:center;max-width:400px}
        .empty-card img,.error-card img{width:120px;height:120px;opacity:.7;margin-bottom:1rem}
        .empty-card h2,.error-card h2{margin:0 0 .5rem;font-size:1.3rem;color:var(--text)}
        .empty-card p,.error-card p{margin:0;color:var(--text-light);font-size:.95rem;text-align:center}
      `}</style>
    </div>
  );
}
