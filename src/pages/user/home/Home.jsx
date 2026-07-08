import React, { useState, useEffect } from "react";
import { FaTrophy, FaCheckCircle, FaHourglassHalf, FaFrown, FaChartBar, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { supabase } from "../../../supabase/client"; 
import "./home.css"; 

export default function HomeTab({ 
  userId = "", 
  currentBonus = 0, 
  rank = 1,
  confirmedCount = 0,
  pendingCount = 0,
  totalUsedCount = 0,
  region = "Samarqand",
  
  // Ota komponentdan kelayotgan boshqaruvchi proplar va state-lar
  year,
  setYear,
  month,
  setMonth,
  statType,
  setStatType,
  monthsUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"]
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [filteredBonus, setFilteredBonus] = useState(0);
  const [chartStats, setChartStats] = useState([]);
  const [monthlyTotalCodes, setMonthlyTotalCodes] = useState(0);
  const [monthlyAverageBonus, setMonthlyAverageBonus] = useState(0);

  // 1. FAOL AKSIYALARNI YUKLASH
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const now = new Date().toISOString();
        const { data } = await supabase
          .from("campaigns")
          .select("*")
          .lte("start_date", now)   
          .gte("end_date", now) 
          .order("created_at", { ascending: false });
        
        if (data) setCampaigns(data);
      } catch (error) {
        console.error("Aksiyalarni yuklashda xatolik:", error);
      }
    };
    fetchCampaigns();
  }, []);

  // 2. DINAMIK FILTRLASH VA STATISTIKANI HISOBLASH
  useEffect(() => {
    const fetchRealStatistics = async () => {
      try {
        let activeUserId = userId;
        
        // Agar userId propdan kelmasa, localStorage yoki sessiyadan olamiz
        if (!activeUserId) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            activeUserId = JSON.parse(storedUser).id;
          } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) activeUserId = user.id;
          }
        }

        if (!activeUserId) return;

        // Tanlangan oyning tartib raqami (0-11)
        const monthIndex = monthsUz.indexOf(month);
        if (monthIndex === -1) return;
        
        // Tanlangan oyning birinchi va oxirgi soniyalari oralig'ini yaratish
        const startDate = new Date(parseInt(year), monthIndex, 1, 0, 0, 0).toISOString();
        const endDate = new Date(parseInt(year), monthIndex + 1, 1, 0, 0, 0).toISOString();

        // Supabase'dan tanlangan oy oralig'idagi kodlarni tortish
        const { data: codes, error } = await supabase
          .from("used_codes") 
          .select("created_at, status")
          .eq("user_id", activeUserId)
          .gte("created_at", startDate)
          .lt("created_at", endDate);

        if (error) throw error;

        // Tasdiqlangan (approved) kodlar soniga qarab ballni hisoblash
        const approvedCodes = codes ? codes.filter(c => c.status === "approved" || c.status === "confirmed") : [];
        const confirmedBonusSum = approvedCodes.length; // Har bir tasdiqlangan kod uchun ball (agar 1 balldan bo'lsa)
        
        setFilteredBonus(confirmedBonusSum);
        setMonthlyTotalCodes(codes ? codes.length : 0);
        setMonthlyAverageBonus(confirmedBonusSum > 0 ? "1.0" : "0.0");

        let generatedStats = [];
        const joriyVaqt = new Date();

        // SUTKALIK (Oxirgi 7 kunlik grafik)
        if (statType === "kun") {
          const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
          });

          generatedStats = last7Days.map(date => {
            const dayStr = date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
            const dayVal = approvedCodes.filter(c => new Date(c.created_at).toDateString() === date.toDateString()).length;
            return { label: dayStr, realVal: dayVal, active: joriyVaqt.toDateString() === date.toDateString() };
          });

        // HAFTALIK (Hafta kunlari bo'yicha)
        } else if (statType === "hafta") {
          const daysMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
          approvedCodes.forEach(c => {
            const day = new Date(c.created_at).getDay(); 
            daysMap[day] += 1;
          });
          const labels = ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Ya"];
          const JS_DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];
          generatedStats = JS_DAYS_ORDER.map((dayKey, idx) => ({
            label: labels[idx],
            realVal: daysMap[dayKey],
            active: joriyVaqt.getFullYear() === parseInt(year) && joriyVaqt.getMonth() === monthIndex && joriyVaqt.getDay() === dayKey
          }));

        // OYLIK (Haftalar kesimida)
        } else if (statType === "oy") {
          const weeksMap = { H1: 0, H2: 0, H3: 0, H4: 0 };
          approvedCodes.forEach(c => {
            const dayOfMonth = new Date(c.created_at).getDate();
            if (dayOfMonth <= 7) weeksMap.H1 += 1;
            else if (dayOfMonth <= 14) weeksMap.H2 += 1;
            else if (dayOfMonth <= 21) weeksMap.H3 += 1;
            else weeksMap.H4 += 1;
          });
          const joriyKun = joriyVaqt.getDate();
          const isCurrentMonth = joriyVaqt.getFullYear() === parseInt(year) && joriyVaqt.getMonth() === monthIndex;

          generatedStats = [
            { label: "1-Hafta", realVal: weeksMap.H1, active: isCurrentMonth && joriyKun <= 7 },
            { label: "2-Hafta", realVal: weeksMap.H2, active: isCurrentMonth && joriyKun > 7 && joriyKun <= 14 },
            { label: "3-Hafta", realVal: weeksMap.H3, active: isCurrentMonth && joriyKun > 14 && joriyKun <= 21 },
            { label: "4-Hafta", realVal: weeksMap.H4, active: isCurrentMonth && joriyKun > 21 },
          ];
        }

        // Grafik ustunlari balandligini foizda hisoblash (CSS uchun)
        const maxVal = Math.max(...generatedStats.map(s => s.realVal), 1);
        const finalStats = generatedStats.map(s => ({
          ...s,
          value: Math.min(Math.round((s.realVal / maxVal) * 100), 100)
        }));

        setChartStats(finalStats);

      } catch (err) {
        console.error("Statistikani hisoblashda xatolik:", err);
        setDefaultEmptyChart();
      }
    };

    const setDefaultEmptyChart = () => {
      const labels = statType === "oy" ? ["1-Hafta", "2-Hafta", "3-Hafta", "4-Hafta"] : ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Ya"];
      setChartStats(labels.map(l => ({ label: l, value: 0, realVal: 0, active: false })));
    };

    fetchRealStatistics();
  }, [year, month, statType, userId]); // Ushbu o'zgaruvchilar o'zgarganda useEffect qayta ishga tushadi

  return (
    <div className="tab-section fade-in">
      {/* Yuqoridagi umumiy ko'rsatkichlar kartasi */}
      <div className="stats-card-container">
        <div className="stats-row">
          <div className="inner-stat-box">
            <div className="stat-icon-wrapper trophy-bg"><FaTrophy /></div>
            <div className="stat-text-wrapper">
              <span className="stat-val-text">{rank}-o'rin</span>
              <span className="stat-lbl-text">{region}...</span>
            </div>
          </div>
          <div className="vertical-divider"></div>
          <div className="inner-stat-box">
            <div className="stat-icon-wrapper check-bg"><FaCheckCircle /></div>
            <div className="stat-text-wrapper">
              <span className="stat-val-text">{confirmedCount} ta</span>
              <span className="stat-lbl-text">Tasdiqlangan</span>
            </div>
          </div>
        </div>
        
        <div className="horizontal-divider"></div>
        
        <div className="stats-row">
          <div className="inner-stat-box">
            <div className="stat-icon-wrapper times-bg" style={{ backgroundColor: "#eab308" }}><FaHourglassHalf /></div>
            <div className="stat-text-wrapper">
              <span className="stat-val-text">{pendingCount} ta</span>
              <span className="stat-lbl-text">Kutilmoqda</span>
            </div>
          </div>
          <div className="vertical-divider"></div>
          <div className="inner-stat-box">
            <div className="stat-icon-wrapper frown-bg"><FaFrown /></div>
            <div className="stat-text-wrapper">
              <span className="stat-val-text">{totalUsedCount} ta</span>
              <span className="stat-lbl-text">Kiritilgan jami</span>
            </div>
          </div>
        </div>
      </div>

      <div className="white-content-body">
        {/* Aksiyalar Bannerlari */}
        <div className="promo-banners-container">
          {campaigns.length > 0 ? (
            campaigns.map((camp) => (
              <div key={camp.id} className="promo-banner-card" style={{ cursor: "pointer" }} onClick={() => setModalData(camp)}>
                {camp.image_url ? <img src={camp.image_url} alt={camp.title} /> : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", boxSizing: "border-box", textAlign: "center" }}>
                    <span style={{ color: "#ffffff", fontWeight: "700", fontSize: "14px" }}>{camp.title}</span>
                  </div>
                )}
                <div className="banner-badge">{camp.title.toUpperCase()}</div>
              </div>
            ))
          ) : (
            <>
              <div className="promo-banner-card">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60" alt="Promo 1" />
                <div className="banner-badge">AKFA COMFORT</div>
              </div>
              <div className="promo-banner-card">
                <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&auto=format&fit=crop&q=60" alt="Promo 2" />
                <div className="banner-badge">AURORA 10 BAL</div>
              </div>
            </>
          )}
        </div>

        {/* 🎛️ SANANI BELGILASH INPUTLARI (SELECT) */}
        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">Yil</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="filter-select">
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Oy</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="filter-select">
              {monthsUz.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 🏆 TANLANGAN KUNDAGI/OYDAGI BALL */}
        <div className="total-score-box">
          <span className="score-title">To'plangan ball ({month} - {year})</span>
          <div className="score-divider"></div>
          <span className="score-number" style={{ color: "#2563eb" }}>{filteredBonus} ball</span>
        </div>

        {/* GRAFIK DIAGRAMMASI */}
        <div className="home-bottom-statistics">
          <div className="stats-header-row">
            <div className="stats-header-title">
              <FaChartBar className="chart-icon-lead" />
              <div>
                <h3>Faollik statistikasi</h3>
                <p>Tanlangan davr bo'yicha grafik tahlil</p>
              </div>
            </div>
            
            <div className="stats-header-badge" style={{ padding: "2px 6px", background: "#f1f5f9" }}>
              <select value={statType} onChange={(e) => setStatType(e.target.value)} style={{ border: "none", background: "none", fontSize: "12px", fontWeight: "600", color: "#475569", outline: "none", cursor: "pointer" }}>
                <option value="kun">Sutkalik</option>
                <option value="hafta">Haftalik</option>
                <option value="oy">Oylik</option>
              </select>
            </div>
          </div>

          <div className="visual-chart-bars">
            {chartStats.map((item, index) => (
              <div className="chart-bar-column" key={index}>
                <div className="bar-track">
                  <div className={`bar-fill ${item.active ? "bar-active" : ""}`} style={{ height: `${item.value}%` }}>
                    <span className="bar-tooltip-val">{item.realVal} ball</span>
                  </div>
                </div>
                <span className="bar-label-day" style={{ fontSize: "11px" }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="stats-summary-footer">
            <div className="summary-item">
              <span className="sum-lbl">Oydagi jami kodlar</span>
              <span className="sum-val">{monthlyTotalCodes} ta</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-item">
              <span className="sum-lbl">O'rtacha bonus ball</span>
              <span className="sum-val">+{monthlyAverageBonus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalData && (
        <div className="home-modal-overlay" onClick={() => setModalData(null)}>
          <div className="home-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="home-modal-close" onClick={() => setModalData(null)}><FaTimes /></button>
            {modalData.image_url ? <img src={modalData.image_url} alt={modalData.title} className="home-modal-img" /> : (
              <div style={{ width: "100%", height: "180px", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#ffffff", fontWeight: "700", fontSize: "18px" }}>{modalData.title}</span>
              </div>
            )}
            <div className="home-modal-body">
              <h3>{modalData.title}</h3>
              {modalData.content && <p className="home-modal-text" style={{ marginBottom: "14px", color: "#475569" }}>{modalData.content}</p>}
              <div className="home-modal-dates">
                <p><FaCalendarAlt /> <strong>Boshlanishi:</strong> {new Date(modalData.start_date).toLocaleDateString()}</p>
                <p><FaCalendarAlt /> <strong>Tugashi:</strong> {new Date(modalData.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}