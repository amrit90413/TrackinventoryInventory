import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import InventoryPage from "./InventoryPage";

function WebsiteRedirect() {
  const navigate = useNavigate();
  const { websiteName: paramWebsite } = useParams(); // from /Amrittest
  const [searchParams] = useSearchParams(); // from /?websiteName=Amrittest
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // websiteName from param or query string
        const websiteName =
          paramWebsite || searchParams.get("websiteName") || "Amrittest";

        const res = await fetch(
          `https://trackinventory.ddns.net/api/User/GetUserId?websiteName=${websiteName}`
        );
        const data = await res.json();

        if (data?.userId) {
          // Pass userId in query params + send business in router state
          navigate(
            `/inventory?userId=${data.userId}&skip=0&take=20&sortBy=Newest`,
            { replace: true, state: { business: data } }
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
  }, [navigate, paramWebsite, searchParams]);

  return loading ? <div>Loading...</div> : null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Handles /?websiteName=... */}
        <Route path="/" element={<WebsiteRedirect />} />

        {/* Handles /Amrittest or any /:websiteName */}
        <Route path="/:websiteName" element={<WebsiteRedirect />} />

        {/* Inventory Page */}
        <Route path="/inventory" element={<InventoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
