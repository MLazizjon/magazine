import React from "react";
import { FaChartBar, FaKey, FaGift, FaCogs, FaSignOutAlt } from "react-icons/fa"; // 🎁 FaGift ikonasi qo'shildi
import "./sidebar.css";

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  setShowLogoutModal, 
  currentUser 
}) {
  return (
    <aside className="dash-sidebar">
      
      {/* 💻 FAQAT DESKTOPDA KO'RINADIGAN TEPPA QISM */}
      <div className="sidebar-top-section">
        {/* 💎 Logotip qismi */}
        <div className="sidebar-logo">
          <div className="logo-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <div className="logo-text">
            <h2>USTA PANEL</h2>
            <span>USTALAR BAZASI</span>
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATSIYA MENYUSI (Kompyuterda vertikal, telefonda gorizontal bottom-bar bo'ladi) */}
      <nav className="sidebar-menu">
        <button 
          className={`menu-item ${activeTab === "home" ? "active" : ""}`} 
          onClick={() => setActiveTab("home")}
        >
          <div className="icon-wrapper">
            <FaChartBar className="icon" />
          </div>
          <span>Panel</span>
          {activeTab === "home" && <span className="active-indicator" />}
        </button>

        <button 
          className={`menu-item ${activeTab === "code" ? "active" : ""}`} 
          onClick={() => setActiveTab("code")}
        >
          <div className="icon-wrapper">
            <FaKey className="icon" />
          </div>
          <span>Kod kiritish</span>
          {activeTab === "code" && <span className="active-indicator" />}
        </button>

        {/* 🎁 YANGI: MAGAZIN (SOVG'ALAR DO'KONI) TUGMASI */}
        <button 
          className={`menu-item ${activeTab === "magazin" ? "active" : ""}`} 
          onClick={() => setActiveTab("magazin")}
        >
          <div className="icon-wrapper">
            <FaGift className="icon" />
          </div>
          <span>Magazin</span>
          {activeTab === "magazin" && <span className="active-indicator" />}
        </button>

        <button 
          className={`menu-item ${activeTab === "settings" ? "active" : ""}`} 
          onClick={() => setActiveTab("settings")}
        >
          <div className="icon-wrapper">
            <FaCogs className="icon" />
          </div>
          <span>Sozlamalar</span>
          {activeTab === "settings" && <span className="active-indicator" />}
        </button>

        {/* 📱 FAQAT MOBILDA BOTTOM BAR ICHIDA CHIQADIGAN CHIQISH TUGMASI */}
        <button className="menu-item mobile-logout-btn" onClick={() => setShowLogoutModal(true)}>
          <div className="icon-wrapper">
            <FaSignOutAlt className="icon" />
          </div>
          <span>Chiqish</span>
        </button>
      </nav>

      {/* 👤 FAQAT DESKTOPDA KO'RINADIGAN PROFIL KARTASI */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">
            <span>{currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "U"}</span>
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser?.full_name || "Usta"}</span>
            <span className="user-role">Usta</span>
          </div>
          <button className="sidebar-logout-shortcut" onClick={() => setShowLogoutModal(true)} title="Chiqish">
            <FaSignOutAlt />
          </button>
        </div>
      </div>

    </aside>
  );
}