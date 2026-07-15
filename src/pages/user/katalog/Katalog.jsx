import React, { useState } from "react";
import { FiArrowLeft, FiGrid, FiPackage, FiImage, FiMapPin, FiPhone } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./katalog.css";

import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- TILLARGA MOSLANGAN DO'KONLAR ---
const MOCK_SHOPS = {
  uz: [
    { 
      id: 1, 
      name: "IT Tat o'quv markazi (Bosh Ofis)", 
      address: "Samarqand sh., Mirzo Ulug'bek ko'chasi, 47-uy", 
      lat: 39.677544, 
      lng: 66.926537, 
      phone: "+998 90 123-45-67" 
    },
    { 
      id: 2, 
      name: "Nasoslar ombori (Samarqand filiali)", 
      address: "Samarqand sh., Gagarin ko'chasi", 
      lat: 39.661245, 
      lng: 66.912384, 
      phone: "+998 93 987-65-43" 
    }
  ],
  ru: [
    { 
      id: 1, 
      name: "Учебный центр IT Tat (Головной офис)", 
      address: "г. Самарканд, улица Мирзо Улугбека, дом 47", 
      lat: 39.677544, 
      lng: 66.926537, 
      phone: "+998 90 123-45-67" 
    },
    { 
      id: 2, 
      name: "Склад насосов (Самаркандский филиал)", 
      address: "г. Самарканд, улица Гагарина", 
      lat: 39.661245, 
      lng: 66.912384, 
      phone: "+998 93 987-65-43" 
    }
  ]
};

// --- KATEGORIYALAR (Ikki tilda) ---
const MOCK_CATEGORIES = [
  { id: 1, name_uz: "Nasoslar", name_ru: "Насосы", image_url: "https://via.placeholder.com/250x180?text=Nasoslar" }
];

// --- MAHSULOTLAR (Ikki tildagi xususiyatlari bilan) ---
const MOCK_PRODUCTS = [
  { id: 1, category_id: 1, title_uz: "Pumpman QB60 ECO (Вихревой)", title_ru: "Pumpman QB60 ECO (Вихревой)", price: 280000, image_url: "https://via.placeholder.com/250x180?text=QB60+ECO",
    specs_uz: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "35" }, { key: "Balandligi (Подъём, m)", value: "32" } ],
    specs_ru: [ { key: "Тип", value: "Вихревой" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.37" }, { key: "Расход воды (л/м)", value: "35" }, { key: "Высота подъёма (м)", value: "32" } ] },
  { id: 2, category_id: 1, title_uz: "Pumpman QB60 (Вихревой)", title_ru: "Pumpman QB60 (Вихревой)", price: 320000, image_url: "https://via.placeholder.com/250x180?text=QB60",
    specs_uz: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "35" }, { key: "Balandligi (Подъём, m)", value: "35" } ],
    specs_ru: [ { key: "Тип", value: "Вихревой" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.37" }, { key: "Расход воды (л/м)", value: "35" }, { key: "Высота подъёма (м)", value: "35" } ] },
  { id: 3, category_id: 1, title_uz: "Pumpman QB70 (Вихревой)", title_ru: "Pumpman QB70 (Вихревой)", price: 520000, image_url: "https://via.placeholder.com/250x180?text=QB70",
    specs_uz: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.55" }, { key: "Suv sarfi (л/м)", value: "45" }, { key: "Balandligi (Подъём, m)", value: "45" } ],
    specs_ru: [ { key: "Тип", value: "Вихревой" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.55" }, { key: "Расход воды (л/м)", value: "45" }, { key: "Высота подъёма (м)", value: "45" } ] },
  { id: 4, category_id: 1, title_uz: "Pumpman QB80 (Вихревой)", title_ru: "Pumpman QB80 (Вихревой)", price: 570000, image_url: "https://via.placeholder.com/250x180?text=QB80",
    specs_uz: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.75" }, { key: "Suv sarfi (л/м)", value: "45" }, { key: "Balandligi (Подъём, m)", value: "53" } ],
    specs_ru: [ { key: "Тип", value: "Вихревой" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.75" }, { key: "Расход воды (л/м)", value: "45" }, { key: "Высота подъёма (м)", value: "53" } ] },
  { id: 5, category_id: 1, title_uz: "Pumpman CPm130 (Центробежный)", title_ru: "Pumpman CPm130 (Центробежный)", price: 510000, image_url: "https://via.placeholder.com/250x180?text=CPm130",
    specs_uz: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "105" }, { key: "Balandligi (Подъём, m)", value: "22" } ],
    specs_ru: [ { key: "Тип", value: "Центробежный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.37" }, { key: "Расход воды (л/м)", value: "105" }, { key: "Высота подъёма (м)", value: "22" } ] },
  { id: 6, category_id: 1, title_uz: "Pumpman CPm146 (Центробежный)", title_ru: "Pumpman CPm146 (Центробежный)", price: 620000, image_url: "https://via.placeholder.com/250x180?text=CPm146",
    specs_uz: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.55" }, { key: "Suv sarfi (л/м)", value: "125" }, { key: "Balandligi (Подъём, m)", value: "27" } ],
    specs_ru: [ { key: "Тип", value: "Центробежный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.55" }, { key: "Расход воды (л/м)", value: "125" }, { key: "Высота подъёма (м)", value: "27" } ] },
  { id: 7, category_id: 1, title_uz: "Pumpman CPm158 (Центробежный)", title_ru: "Pumpman CPm158 (Центробежный)", price: 690000, image_url: "https://via.placeholder.com/250x180?text=CPm158",
    specs_uz: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.75" }, { key: "Suv sarfi (л/м)", value: "125" }, { key: "Balandligi (Подъём, m)", value: "32" } ],
    specs_ru: [ { key: "Тип", value: "Центробежный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.75" }, { key: "Расход воды (л/м)", value: "125" }, { key: "Высота подъёма (м)", value: "32" } ] },
  { id: 8, category_id: 1, title_uz: "Pumpman CPm170 (Центробежный)", title_ru: "Pumpman CPm170 (Центробежный)", price: 1120000, image_url: "https://via.placeholder.com/250x180?text=CPm170",
    specs_uz: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "1.1" }, { key: "Suv sarfi (л/м)", value: "133" }, { key: "Balandligi (Подъём, m)", value: "41" } ],
    specs_ru: [ { key: "Тип", value: "Центробежный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "1.1" }, { key: "Расход воды (л/м)", value: "133" }, { key: "Высота подъёма (м)", value: "41" } ] },
  { id: 9, category_id: 1, title_uz: "Pumpman CPm200 (Центробежный)", title_ru: "Pumpman CPm200 (Центробежный)", price: 1250000, image_url: "https://via.placeholder.com/250x180?text=CPm200",
    specs_uz: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "1.5" }, { key: "Suv sarfi (л/м)", value: "133" }, { key: "Balandligi (Подъём, m)", value: "43" } ],
    specs_ru: [ { key: "Тип", value: "Центробежный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "1.5" }, { key: "Расход воды (л/м)", value: "133" }, { key: "Высота подъёма (м)", value: "43" } ] },
  { id: 10, category_id: 1, title_uz: "Pumpman PW125 (Периферийный)", title_ru: "Pumpman PW125 (Периферийный)", price: 550000, image_url: "https://via.placeholder.com/250x180?text=PW125",
    specs_uz: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.125" }, { key: "Suv sarfi (л/м)", value: "33" }, { key: "Balandligi (Подъём, m)", value: "24" } ],
    specs_ru: [ { key: "Тип", value: "Периферийный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.125" }, { key: "Расход воды (л/м)", value: "33" }, { key: "Высота подъёма (м)", value: "24" } ] },
  { id: 11, category_id: 1, title_uz: "Pumpman PW250 (Периферийный)", title_ru: "Pumpman PW250 (Периферийный)", price: 570000, image_url: "https://via.placeholder.com/250x180?text=PW250",
    specs_uz: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.25" }, { key: "Suv sarfi (л/м)", value: "36" }, { key: "Balandligi (Подъём, m)", value: "30" } ],
    specs_ru: [ { key: "Тип", value: "Периферийный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.25" }, { key: "Расход воды (л/м)", value: "36" }, { key: "Высота подъёма (м)", value: "30" } ] },
  { id: 12, category_id: 1, title_uz: "Pumpman PW370 (Периферийный)", title_ru: "Pumpman PW370 (Периферийный)", price: 580000, image_url: "https://via.placeholder.com/250x180?text=PW370",
    specs_uz: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "40" }, { key: "Balandligi (Подъём, m)", value: "36" } ],
    specs_ru: [ { key: "Тип", value: "Периферийный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.37" }, { key: "Расход воды (л/м)", value: "40" }, { key: "Высота подъёма (м)", value: "36" } ] },
  { id: 13, category_id: 1, title_uz: "Pumpman PW550 (Периферийный)", title_ru: "Pumpman PW550 (Периферийный)", price: 700000, image_url: "https://via.placeholder.com/250x180?text=PW550",
    specs_uz: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.55" }, { key: "Suv sarfi (л/м)", value: "50" }, { key: "Balandligi (Подъём, m)", value: "42" } ],
    specs_ru: [ { key: "Тип", value: "Периферийный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.55" }, { key: "Расход воды (л/м)", value: "50" }, { key: "Высота подъёма (м)", value: "42" } ] },
  { id: 14, category_id: 1, title_uz: "Pumpman PW750 (Периферийный)", title_ru: "Pumpman PW750 (Периферийный)", price: 780000, image_url: "https://via.placeholder.com/250x180?text=PW750",
    specs_uz: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.75" }, { key: "Suv sarfi (л/м)", value: "56" }, { key: "Balandligi (Подъём, m)", value: "50" } ],
    specs_ru: [ { key: "Тип", value: "Периферийный" }, { key: "Вход/Выход", value: "25*25" }, { key: "Мощность (кВт)", value: "0.75" }, { key: "Расход воды (л/м)", value: "56" }, { key: "Высота подъёма (м)", value: "50" } ] },
  { id: 15, category_id: 1, title_uz: "Pumpman PW1100 (Периферийный)", title_ru: "Pumpman PW1100 (Периферийный)", price: 1070000, image_url: "https://via.placeholder.com/250x180?text=PW1100",
    specs_uz: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "40*40" }, { key: "Quvvati (кВт)", value: "1.1" }, { key: "Suv sarfi (л/м)", value: "100" }, { key: "Balandligi (Подъём, m)", value: "55" } ],
    specs_ru: [ { key: "Тип", value: "Периферийный" }, { key: "Вход/Выход", value: "40*40" }, { key: "Мощность (кВт)", value: "1.1" }, { key: "Расход воды (л/м)", value: "100" }, { key: "Высота подъёма (м)", value: "55" } ] }
];

export default function UserKatalog({ onBack, lang = "uz" }) { // 👈 lang prop'ini qabul qilamiz, default: uz
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const activeLang = lang === "ru" ? "ru" : "uz";

  // Tarjimalar lug'ati
  const t = {
    uz: {
      back: "Orqaga",
      backHome: "Asosiy sahifaga qaytish",
      specsTitle: "Mahsulot xususiyatlari",
      noProducts: "Bu katalogda hozircha mahsulotlar mavjud emas.",
      bannerTitle: "Xo'jalik Mollari Katalogi",
      bannerDesc: "Kerakli toifani tanlang va mahsulotlar bilan tanishing",
      mapTitle: "Bizning do'konlarimiz xaritasi",
      sectionTitle: "Mavjud Kataloglar",
      badgeCat: "toifa",
      badgeProd: "ta mahsulot",
      viewProducts: "Tovarlarni ko'rish"
    },
    ru: {
      back: "Назад",
      backHome: "Вернуться на главную",
      specsTitle: "Характеристики товара",
      noProducts: "В этой категории пока нет товаров.",
      bannerTitle: "Каталог хозяйственных товаров",
      bannerDesc: "Выберите категорию и ознакомьтесь с товарами",
      mapTitle: "Карта наших магазинов",
      sectionTitle: "Доступные категории",
      badgeCat: "категорий",
      badgeProd: "товаров",
      viewProducts: "Посмотреть товары"
    }
  }[activeLang];

  const filteredProducts = MOCK_PRODUCTS.filter(
    (prod) => selectedCategory && prod.category_id === selectedCategory.id
  );

  // --- REJIM 3: MAHSULOT DETALI ---
  if (selectedProduct) {
    const productSpecs = activeLang === "ru" ? selectedProduct.specs_ru : selectedProduct.specs_uz;
    const productTitle = activeLang === "ru" ? selectedProduct.title_ru : selectedProduct.title_uz;

    return (
      <div className="katalog-light-wrapper">
        <div className="katalog-inner-header">
          <button className="katalog-back-btn" onClick={() => setSelectedProduct(null)}>
            <FiArrowLeft size={16} /> {t.back}
          </button>
          <h2>{t.specsTitle}</h2>
        </div>

        <div className="product-detail-container">
          <div className="product-detail-main">
            <div className="product-detail-img">
              <img src={selectedProduct.image_url} alt={productTitle} />
            </div>
            <div className="product-detail-info">
              <h3 className="product-detail-title">{productTitle}</h3>
            </div>
          </div>

          {productSpecs && productSpecs.length > 0 && (
            <div className="product-specs-section">
              <table className="specs-table">
                <tbody>
                  {productSpecs.map((spec, index) => (
                    <tr key={index}>
                      <td className="spec-key">{spec.key}</td>
                      <td className="spec-value">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- REJIM 2: MAHSULOTLAR RO'YXATI (KATEGORIYA ICHIDA) ---
  if (selectedCategory) {
    const categoryName = activeLang === "ru" ? selectedCategory.name_ru : selectedCategory.name_uz;

    return (
      <div className="katalog-light-wrapper">
        <div className="katalog-inner-header">
          <button className="katalog-back-btn" onClick={() => setSelectedCategory(null)}>
            <FiArrowLeft size={16} /> {t.back}
          </button>
          <div className="inner-title-box">
            <h2>{categoryName}</h2>
            <span className="badge">{filteredProducts.length} {t.badgeProd}</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-data-box">
            <FiPackage size={44} />
            <p>{t.noProducts}</p>
          </div>
        ) : (
          <div className="products-light-grid">
            {filteredProducts.map((prod) => {
              const productTitle = activeLang === "ru" ? prod.title_ru : prod.title_uz;
              return (
                <div 
                  key={prod.id} 
                  className="product-light-card" 
                  onClick={() => setSelectedProduct(prod)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-img-box">
                    <img src={prod.image_url} alt={productTitle} />
                  </div>
                  <div className="product-details">
                    <h4 className="product-title">{productTitle}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- REJIM 1: ASOSIY KATALOGLAR REJIMI ---
  const currentShops = MOCK_SHOPS[activeLang];

  return (
    <div className="katalog-light-wrapper">
      
      {/* ⬅️ ENGER TEPADAGI HOME PAGE'GA QAYTISH TUGMASI */}
      <div style={{ marginBottom: "15px", display: "flex", justifyContent: "flex-start" }}>
        <button 
          className="katalog-back-btn main-home-back-btn" 
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            color: "#334155",
            transition: "all 0.2s ease"
          }}
        >
          <FiArrowLeft size={18} /> {t.backHome}
        </button>
      </div>

      {/* 1. Sarlavha Banner qismi */}
      <div className="katalog-light-banner">
        <div className="banner-left-info">
          <div className="banner-icon-title">
            <FiGrid className="main-grid-icon" />
            <h2>{t.bannerTitle}</h2>
          </div>
          <p>{t.bannerDesc}</p>
        </div>
      </div>

      {/* 🗺️ 2. INTERAKTIV KARTA */}
      <div className="katalog-map-section" style={{ margin: "20px 0 30px 0", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiMapPin style={{ color: "#3b82f6" }} />
          <strong style={{ fontSize: "14px", color: "#1e293b" }}>{t.mapTitle}</strong>
        </div>
        
        <div style={{ height: "320px", width: "100%" }}>
          <MapContainer 
            center={[39.677544, 66.926537]} 
            zoom={13} 
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {currentShops.map((shop) => (
              <Marker key={shop.id} position={[shop.lat, shop.lng]}>
                <Popup>
                  <div style={{ fontFamily: "sans-serif", padding: "5px" }}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "14px", fontWeight: "bold" }}>{shop.name}</h4>
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b" }}>{shop.address}</p>
                    {shop.phone && (
                      <p style={{ margin: "0", fontSize: "12px", color: "#2563eb", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                        <FiPhone size={12} /> {shop.phone}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* 3. Bo'lim ajratuvchi sarlavha */}
      <div className="section-divider">
        <h3>{t.sectionTitle}</h3>
        <span className="badge-count">{MOCK_CATEGORIES.length} {t.badgeCat}</span>
      </div>

      {/* 4. Kategoriyalar ro'yxati */}
      <div className="categories-light-grid">
        {MOCK_CATEGORIES.map((cat) => {
          const categoryName = activeLang === "ru" ? cat.name_ru : cat.name_uz;
          return (
            <div key={cat.id} className="category-light-card" onClick={() => setSelectedCategory(cat)}>
              <div className="card-img-top">
                <div className="no-image-placeholder">
                  <FiImage size={28} />
                </div>
              </div>
              <div className="card-body-content">
                <h3>{categoryName}</h3>
                <div className="card-footer-action">
                  <span>{t.viewProducts}</span>
                  <span className="arrow-icon">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}