import React, { useState } from "react";
import { FaChevronLeft, FaPen, FaUser, FaHeadset, FaChevronDown } from "react-icons/fa";
import "./setting.css";

export default function SettingsTab({
  currentUser,
  editName,
  setEditName,
  editRegion,
  setEditRegion,
  saveLoading,
  handleSaveProfile,
  onBack // Profil paneliga (drawer) qaytish uchun funksiya
}) {
  const [editDistrict, setEditDistrict] = useState("");

  return (
    <div className="mobile-profile-settings-page">
      
      {/* 📋 YUQORI NAVIGATSIYA HEADERIS */}
      <header className="profile-settings-header">
        {/* Tugma bosilganda profilingizga (Drawer) silliq qaytadi */}
        <button className="settings-back-circle-btn" onClick={onBack} title="Назад в профиль">
          <FaChevronLeft size={16} />
        </button>
        <h2 className="settings-title">Мой профиль</h2>
        <button 
          className="settings-save-text-btn" 
          onClick={handleSaveProfile} 
          disabled={saveLoading}
        >
          {saveLoading ? "..." : "Сохранить"}
        </button>
      </header>

      {/* 👤 AVATAR EDIT QISMI */}
      <div className="settings-avatar-wrapper">
        <div className="settings-avatar-circle">
          <FaUser size={50} className="default-avatar-icon" />
          <button className="avatar-edit-badge" title="Изменить фото">
            <FaPen size={10} />
          </button>
        </div>
      </div>

      {/* 📝 BLOKLAR VA INPUTLAR FORMALARI */}
      <div className="settings-form-body">
        
        {/* Регион */}
        <div className="settings-input-group">
          <label className="settings-input-label">Регион</label>
          <div className="settings-select-container">
            <select 
              value={editRegion} 
              onChange={(e) => setEditRegion(e.target.value)}
              className="settings-custom-select"
            >
              <option value="Самаркандская обл.">Самаркандская обл.</option>
              <option value="Ташкент">Ташкент</option>
              <option value="Бухара">Бухара</option>
            </select>
            <div className="select-arrow-divider">
              <span className="divider-line">|</span>
              <FaChevronDown className="select-arrow-icon" />
            </div>
          </div>
        </div>

        {/* Район */}
        <div className="settings-input-group">
          <label className="settings-input-label">Район</label>
          <div className="settings-select-container">
            <select 
              value={editDistrict} 
              onChange={(e) => setEditDistrict(e.target.value)}
              className="settings-custom-select"
            >
              <option value="">Район</option>
              <option value="Самарканд">Самарканд г.</option>
              <option value="Пастдаргом">Пастдаргом</option>
            </select>
            <div className="select-arrow-divider">
              <span className="divider-line">|</span>
              <FaChevronDown className="select-arrow-icon" />
            </div>
          </div>
        </div>

        {/* Фамилия и Имя */}
        <div className="settings-input-group">
          <label className="settings-input-label">Фамилия и Имя</label>
          <input 
            type="text" 
            className="settings-custom-input" 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Введите имя"
          />
        </div>

        {/* Номер реферала */}
        <div className="settings-input-group">
          <label className="settings-input-label">Номер реферала</label>
          <div className="settings-referral-box">
            <div className="referral-icon-container">
              <FaHeadset size={20} className="referral-headset-icon" />
            </div>
            <span className="referral-phone-text">
              {currentUser?.phone || "+998902700901"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}