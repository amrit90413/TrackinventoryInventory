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
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function WebsiteRedirect() {
  const navigate = useNavigate();
  const { websiteName: paramWebsite } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const websiteName =
          paramWebsite || searchParams.get("websiteName") || "Amrittest";

        const res = await fetch(
          `https://trackinventory.ddns.net/api/User/GetUserId?websiteName=${encodeURIComponent(
            websiteName
          )}`
        );
        const data = await res.json();

        if (data?.userId) {
          // ✅ NO query string
          navigate("/inventory", {
            replace: true,
            state: { business: data, userId: data.userId },
          });
        } else {
          navigate("/inventory", { replace: true, state: { userId: null } });
        }
      } catch (err) {
        console.error(err);
        navigate("/inventory", { replace: true, state: { userId: null } });
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
        <Route path="/" element={<WebsiteRedirect />} />
        <Route path="/:websiteName" element={<WebsiteRedirect />} />
        <Route path="/inventory" element={<InventoryPage />} />
      </Routes>
    </BrowserRouter>
  );
};
