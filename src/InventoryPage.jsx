import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";   // ✅ no useSearchParams
import axios from "axios";
import "./InventoryPage.css";

/* ---------- constants ---------- */
const BASE_URL =
  "https://trackinventory.ddns.net/api/Mobile/GetAllInventoryMobilesByUser";
const DETAIL_API =
  "http://34.131.176.90:7001/api/Mobile/GetProductByIdWithoutToken";
const COMPANY_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCUHr8kY0k778Vrtzs0xbWoGd8ypDsvwt2wizlwcJFYmSZfzDqXn1d-hWQyUScKb6muP8eFeywMZFH5UwafS__IV7746qYBOgxQCo3g_oI3Kbb77nBeMygS-bsDquZr5RLj0UAlqbZ3exx1VI_-PA7pnkotlrBE44n4fP8SQJ52ouunQQGErHoH6GNmtKcKHunbouiHfkbYlChiIF-DiGDspAET72XpJEkv8hJ7Kep2pE8xbQp_gdYlk8OePSXdJbMF_OQS2AKZlTw";

const STATUS_MAP = {
  0: { label: "Warranty", color: "#10b981" },
  1: { label: "Out of Warranty", color: "#f59e0b" },
  2: { label: "Damaged", color: "#ef4444" },
  3: { label: "Lost", color: "#6b7280" },
  4: { label: "Stolen", color: "#dc2626" },
};

const sortOptions = [
  "Newest",
  "Oldest",
  "Price ↑",
  "Price ↓",
  "Name A-Z",
  "Name Z-A",
];

/* ---------- component ---------- */
export default function InventoryPage() {
  const { state } = useLocation();          // ← router state only
  const business = state?.business || null;
  const userId   = state?.userId;           // ← never in URL

  const [skip, setSkip]     = useState(0);
  const [take]              = useState(15);
  const [sortBy, setSortBy] = useState("Newest");

  const [list, setList]           = useState(null);
  const [loading, setLoad]        = useState(true);
  const [error, setErr]           = useState(null);
  const [searchQuery, setSearchQuery]         = useState("");
  const [filterCondition, setFilterCondition] = useState("all");

  // modal
  const [modalOpen, setModalOpen]           = useState(false);
  const [modalProduct, setModalProduct]     = useState(null);
  const [modalLoading, setModalLoading]     = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* fetch inventory */
  useEffect(() => {
    if (!userId) { setErr("No userId provided"); setLoad(false); return; }

    axios.post(BASE_URL, { userId, skip, take, sortBy })
         .then(res => setList(res.data))
         .catch(() => setErr("Failed to load inventory"))
         .finally(() => setLoad(false));
  }, [userId, skip, take, sortBy]);

  /* modal helpers */
  const openProductModal = async (productId) => {
    setModalOpen(true); setModalLoading(true); setCurrentImageIndex(0);
    try {
      const res = await axios.get(`${DETAIL_API}?id=${productId}`);
      setModalProduct(res.data);
    } catch {
      setModalProduct(null);
    } finally {
      setModalLoading(false);
    }
  };
  const closeModal = () => { setModalOpen(false); setModalProduct(null); setCurrentImageIndex(0); };

  /* filters */
  const filteredProducts = list?.mobiles?.filter(m => {
    const matchesSearch  = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter  = filterCondition === "all" || m.condition?.toLowerCase() === filterCondition;
    return matchesSearch && matchesFilter;
  }) || [];

  const getStatusInfo = st => STATUS_MAP[st] || STATUS_MAP[0];

  /* render */
  if (loading) return (
    <div className="loading-container"><div className="spinner"></div><p>Loading inventory…</p></div>
  );

  return (
    <div className="inventory-container">
      <div className="content-wrapper">
        {/* ---- header ---- */}
        <header className="company-header">
          <div className="header-content">
            <img src={business?.logo || COMPANY_LOGO} alt="Company Logo" className="company-logo" />
            <div className="company-info">
              <h1 className="company-name">{business?.name || "QuantumLeap Tech"}</h1>
              <p className="company-tagline">Innovative solutions for modern Inventory.</p>
            </div>
          </div>
          <div className="header-divider"></div>
          <div className="contact-info">
            <div className="contact-item"><span className="icon">📍</span><span>{business ? `${business.address1}, ${business.state}` : "Innovate City, CA"}</span></div>
            <div className="contact-item"><span className="icon">📞</span><span>{business?.mobileNumber || "+1 (555) 123-4567"}</span></div>
          </div>
        </header>

        {/* ---- main ---- */}
        <main className="main-content">
          <div className="search-section">
            <div className="search-wrapper"><span className="search-icon">🔍</span>
              <input type="text" placeholder="Search for products…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="search-input" />
            </div>
            <div className="filter-row">
              <p className="item-count">{filteredProducts.length} items found</p>
              <div className="filters-group">
                <select value={sortBy} onChange={e => { setSortBy(e.target.value); setSkip(0); }} className="filter-select">
                  {sortOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={filterCondition} onChange={e => setFilterCondition(e.target.value)} className="filter-select">
                  <option value="all">All Conditions</option>
                  <option value="new">New</option>
                  <option value="old">Old</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="empty-state">
              <div className="empty-icon error">⚠️</div><h2>Something Went Wrong</h2>
              <p>We couldn't load the inventory. Please try again.</p>
              <button onClick={() => window.location.reload()} className="retry-button"><span>🔄</span> Retry</button>
            </div>
          )}

          {!error && filteredProducts.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📦</div><h2>No Items Found</h2>
              <p>There are currently no items matching your search.</p>
            </div>
          )}

          {!error && filteredProducts.length > 0 && (
            <>
              <div className="product-grid">
                {filteredProducts.map(m => {
                  const isNew = m.condition?.toLowerCase() === "new";
                  const imageUrl = m.mobileMedias?.[0]?.original || m.mobileMedias?.[0]?.thumb_100;
                  return (
                    <div key={m.id} className="product-card" onClick={() => openProductModal(m.id)}>
                      <div className={`condition-badge ${isNew ? "new" : "old"}`}>{isNew ? "New" : "Old"}</div>
                      <div className="product-image" style={{ backgroundImage: `url('${imageUrl}')` }}></div>
                      <div className="product-details">
                        <h3 className="product-name">{m.name}</h3>
                        <p className="product-specs">{m.color || "N/A"}, {m.storage || "N/A"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pagination">
                <div className="pagination-mobile">
                  <button onClick={() => setSkip(s => Math.max(0, s - take))} disabled={skip === 0} className="pagination-button">Previous</button>
                  <button onClick={() => setSkip(s => s + take)} disabled={skip + take >= (list?.totalCount ?? 0)} className="pagination-button">Next</button>
                </div>
                <div className="pagination-desktop">
                  <p className="pagination-info">Showing <span>{skip + 1}</span> to <span>{Math.min(skip + take, list?.totalCount || 0)}</span> of <span>{list?.totalCount || 0}</span> results</p>
                  <nav className="pagination-nav">
                    <button onClick={() => setSkip(s => Math.max(0, s - take))} disabled={skip === 0} className="nav-button left">‹</button>
                    <span className="page-indicator">Page {Math.floor(skip / take) + 1} of {Math.ceil((list?.totalCount || 0) / take)}</span>
                    <button onClick={() => setSkip(s => s + take)} disabled={skip + take >= (list?.totalCount ?? 0)} className="nav-button right">›</button>
                  </nav>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ---- modal ---- */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {modalLoading ? (
              <div className="modal-loading"><div className="spinner"></div><p>Loading product details…</p></div>
            ) : modalProduct ? (
              <>
                <header className="modal-header">
                  <button onClick={closeModal} className="back-button">‹</button>
                  <h1 className="modal-title">Product Details</h1><div className="spacer"></div>
                </header>

                <div className="modal-body">
                  <div className="carousel-container">
                    <div className="carousel-images">
                      {modalProduct.mobileMedias?.map((media, idx) => (
                        <div key={media.id} className="carousel-item" style={{ backgroundImage: `url('${media.original}')`, transform: `translateX(-${currentImageIndex * 100}%)` }}></div>
                      ))}
                    </div>
                    <div className="carousel-dots">
                      {modalProduct.mobileMedias?.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`dot ${idx === currentImageIndex ? "active" : ""}`}></button>
                      ))}
                    </div>
                  </div>

                  <div className="product-info">
                    <div className="info-header">
                      <div>
                        <h2 className="product-title">{modalProduct.name}</h2>
                        <p className="product-subtitle">{modalProduct.color || "N/A"}, {modalProduct.storage || "N/A"}</p>
                      </div>
                      <span className="warranty-badge" style={{ backgroundColor: `${getStatusInfo(modalProduct.productStatus).color}15`, color: getStatusInfo(modalProduct.productStatus).color }}>
                        {getStatusInfo(modalProduct.productStatus).label}
                      </span>
                    </div>

                    <div className="info-section">
                      <h3 className="section-title">Description</h3>
                      <p className="section-text">{modalProduct.description || "This product is in good condition with minor cosmetic wear. It has been fully tested and is in perfect working order."}</p>
                    </div>

                    <div className="info-grid">
                      <div className="info-card"><p className="info-label">Condition</p><p className="info-value">{modalProduct.condition || "N/A"}</p></div>
                      <div className="info-card"><p className="info-label">Quantity</p><p className="info-value">{modalProduct.quantity || 0}</p></div>
                      <div className="info-card"><p className="info-label">Color</p><p className="info-value">{modalProduct.color || "N/A"}</p></div>
                      <div className="info-card"><p className="info-label">Battery Health</p><p className="info-value">{modalProduct.batteryHealth || 0}%</p></div>
                    </div>
                  </div>
                </div>

                <footer className="modal-footer">
                  <button className="contact-button">Contact Seller</button>
                  <div className="action-buttons">
                    <button className="icon-button">📤</button>
                    <button className="icon-button">📞</button>
                    <button className="icon-button">💬</button>
                  </div>
                </footer>
              </>
            ) : (
              <div className="modal-error"><p>Failed to load product details</p><button onClick={closeModal} className="retry-button">Close</button></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}