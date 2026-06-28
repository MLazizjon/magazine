import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// 🌟 Ikonkalarni import qilish
import { 
  FaChartBar, 
  FaKey, 
  FaCogs, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaBars, 
  FaTimes, 
  FaHistory 
} from "react-icons/fa";

// 🌟 Grafik (Chart) uchun Recharts import qilish
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";

import "./userDash.css";

// Namunaviy grafik ma'lumotlari (kelajakda Supabase-dan keladi)
const chartData = [
  { name: "Dush", bonus: 5000 },
  { name: "Sesh", bonus: 12000 },
  { name: "Chor", bonus: 7000 },
  { name: "Pay", bonus: 15000 },
  { name: "Jum", bonus: 9000 },
  { name: "Shan", bonus: 25000 },
  { name: "Yak", bonus: 20000 },
];

export default function UserDash() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [bonusCode, setBonusCode] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobil menyu holati

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.info("Tizimdan chiqdingiz");
    navigate("/login");
  };

  const handleSendCode = () => {
    if (!bonusCode) {
      toast.error("Iltimos, kodni kiriting!");
      return;
    }
    if (bonusCode === "xato") { 
      toast.error("Kod xato yoki oldin kiritilgan!");
    } else {
      toast.success("Kod muvaffaqiyatli yuborildi!");
      setBonusCode("");
    }
  };

  // Mobil menyudan biror bo'lim tanlansa, menyuni avtomat yopish
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="dash-container">
      
      {/* 📱 MOBIL UCHUN BURCHAKDAGI TOOLBAR TUGMASI */}
      <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* 🔹 CHAP MENYU (SIDEBAR) - Mobil va Kompyuterga moslashuvchan */}
      <aside className={`dash-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-logo">
          <h2>Mijoz Paneli</h2>
        </div>
        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === "home" ? "active" : ""}`} 
            onClick={() => handleTabChange("home")}
          >
            <FaChartBar className="icon" /> Home / Statistika
          </button>
          <button 
            className={`menu-item ${activeTab === "code" ? "active" : ""}`} 
            onClick={() => handleTabChange("code")}
          >
            <FaKey className="icon" /> Kodni kiritish
          </button>
          <button 
            className={`menu-item ${activeTab === "settings" ? "active" : ""}`} 
            onClick={() => handleTabChange("settings")}
          >
            <FaCogs className="icon" /> Sozlamalar
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="icon" /> Chiqish
          </button>
        </div>
      </aside>

      {/* 🔹 ASOSIY INTERFEYS */}
      <main className="dash-main">
        <header className="dash-header">
          <div className="welcome-text">
            Usta: <span className="user-name-span">{currentUser?.full_name}</span>
          </div>
          <div className="user-profile">
            <span className="role-badge">{currentUser?.role}</span>
            <FaUserCircle className="profile-avatar-icon" />
          </div>
        </header>

        <section className="dash-content">
          
          {/* 🟡 1-BO'LIM: HOME & STATISTIKA */}
          {activeTab === "home" && (
            <div className="tab-section fade-in">
              <h3>Statistika</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Joriy Bonuslar</h4>
                  <p className="stat-number">25,000 UZS</p>
                  <span className="stat-desc">Yechib olish mumkin</span>
                </div>
                <div className="stat-card">
                  <h4>Kiritilgan kodlar</h4>
                  <p className="stat-number">12 ta</p>
                  <span className="stat-desc">Haftalik faollik</span>
                </div>
              </div>

              {/* 🌟 GRAFIK QISMI (KUTUBXONADAN) */}
              <div className="chart-section">
                <h4>Haftalik bonuslar grafigi (UZS)</h4>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBonus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12}/>
                      <YAxis stroke="#64748b" fontSize={12}/>
                      <Tooltip />
                      <Area type="monotone" dataKey="bonus" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorBonus)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="history-section">
                <button className="action-btn" onClick={() => toast.info("Tarix tez kunda ochiladi...")}>
                  <FaHistory className="icon-inline" /> Bonuslar tarixini ko‘rish
                </button>
              </div>
            </div>
          )}

          {/* 🔵 2-BO'LIM: KODNI KIRITISH */}
          {activeTab === "code" && (
            <div className="tab-section fade-in">
              <h3>Kodni kiritish</h3>
              <div className="code-box">
                <p>Kodni quyidagi maydonga kiriting:</p>
                <input 
                  type="text" 
                  placeholder="Masalan: B78X99" 
                  value={bonusCode}
                  onChange={(e) => setBonusCode(e.target.value)}
                  className="code-input"
                />
                <button className="send-code-btn" onClick={handleSendCode}>Kodni tasdiqlash</button>
              </div>
            </div>
          )}

          {/* ⚪ 3-BO'LIM: SOZLAMALAR */}
          {activeTab === "settings" && (
            <div className="tab-section fade-in">
              <h3>Sozlamalar</h3>
              <div className="settings-list">
                <div className="settings-card">
                  <h4>Usta ma'lumotlari</h4>
                  <p><b>Ism:</b> {currentUser?.full_name}</p>
                  <p><b>Telefon:</b> {currentUser?.phone}</p>
                  <p><b>Viloyat:</b> {currentUser?.region}</p>
                </div>
                
                <div className="settings-actions">
                  <button className="settings-btn" onClick={() => toast.warn("Tez kunda...")}>
                    🔄 Loginni o‘zgartirish
                  </button>
                  <button className="settings-btn logout-danger" onClick={handleLogout}>
                    ❌ Tizimdan chiqish
                  </button>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}