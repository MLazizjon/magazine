import React, { useState, useEffect } from "react";
import { 
  FiGlobe, FiSettings, FiLogOut, FiUser, 
  FiAlertTriangle, FiArrowLeft, FiCamera, FiPhone 
} from "react-icons/fi";
import "./profil.css";

export default function ProfilTab({ handleLogout, lang, changeLanguage }) {
  // Asosiy foydalanuvchi statelari
  const [adminData, setAdminData] = useState({
    full_name: "Samandar",
    phone: "+998902700901",
    role: "Admin",
    region: "Samarkandskaya obl.",
    district: ""
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSubSettings, setShowSubSettings] = useState(false); // Nastroyka (Edit) rejimi

  // Vaqtincha input qiymatlarini ushlab turish uchun state
  const [editForm, setEditForm] = useState({ ...adminData });

  // 🌍 Profil sahifasining o'zi uchun kichik tarjimalar lug'ati
  const t = {
    uz: {
      langTitle: "Tizim tili (Language)",
      settingsTitle: "Nastroyka / Boshqaruv",
      settingsSub: "Profil ma'lumotlari, hudud va shaxsiy sozlamalar",
      open: "Ochish",
      logoutTitle: "Tizimdan chiqish",
      logoutBtn: "Tizimdan chiqish",
      modalText: "Rostdan ham chiqmoqchimisiz?",
      cancel: "Bekor qilish",
      confirm: "Chiqish",
      save: "Saqlash",
      myProfile: "Mening profilim"
    },
    ru: {
      langTitle: "Язык системы (Language)",
      settingsTitle: "Настройки / Управление",
      settingsSub: "Данные профиля, регион и личные настройки",
      open: "Открыть",
      logoutTitle: "Выход из системы",
      logoutBtn: "Выйти из системы",
      modalText: "Вы действительно хотите выйти?",
      cancel: "Отмена",
      confirm: "Выйти",
      save: "Сохранить",
      myProfile: "Мой профиль"
    }
  }[lang] || { uz: {} };

  // LocalStoragedan yuklash
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        const initialData = {
          full_name: userObj.full_name || "Samandar",
          phone: userObj.phone || "+998902700901",
          role: userObj.role || "Admin",
          region: userObj.region || "Samarkandskaya obl.",
          district: userObj.district || ""
        };
        setAdminData(initialData);
        setEditForm(initialData);
      } catch (e) {
        console.error("Xatolik:", e);
      }
    }
  }, []);

  // O'zgarishlarni saqlash funksiyasi
  const handleSaveSettings = () => {
    setAdminData({ ...editForm });
    localStorage.setItem("user", JSON.stringify({ ...JSON.parse(localStorage.getItem("user") || "{}"), ...editForm }));
    alert(lang === "uz" ? "Ma'lumotlar muvaffaqiyatli saqlandi!" : "Данные успешно сохранены!");
    setShowSubSettings(false); // Profilga qaytish
  };

  // 🛠️ 1-HOLAT: MUKAMMAL NASTROYKA (EDIT) OYNASI
  if (showSubSettings) {
    return (
      <div className="profil-tab-container animate-fade">
        {/* Yuqori navigatsiya paneli */}
        <div className="edit-profile-navbar">
          <button className="nav-back-btn" onClick={() => setShowSubSettings(false)}>
            <FiArrowLeft />
          </button>
          <h2>{t.myProfile}</h2>
          <button className="nav-save-btn" onClick={handleSaveSettings}>
            {t.save}
          </button>
        </div>

        {/* Avatar Qismi */}
        <div className="edit-avatar-container">
          <div className="edit-avatar-wrapper">
            <FiUser className="edit-avatar-icon" />
            <label className="avatar-edit-badge">
              <FiCamera />
              <input type="file" accept="image/*" style={{ display: "none" }} />
            </label>
          </div>
        </div>

        {/* Tahrirlash Formalari */}
        <div className="edit-form-grid">
          
          {/* Viloyat (Регион) */}
          <div className="edit-input-group">
            <label>{lang === "uz" ? "Viloyat" : "Регион"}</label>
            <div className="select-wrapper">
              <select 
                value={editForm.region} 
                onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
              >
                <option value="Samarkandskaya obl.">Samarkandskaya obl.</option>
                <option value="Tashkent">Tashkent</option>
                <option value="Bukhara">Bukhara</option>
                <option value="Andijan">Andijan</option>
              </select>
            </div>
          </div>

          {/* Tuman (Район) */}
          <div className="edit-input-group">
            <label>{lang === "uz" ? "Tuman" : "Район"}</label>
            <div className="select-wrapper">
              <select 
                value={editForm.district} 
                onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
              >
                <option value="">{lang === "uz" ? "Tuman" : "Район"}</option>
                <option value="Samarkand City">Samarkand City</option>
                <option value="Pastdargom">Pastdargom</option>
                <option value="Bulungur">Bulungur</option>
              </select>
            </div>
          </div>

          {/* Ism va Familiya */}
          <div className="edit-input-group">
            <label>{lang === "uz" ? "Ism va Familiya" : "Фамилия и Имя"}</label>
            <input 
              type="text" 
              value={editForm.full_name} 
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              placeholder={lang === "uz" ? "Ism va familiyani kiriting" : "Введите имя и фамилию"}
            />
          </div>

          {/* Telefon / Referal Raqam */}
          <div className="edit-input-group">
            <label>{lang === "uz" ? "Referal raqami" : "Номер реферала"}</label>
            <div className="phone-input-wrapper">
              <span className="phone-icon-badge"><FiPhone /></span>
              <input 
                type="text" 
                value={editForm.phone} 
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+998902700901"
              />
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 👤 2-HOLAT: Asosiy Profil oynasi ko'rinishi
  return (
    <div className="profil-tab-container animate-fade">
      <div className="profil-header">
        <div className="profil-avatar">
          <FiUser />
        </div>
        <div className="profil-meta">
          <h2>{adminData.full_name}</h2>
          <span className="role-badge">{adminData.role.toUpperCase()}</span>
          <p className="phone-text">{adminData.phone} | {adminData.region}</p>
        </div>
      </div>

      <hr className="profil-divider" />

      <div className="profil-sections">
        {/* Til sozlamalari */}
        <div className="profil-card">
          <div className="card-title">
            <FiGlobe className="card-icon language-icon-color" />
            <h3>{t.langTitle}</h3>
          </div>
          <div className="language-selector">
            <button 
              className={lang === "uz" ? "lang-btn active" : "lang-btn"} 
              onClick={() => changeLanguage("uz")} // 👈 Otasidan kelgan funksiya ishlaydi
            >
              O'zbekcha (UZ)
            </button>
            <button 
              className={lang === "ru" ? "lang-btn active" : "lang-btn"} 
              onClick={() => changeLanguage("ru")} // 👈 Otasidan kelgan funksiya ishlaydi
            >
              Русский (RU)
            </button>
          </div>
        </div>

        {/* Nastroyka tugmasi */}
        <div className="profil-card click-card" onClick={() => { setEditForm({...adminData}); setShowSubSettings(true); }}>
          <div className="card-title-flex">
            <div className="card-title">
              <FiSettings className="card-icon settings-icon-color" />
              <div>
                <h3>{t.settingsTitle}</h3>
                <p className="card-subtext">{t.settingsSub}</p>
              </div>
            </div>
            <button className="open-settings-action-btn">{t.open}</button>
          </div>
        </div>

        {/* Tizimdan chiqish */}
        <div className="profil-card logout-card">
          <div className="card-title">
            <FiLogOut className="card-icon logout-icon-color" />
            <h3>{t.logoutTitle}</h3>
          </div>
          <button className="profil-logout-btn" onClick={() => setIsModalOpen(true)}>
            <FiLogOut /> {t.logoutBtn}
          </button>
        </div>
      </div>

      {/* 🚪 Chiqishni tasdiqlash modali (adminDash.css bilan klasslar moslashtirildi) */}
      {isModalOpen && (
        <div className="logout-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="logout-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon"><FiAlertTriangle size={24} /></div>
            <h3>{t.logoutTitle}</h3>
            <p>{t.modalText}</p>
            <div className="logout-modal-actions">
              <button className="modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                {t.cancel}
              </button>
              <button className="modal-confirm-btn" onClick={handleLogout}>
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}