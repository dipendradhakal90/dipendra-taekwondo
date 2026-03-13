// frontend/src/routes/AppRoutes.js
import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import PageTransition from "../layout/PageTransition";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { useDarkMode } from "../context/DarkModeContext";

// Admin
import AdminLogin from "../pages/admin/Login";
import Dashboard from "../pages/admin/Dashboard";
import Posts from "../pages/admin/Posts";
import AchievementsAdmin from "../pages/admin/Achievements";
import CertificationsAdmin from "../pages/admin/Certifications";
import GalleryAdmin from "../pages/admin/Gallery";
import Inbox from "../pages/admin/Inbox";
import AdminAbout from "../pages/admin/About";
import AdminProfile from "../pages/admin/Profile";
import CountriesAdmin from "../pages/admin/Countries";
import MediaCoverageAdmin from "../pages/admin/MediaCoverage";

// ✅ Lazy public pages
const Home = lazy(() => import("../pages/public/Home"));
const About = lazy(() => import("../pages/public/About"));
const Achievements = lazy(() => import("../pages/public/Achievements"));
const AchievementDetails = lazy(() => import("../pages/public/AchievementDetails"));
const Certifications = lazy(() => import("../pages/public/Certifications"));
const Gallery = lazy(() => import("../pages/public/Gallery"));
const Updates = lazy(() => import("../pages/public/Updates"));
const PostDetails = lazy(() => import("../pages/public/PostDetails"));
const Contact = lazy(() => import("../pages/public/Contact"));
// removed separate Awards page — awards merged into Certifications
const MediaCoverage = lazy(() => import("../pages/public/MediaCoverage"));

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LoadingScreen() {
  const { isDark } = useDarkMode();
  return (
    <div className={cx("min-h-[60vh] grid place-items-center", isDark ? "text-white/60" : "text-black/60")}>
      Loading…
    </div>
  );
}

export default function AppRoutes() {
  const location = useLocation();

  const withTransition = (element) => (
    <PageTransition>
      <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
    </PageTransition>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={withTransition(<Home />)} />
        <Route path="/about" element={withTransition(<About />)} />
        <Route path="/achievements" element={withTransition(<Achievements />)} />
        <Route path="/achievements/:slug" element={withTransition(<AchievementDetails />)} />
        <Route path="/certifications" element={withTransition(<Certifications />)} />
        <Route path="/gallery" element={withTransition(<Gallery />)} />
        <Route path="/updates" element={withTransition(<Updates />)} />
        <Route path="/updates/:slug" element={withTransition(<PostDetails />)} />
        <Route path="/postdetails/:slug" element={withTransition(<PostDetails />)} />
        {/* Awards page removed — content merged into /certifications */}
        <Route path="/media-coverage" element={withTransition(<MediaCoverage />)} />
        <Route path="/contact" element={withTransition(<Contact />)} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute>
              <Posts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/achievements"
          element={
            <ProtectedRoute>
              <AchievementsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certifications"
          element={
            <ProtectedRoute>
              <CertificationsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute>
              <GalleryAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/about"
          element={
            <ProtectedRoute>
              <AdminAbout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/countries"
          element={
            <ProtectedRoute>
              <CountriesAdmin />
            </ProtectedRoute>
          }
        />
        {/* /admin/awards removed — awards are managed inside /admin/certifications */}
        <Route
          path="/admin/media-coverage"
          element={
            <ProtectedRoute>
              <MediaCoverageAdmin />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={withTransition(
            <ErrorPage />
          )}
        />
      </Routes>
    </AnimatePresence>
  );
}

function ErrorPage() {
  const { isDark } = useDarkMode();
  return (
    <div className={cx("min-h-[60vh] grid place-items-center", isDark ? "text-white/60" : "text-black/60")}>
      Page not found
    </div>
  );
}
