import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import PublicLayout from "./layout/PublicLayout";
import RouteProgress from "./components/common/RouteProgress";
import ScrollToTop from "./components/common/ScrollToTop";
import { DarkModeProvider } from "./context/DarkModeContext";

export default function App() {
  return (
    <DarkModeProvider>
      <HelmetProvider>
        <BrowserRouter>
          <RouteProgress />
          <PublicLayout>
            <ScrollToTop />
            <AppRoutes />
          </PublicLayout>
          <Toaster position="top-right" />
        </BrowserRouter>
      </HelmetProvider>
    </DarkModeProvider>
  );
}
