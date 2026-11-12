import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Toast from "../common/Toast";
import SubmissionReviewModal from "../common/SubmissionReviewModal";
import { useApp } from "../../context/AppContext";

export function AppLayout({ children }) {
  const { currentView, currentUser } = useApp();

  // If on login view or not logged in, render clean full-screen view without portal chrome
  if (currentView === "login" || !currentUser) {
    return (
      <main className="min-h-screen bg-slate-50 relative">
        <Toast />
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased relative">
      <Toast />
      <SubmissionReviewModal />
      <Header />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50/70 p-6 md:p-8 lg:p-10">
          <div className="w-full max-w-[1720px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
