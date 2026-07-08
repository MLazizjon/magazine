import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/client";
import { FaSpinner, FaRegClock, FaUser, FaBarcode, FaImage } from "react-icons/fa";

export default function HistoryTab({ lang = "uz" }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const translations = {
    uz: {
      title: "📷 Kiritilgan Kodlar va Rasmlar Tarixi",
      noData: "Hozircha rasmli kodlar kiritilmagan 🔍",
      loadingText: "Yuklanmoqda...",
      user: "Usta",
      code: "Kod",
      time: "Sana / Vaqt",
      photo: "Yuborilgan Rasm",
      noPhoto: "Rasm yuklanmagan"
    },
    ru: {
      title: "📷 История Введенных Кодов и Фото",
      noData: "История кодов с фото пока пуста 🔍",
      loadingText: "Загрузка...",
      user: "Мастер",
      code: "Код",
      time: "Дата / Время",
      photo: "Отправленное Фото",
      noPhoto: "Фото отсутствует"
    }
  };

  const t = translations[lang] || translations.uz;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("used_codes")
        .select(`
          id,
          created_at,
          image_url,
          status,
          profiles ( full_name, phone, region ),
          promo_codes ( code )
        `)
        .order("created_at", { ascending: false }); // Eng oxirgilari birinchi chiqadi

      if (error) throw error;
      setHistoryData(data || []);
    } catch (err) {
      console.error("Tarixni yuklashda xatolik:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()} | ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="tab-section fade-in" style={{ padding: "20px" }}>
      <h4 className="chart-title" style={{ marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
        {t.title}
      </h4>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px", gap: "10px", color: "#64748b" }}>
          <FaSpinner className="spinner-anime" /> <span>{t.loadingText}</span>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {historyData.length > 0 ? (
            historyData.map((item) => (
              <div key={item.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
                
                {/* Rasm qismi */}
                <div style={{ height: "200px", background: "#f1f5f9", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt="Promo Code Proof" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      onClick={() => window.open(item.image_url, "_blank")}
                    />
                  ) : (
                    <div style={{ color: "#94a3b8", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <FaImage size={32} />
                      <span style={{ fontSize: "13px" }}>{t.noPhoto}</span>
                    </div>
                  )}
                  <span style={{ position: "absolute", top: "10px", right: "10px", background: item.status === "approved" ? "#22c55e" : "#f59e0b", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>
                    {item.status}
                  </span>
                </div>

                {/* Ma'lumotlar qismi */}
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1 }}>
                  
                  {/* Usta haqida */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <FaUser style={{ color: "#64748b", marginTop: "3px" }} size={14} />
                    <div>
                      <strong style={{ display: "block", color: "#1e293b", fontSize: "15px" }}>{item.profiles?.full_name || "Noma'lum Usta"}</strong>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{item.profiles?.region || "-"} | {item.profiles?.phone || "-"}</span>
                    </div>
                  </div>

                  {/* Kod va Vaqt */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "10px", borderRadius: "8px", marginTop: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaBarcode style={{ color: "#0284c7" }} size={14} />
                      <span style={{ fontWeight: "700", color: "#0369a1", fontSize: "14px" }}>
                        {item.promo_codes?.code || "KOD YO'Q"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "12px" }}>
                      <FaRegClock size={12} />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>

                </div>

              </div>
            ))
          ) : (
            <div style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              {t.noData}
            </div>
          )}
        </div>
      )}
    </div>
  );
}