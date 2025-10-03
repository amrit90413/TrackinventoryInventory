import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import InventoryPage from './InventoryPage';

function WebsiteRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // get websiteName from query params (ex: /?websiteName=Amrittest)
        const websiteName = searchParams.get("websiteName") || "Amrittest";

        const res = await fetch(
          `https://trackinventory.ddns.net/api/User/GetUserId?websiteName=${websiteName}`
        );
        const data = await res.json();

        if (data?.userId) {
          // redirect to inventory with skip/take/sort
          navigate(
            `/inventory?userId=${data.userId}&skip=0&take=20&sort= `,
            { replace: true }
          );
        } else {
          console.error("User not found for websiteName:", websiteName);
          navigate("/inventory?userId=not-found", { replace: true });
        }
      } catch (err) {
        console.error("Error fetching userId:", err);
        navigate("/inventory?userId=error", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, [navigate, searchParams]);

  return loading ? <div>Loading...</div> : null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Instead of hardcoding, use WebsiteRedirect */}
        <Route path="/" element={<WebsiteRedirect />} />

        {/* 2. Your real inventory route */}
        <Route path="/inventory" element={<InventoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
