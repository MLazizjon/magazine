import React, { useState } from "react";
import { FiArrowLeft, FiGrid, FiPackage, FiImage, FiMapPin, FiPhone } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./katalog.css";

// === Leaflet standart CSS va Marker sozlamalari ===
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// === PUMPMAN RASMLARI IMPORTI (assets2 papkasidan) ===
import imgQB from "./assets2/QB.png";
import imgCPm from "./assets2/CPm.png";
import imgPW from "./assets2/PW.png";
import imgPWE from "./assets2/PW-E.png";
import imgPWF from "./assets2/PW.png";
import imgQDX from "./assets2/QDX.png";
import imgTCM from "./assets2/TCM.png";
import imgTCH from "./assets2/TCM.png";
import imgJET from "./assets2/JET.png";
import imgTHF from "./assets2/THF.png";
import img2TCP from "./assets2/2TCP25-160A.png";
import img50WFD from "./assets2/WFD.png"; 
import imgQFD from "./assets2/QFD.png";
import imgATJSW from "./assets2/ATJSW.png";
import imgSTAR_F from "./assets2/STSR40-10F.png"; 
import imgSGJ from "./assets2/2STM-2.png";
import imgGS from "./assets2/2STM-2.png";
import imgCHLFT from "./assets2/CHLF(T)гиpng.png";
import imgCHM from "./assets2/CHMгиpng.png";
import imgTW from "./assets2/TW-T.png";
import imgGRD from "./assets2/GP.png";
import imgSTAR_C from "./assets2/STAR-6A.png"; 
import imgPM01 from "./assets2/PW.png";

// === YANGI QO'SHILGAN RASMLAR IMPORTI ===
import imgIntelligent from "./assets2/imageone.png"; 
import imgGRD15 from "./assets2/imagetwo.png";         
import imgNewStar from "./assets2/imagethree.png";         
import imgHorizontal from "./assets2/imagefoue.png";   

// === Leaflet marker ikonkalarini sozlash ===
// Ba'zida React loyihalarda mahalliy marker rasmi yuklanmasa, xato bermasligi uchun ochiq manba URL'ga yo'naltirildi
let DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// === 1. DO'KONLAR COORDINATALARI (Rasmga qarab to'g'rilandi) ===
const MOCK_SHOPS = [
  {
    id: 1,
    name: "Nasoslar ombori (Samarqand filiali)",
    address: "Samarqand sh., Gagarin ko'chasi",
    lat: 39.6542, // Rasmda ko'rsatilgan Gagarin ko'chasiga mos keluvchi haqiqiy koordinata
    lng: 66.9287, 
    phone: "+998 93 987-55-43" // Rasmda ko'rsatilgan telefon raqami
  } 
];

// === 2. BARCHA TOIFALAR ===
const MOCK_CATEGORIES = [
  { id: 1, name_uz: "Nasoslar", image_url: "https://via.placeholder.com/250x180?text=Nasoslar" }
];

// === 3. MAHSULOTLAR RO'YXATI ===
const MOCK_PRODUCTS = [
  // 1. QB (Вихревой)
  {
    id: 1,
    category_id: 1,
    title_uz: "Pumpman QB60 ECO (Вихревой)",
    price: 280000,
    image_url: imgQB,
    specs: [
      { key: "Turi", value: "Вихревой" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.37" },
      { key: "Suv sarfi (л/м)", value: "35" },
      { key: "Balandligi (Подъём, m)", value: "32" }
    ]
  },
  // 2. CPm (Центробежный)
  {
    id: 2,
    category_id: 1,
    title_uz: "Pumpman CPm130 (Центробежный)",
    price: 510000,
    image_url: imgCPm,
    specs: [
      { key: "Turi", value: "Центробежный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.37" },
      { key: "Suv sarfi (л/м)", value: "105" },
      { key: "Balandligi (Подъём, m)", value: "22" }
    ]
  },
  // 3. PW (Периферийный)
  {
    id: 3,
    category_id: 1,
    title_uz: "Pumpman PW125 (Периферийный)",
    price: 550000,
    image_url: imgPW,
    specs: [
      { key: "Turi", value: "Периферийный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.125" },
      { key: "Suv sarfi (л/м)", value: "33" },
      { key: "Balandligi (Подъём, m)", value: "24" }
    ]
  },
  // 4. PWE (Периферийный с сухой защитой)
  {
    id: 4,
    category_id: 1,
    title_uz: "Pumpman PWE 125 (Сухой защита)",
    price: 620000,
    image_url: imgPWE,
    specs: [
      { key: "Turi", value: "Периферийный с сухой защитой" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.125" },
      { key: "Suv sarfi (л/м)", value: "33" },
      { key: "Balandligi (Подъём, m)", value: "24" }
    ]
  },
  // 5. PWF (Периферийный с suhoyi datchik - Adaptiv)
  {
    id: 5,
    category_id: 1,
    title_uz: "Pumpman PWF 125 (Адаптивный)",
    price: 670000,
    image_url: imgPWF,
    specs: [
      { key: "Turi", value: "Периферийный адаптивный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.125" },
      { key: "Suv sarfi (л/м)", value: "33" },
      { key: "Balandligi (Подъём, m)", value: "24" }
    ]
  },
  // 6. QDX (Погружной)
  {
    id: 6,
    category_id: 1,
    title_uz: "Pumpman QDX1.5-12-0.25L(A) (Погружной)",
    price: 470000,
    image_url: imgQDX,
    specs: [
      { key: "Turi", value: "Погружной дренажный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.25" },
      { key: "Suv sarfi (л/м)", value: "91" },
      { key: "Balandligi (Подъём, m)", value: "13" }
    ]
  },
  // 7. TCM5 (Поверхностный)
  {
    id: 7,
    category_id: 1,
    title_uz: "Pumpman TCM 5.4-31/4-0.55",
    price: 900000,
    image_url: imgTCM,
    specs: [
      { key: "Turi", value: "Поверхностный многоступенчатый" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.55" },
      { key: "Suv sarfi (л/м)", value: "33" },
      { key: "Balandligi (Подъём, m)", value: "31" }
    ]
  },
  // 8. TCH(m) (Поверхностный)
  {
    id: 8,
    category_id: 1,
    title_uz: "Pumpman TCH(m) 3-2BR 0.37",
    price: 800000,
    image_url: imgTCH,
    specs: [
      { key: "Turi", value: "Поверхностный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.37" },
      { key: "Suv sarfi (л/м)", value: "80" },
      { key: "Balandligi (Подъём, m)", value: "20" }
    ]
  },
  // 9. JET (Самовсасывающий)
  {
    id: 9,
    category_id: 1,
    title_uz: "Pumpman JET 80",
    price: 710000,
    image_url: imgJET,
    specs: [
      { key: "Turi", value: "Самовсасывающий JET" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.55" },
      { key: "Suv sarfi (л/м)", value: "53" },
      { key: "Balandligi (Подъём, m)", value: "38" }
    ]
  },
  // 10. THF (Центробежный)
  {
    id: 10,
    category_id: 1,
    title_uz: "Pumpman TGA1A (THF)",
    price: 750000,
    image_url: imgTHF,
    specs: [
      { key: "Turi", value: "Центробежный высокопроизводительный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "40*40" },
      { key: "Quvvati (кВт)", value: "0.75" },
      { key: "Suv sarfi (л/м)", value: "300" },
      { key: "Balandligi (Подъём, m)", value: "20" }
    ]
  },
  // 11. 2TCP25 (Центробежный двухколесный)
  {
    id: 11,
    category_id: 1,
    title_uz: "Pumpman 2TCP25/140M",
    price: 1300000,
    image_url: img2TCP,
    specs: [
      { key: "Turi", value: "Центробежный двухколесный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "40*25" },
      { key: "Quvvati (кВт)", value: "1.1" },
      { key: "Suv sarfi (л/м)", value: "125" },
      { key: "Balandligi (Подъём, m)", value: "47" }
    ]
  },
  // 12. 50WFD11 (Канализационный)
  {
    id: 12,
    category_id: 1,
    title_uz: "Pumpman 50WFD11-10-1.1GA",
    price: 1450000,
    image_url: img50WFD,
    specs: [
      { key: "Turi", value: "Канализационный погружной" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "50*50" },
      { key: "Quvvati (кВт)", value: "1.1" },
      { key: "Suv sarfi (л/м)", value: "280" },
      { key: "Balandligi (Подъём, m)", value: "15" }
    ]
  },
  // 13. QFD (Погружной)
  {
    id: 13,
    category_id: 1,
    title_uz: "Pumpman QFD15-15-1.1(A)",
    price: 1300000,
    image_url: imgQFD,
    specs: [
      { key: "Turi", value: "Погружной центробежный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "63*63" },
      { key: "Quvvati (кВт)", value: "1.1" },
      { key: "Suv sarfi (л/м)", value: "580" },
      { key: "Balandligi (Подъём, m)", value: "18" }
    ]
  },
  // 14. ATJSW (Насосная станция)
  {
    id: 14,
    category_id: 1,
    title_uz: "Pumpman ATJSW/15M-1",
    price: 1110000,
    image_url: imgATJSW,
    specs: [
      { key: "Turi", value: "Автоматическая насосная станция" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "1.1" },
      { key: "Suv sarfi (л/м)", value: "50" },
      { key: "Balandligi (Подъём, m)", value: "58" }
    ]
  },
  // 15. STAR (Частотный с фланцем)
  {
    id: 15,
    category_id: 1,
    title_uz: "Pumpman STAR50/12F",
    price: 6000000,
    image_url: imgSTAR_F,
    specs: [
      { key: "Turi", value: "Циркуляционный частотный фланцевый" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "50*50" },
      { key: "Quvvati (кВт)", value: "0.56" },
      { key: "Suv sarfi (л/м)", value: "380" },
      { key: "Balandligi (Подъём, m)", value: "12" }
    ]
  },
  // 16. SGJ (Самовсасывающий нерж.)
  {
    id: 16,
    category_id: 1,
    title_uz: "Pumpman SGJ600",
    price: 750000,
    image_url: imgSGJ,
    specs: [
      { key: "Turi", value: "Самовсасывающий нержавеющий" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.6" },
      { key: "Suv sarfi (л/м)", value: "55" },
      { key: "Balandligi (Подъём, m)", value: "43" }
    ]
  },
  // 17. GS (Дренажный)
  {
    id: 17,
    category_id: 1,
    title_uz: "Pumpman GS400",
    price: 480000,
    image_url: imgGS,
    specs: [
      { key: "Turi", value: "Дренажный пластиковый" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "40*40" },
      { key: "Quvvati (кВт)", value: "0.4" },
      { key: "Suv sarfi (л/м)", value: "146" },
      { key: "Balandligi (Подъём, m)", value: "5.5" }
    ]
  },
  // 18. CHLFT(T) (Для горячей воды)
  {
    id: 18,
    category_id: 1,
    title_uz: "Pumpman CHLFT(T) 2-60R",
    price: 1650000,
    image_url: imgCHLFT,
    specs: [
      { key: "Turi", value: "Горизонтальный многоступенчатый (горячая вода)" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.75" },
      { key: "Suv sarfi (л/м)", value: "580" },
      { key: "Balandligi (Подъём, m)", value: "53" }
    ]
  },
  // 19. CHM (Для горячей воды)
  {
    id: 19,
    category_id: 1,
    title_uz: "Pumpman CHM4-4R",
    price: 1600000,
    image_url: imgCHM,
    specs: [
      { key: "Turi", value: "Центробежный (горячая вода)" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "32*25" },
      { key: "Quvvati (кВт)", value: "0.75" },
      { key: "Suv sarfi (л/м)", value: "116" },
      { key: "Balandligi (Подъём, m)", value: "38" }
    ]
  },
  // 20. TW (Периферийный)
  {
    id: 20,
    category_id: 1,
    title_uz: "Pumpman TW-550T",
    price: 620000,
    image_url: imgTW,
    specs: [
      { key: "Turi", value: "Периферийный вихревой" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.55" },
      { key: "Suv sarfi (л/м)", value: "50" },
      { key: "Balandligi (Подъём, m)", value: "42" }
    ]
  },
  // 21. GRD (Рециркуляция Латунь)
  {
    id: 21,
    category_id: 1,
    title_uz: "Pumpman GRD 15/15 (Латунь)",
    price: 550000,
    image_url: imgGRD,
    specs: [
      { key: "Turi", value: "Рециркуляционный латунный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "15*15" },
      { key: "Quvvati (кВт)", value: "0.03" },
      { key: "Suv sarfi (л/м)", value: "10" },
      { key: "Balandligi (Подъём, m)", value: "1.5" }
    ]
  },
  // 22. STAR (Циркуляционный частотный)
  {
    id: 22,
    category_id: 1,
    title_uz: "Pumpman NEW STAR 25/6-180",
    price: 650000,
    image_url: imgSTAR_C,
    specs: [
      { key: "Turi", value: "Циркуляционный частотный" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.3" },
      { key: "Suv sarfi (л/м)", value: "58" },
      { key: "Balandligi (Подъём, m)", value: "6" }
    ]
  },
  // 23. Пресс-контроль PM-01
  {
    id: 23,
    category_id: 1,
    title_uz: "Pumpman PM-01 (Пресс-контроль)",
    price: 160000,
    image_url: imgPM01,
    specs: [
      { key: "Turi", value: "Блок автоматики (Пресс-контроль)" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "1.1" },
      { key: "Suv sarfi", value: "Avtomat boshqaruv" },
      { key: "Balandligi", value: "Datchik" }
    ]
  },
  
  // === TO'RTTA YANGI MAHSULOT ===
  {
    id: 24,
    category_id: 1,
    title_uz: "Pumpman Intelligent (Avtomatik)",
    price: 950000, 
    image_url: imgIntelligent,
    specs: [
      { key: "Turi", value: "Aqlli o'z-o'zidan so'radigan (Умный самовсасывающий)" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.55" },
      { key: "Suv sarfi (л/м)", value: "45" },
      { key: "Balandligi (Подъём, m)", value: "35" }
    ]
  },
  {
    id: 25,
    category_id: 1,
    title_uz: "Pumpman GRD 15/15",
    price: 450000,
    image_url: imgGRD15,
    specs: [
      { key: "Turi", value: "Resirkulyatsion (Рециркуляционный)" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "15*15" },
      { key: "Quvvati (кВт)", value: "0.008" },
      { key: "Suv sarfi (л/м)", value: "10" },
      { key: "Balandligi (Подъём, m)", value: "1.5" }
    ]
  },
  {
    id: 26,
    category_id: 1,
    title_uz: "Pumpman NEW STAR 25/6",
    price: 850000,
    image_url: imgNewStar,
    specs: [
      { key: "Turi", value: "Tsirkulyatsion elektron (Циркуляционный электронный)" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.045" },
      { key: "Suv sarfi (л/м)", value: "50" },
      { key: "Balandligi (Подъём, m)", value: "6" }
    ]
  },
  {
    id: 27,
    category_id: 1,
    title_uz: "Pumpman Gorizontal ko'p bosqichli",
    price: 1600000,
    image_url: imgHorizontal,
    specs: [
      { key: "Turi", value: "Ko'p bosqichli markazdan qochma (Многоступенчатый центробежный)" },
      { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" },
      { key: "Quvvati (кВт)", value: "0.75" },
      { key: "Suv sarfi (л/м)", value: "70" },
      { key: "Balandligi (Подъём, m)", value: "45" }
    ]
  }
];

export default function KatalogTab() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = MOCK_PRODUCTS.filter(
    (prod) => selectedCategory && prod.category_id === selectedCategory.id
  );

  // --- REJIM 3: MAHSULOT DETALI ---
  if (selectedProduct) {
    return (
      <div className="katalog-light-wrapper">
        <div className="katalog-inner-header">
          <button className="katalog-back-btn" onClick={() => setSelectedProduct(null)}>
            <FiArrowLeft size={16} /> Orqaga
          </button>
          <h2>Mahsulot xususiyatlari</h2>
        </div>

        <div className="product-detail-container">
          <div className="product-detail-main">
            <div className="product-detail-img">
              <img src={selectedProduct.image_url} alt={selectedProduct.title_uz} />
            </div>
            <div className="product-detail-info">
              <h3 className="product-detail-title">{selectedProduct.title_uz}</h3>
              <p className="product-detail-price">
                Narxi: {selectedProduct.price ? `${selectedProduct.price.toLocaleString()} so'm` : "Kelishilgan narx"}
              </p>
            </div>
          </div>

          {selectedProduct.specs && selectedProduct.specs.length > 0 && (
            <div className="product-specs-section">
              <table className="specs-table">
                <tbody>
                  {selectedProduct.specs.map((spec, index) => (
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
    return (
      <div className="katalog-light-wrapper">
        <div className="katalog-inner-header">
          <button className="katalog-back-btn" onClick={() => setSelectedCategory(null)}>
            <FiArrowLeft size={16} /> Orqaga
          </button>
          <div className="inner-title-box">
            <h2>{selectedCategory.name_uz}</h2>
            <span className="badge">{filteredProducts.length} ta mahsulot</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-data-box">
            <FiPackage size={44} />
            <p>Bu katalogda hozircha mahsulotlar mavjud emas.</p>
          </div>
        ) : (
          <div className="products-light-grid">
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id} 
                className="product-light-card" 
                onClick={() => setSelectedProduct(prod)}
                style={{ cursor: "pointer" }}
              >
                <div className="product-img-box">
                  <img src={prod.image_url} alt={prod.title_uz} />
                </div>
                <div className="product-details">
                  <h4 className="product-title">{prod.title_uz}</h4>
                  <p className="product-price">
                    {prod.price ? `${prod.price.toLocaleString()} so'm` : "Kelishilgan narx"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- REJIM 1: ASOSIY KATALOGLAR REJIMI ---
  return (
    <div className="katalog-light-wrapper">
      <div className="katalog-light-banner">
        <div className="banner-left-info">
          <div className="banner-icon-title">
            <FiGrid className="main-grid-icon" />
            <h2>Xo'jalik Mollari Katalogi</h2>
          </div>
          <p>Kerakli toifani tanlang va mahsulotlar bilan tanishing</p>
        </div>
      </div>

      <div className="katalog-map-section" style={{ margin: "20px 0 30px 0", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiMapPin style={{ color: "#3b82f6" }} />
          <strong style={{ fontSize: "14px", color: "#1e293b" }}>Bizning do'konlarimiz xaritasi</strong>
        </div>
        
        <div style={{ height: "320px", width: "100%" }}>
          <MapContainer 
            center={[39.6542, 66.9287]} // Xarita ochilishi bilan to'g'ri nuqtani ko'rsatadi
            zoom={14} 
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {MOCK_SHOPS.map((shop) => (
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

      <div className="section-divider">
        <h3>Mavjud Kataloglar</h3>
        <span className="badge-count">{MOCK_CATEGORIES.length} toifa</span>
      </div>

      <div className="categories-light-grid">
        {MOCK_CATEGORIES.map((cat) => (
          <div key={cat.id} className="category-light-card" onClick={() => setSelectedCategory(cat)}>
            <div className="card-img-top">
              <div className="no-image-placeholder">
                <FiImage size={28} />
              </div>
            </div>
            <div className="card-body-content">
              <h3>{cat.name_uz}</h3>
              <div className="card-footer-action">
                <span>Tovarlarni ko'rish</span>
                <span className="arrow-icon">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}