import React from "react";
import { FaUserCircle, FaAward } from "react-icons/fa";
import "./header.css";

export default function Header({ lang, currentBonus, onProfileClick }) {
  const logoText = lang === "uz" ? "USTA PROFI" : "Профиль специалиста";
  const pointsText = lang === "uz" ? "ball" : "балл";

  return (
    <header className="mobile-app-header">
      <div className="header-container">
        
        {/* 1. Logotip */}
        <div className="header-left">
          <h1 className="header-logo-title">{logoText}</h1>
        </div>

        {/* 2. Bonus chipi va Profil */}
        <div className="header-right">
          
          {/* Bonus ballari bosilganda ham sozlamalarga o'tadi */}
          <div className="header-bonus-chip" onClick={onProfileClick} style={{ cursor: "pointer" }}>
            <div className="bonus-icon-wrapper">
              <FaAward className="bonus-star-icon" />
            </div>
            <span className="bonus-amount-text">
              {currentBonus} <span className="bonus-unit-label">{pointsText}</span>
            </span>
          </div>

          {/* Profil avatarni bosganda sozlamalarga o'tadi */}
          <button 
            className="header-profile-trigger-btn" 
            onClick={onProfileClick}
            aria-label="Profile"
            style={{ cursor: "pointer" }}
          >
            <FaUserCircle className="header-user-avatar-icon" />
          </button>

        </div>

      </div>
    </header>
  );
}