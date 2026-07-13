import React, { useState, useEffect } from "react";
import { 
  FiSliders, 
  FiTool, 
  FiCode, 
  FiCalendar, 
  FiUser,
  FiFileText,
  FiCamera,
  FiGift,
  FiShoppingBag,
  FiLayers, // 📂 Katalog uchun yangi ikonka
  FiX 
} from "react-icons/fi"; 
import "./sidebar.css"; 

export default function Sidebar({
  activeTab,
  setActiveTab,
  mastersCount = 0,
  codesCount = 0,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  lang = "uz"
}) {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.full_name) setAdminName(userObj.full_name);
      } catch (e) {
        console.error("User parsing error", e);
      }
    }
  }, []);

  const translations = {
    uz: {
      brandSub: "DO'KON BOSHQARUVI",
      dashboard: "Dashboard / Asosiy",
      masters: `Ustalar Bazasi (${mastersCount})`,
      generator: `Kod Generator (${codesCount})`,
      katalog: "Mahsulotlar Katalogi", // 🇺🇿 O'zbekcha tarjima
      magazin: "Sovg'alar Do'koni", 
      aksiya: "Aksiya Muddatlari",
      news: "Yangiliklar va Maslahatlar",
      history: "Kodlar Tarixi (Foto)", 
      role: "Admin"
    },
    ru: {
      brandSub: "УПРАВЛЕНИЕ МАГАЗИНОМ",
      dashboard: "Главная / Панель",
      masters: `База Мастеров (${mastersCount})`,
      generator: `Генератор Кодов (${codesCount})`,
      katalog: "Каталог Товаров", // 🇷🇺 Ruscha tarjima
      magazin: "Магазин Подарков", 
      aksiya: "Сроки Акций",
      news: "Новости и Советы",
      history: "История Кодов (Фото)", 
      role: "Админ"
    }
  };

  const t = translations[lang] || translations.uz;

  const menuItems = [
    { id: "dashboard", label: t.dashboard, icon: <FiSliders /> },
    { id: "ustalar", label: t.masters, icon: <FiTool /> },
    { id: "random", label: t.generator, icon: <FiCode /> },
    { id: "katalog", label: t.katalog, icon: <FiLayers /> }, // 📂 YANGI QO'SHILGAN KATALOG TUGMASI
    { id: "magazin", label: t.magazin, icon: <FiGift /> }, 
    { id: "aksiya", label: t.aksiya, icon: <FiCalendar /> },
    { id: "maslahatlar", label: t.news, icon: <FiFileText /> }, 
    { id: "history", label: t.history, icon: <FiCamera /> }, 
  ];

  return (
    <aside className={`custom-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
      
      {/* Yuqori qism: Brend va uning ichiga chiroyli moslashtirilgan X tugmasi */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <FiShoppingBag size={20} style={{ strokeWidth: "2.5px" }} />
        </div>
        <div className="brand-text">
          <h2>ADMIN PANEL</h2>
          <span>{t.brandSub}</span>
        </div>

        {/* 🛠️ X tugmasi endi aynan "ADMIN PANEL" qatorining o'ng chetida chiqadi */}
        {isMobileMenuOpen && (
          <button className="sidebar-close-inner" onClick={() => setIsMobileMenuOpen(false)}>
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Navigatsiya menyusi */}
      <nav className="sidebar-menu">
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.id} 
              className={activeTab === item.id ? "active" : ""}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false); 
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {activeTab === item.id && <span className="active-indicator"></span>}
            </li>
          ))}
        </ul>
      </nav>

      {/* Pastki qism: Yo'qolib qolmaydigan mukammal Profil bloki */}
      <div className="sidebar-footer">
        <div 
          className={`sidebar-profile-btn ${activeTab === "profil" ? "active-profile" : ""}`}
          onClick={() => {
            setActiveTab("profil");
            setIsMobileMenuOpen(false);
          }}
        >
          <div className="avatar-box">
            <FiUser />
          </div>
          <div className="profile-info">
            <span className="profile-name">{adminName}</span>
            <span className="profile-role">{t.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}