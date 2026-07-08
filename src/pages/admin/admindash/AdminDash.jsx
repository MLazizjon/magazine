import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "../../../supabase/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaBars, FaTimes } from "react-icons/fa";

import Sidebar from "../sidebar/Sidebar";
import DashboardTab from "../dashboard/Dashbard";
import MastersTab from "../ustalar/Ustalar";
import GeneratorTab from "../kodgenarator/Kodgenerator";
import AksiyaTab from "../aksiya/Aksiya";
import MaslahatlarTab from "../news/News";
import ProfilTab from "../profil/Profil"; 
import HistoryTab from "../kodtarixi/Kodtarixi";
import MagazinTab from "../magazine/Magazine"; 

import "./adminDash.css";

export default function AdminDash() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem("app_lang") || "uz");

  const [stats, setStats] = useState({ totalUsers: 0, activeMasters: 0, totalCodes: 0, newClients: 0 });
  const [topMasters, setTopMasters] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [mastersList, setMastersList] = useState([]);
  const [allPromoCodes, setAllPromoCodes] = useState([]); 
  const [codeQuantity, setCodeQuantity] = useState("");
  const [generationDate, setGenerationDate] = useState(""); 
  const [sortOrder, setSortOrder] = useState("desc");

  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [historyRes, profilesRes, promoRes] = await Promise.all([
        supabase.from("used_codes").select(`id, created_at, user_id, profiles (full_name, phone, region, bonus), promo_codes (code)`).order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("bonus", { ascending: false }),
        supabase.from("promo_codes").select("*").order("created_at", { ascending: false })
      ]);

      setPendingRequests(historyRes.data || []);
      setMastersList(profilesRes.data || []);
      setAllPromoCodes(promoRes.data || []);

      setStats({
        totalUsers: profilesRes.data?.length || 0,
        activeMasters: profilesRes.data?.filter(m => m.is_active !== false).length || 0,
        totalCodes: promoRes.data?.length || 0,
        newClients: Math.floor(profilesRes.data?.length * 0.1) || 0
      });

      const chartData = (profilesRes.data || []).map(u => ({
        name: u.full_name || u.phone || "Noma'lum",
        ball: Number(u.bonus) || 0,
        kiritishlarSonini: (historyRes.data || []).filter(req => req.user_id === u.id).length
      }));
      setTopMasters(chartData);

    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return navigate("/login");
      const localUser = JSON.parse(storedUser);
      
      const { data: profile } = await supabase.from("profiles").select("role, is_active, language").eq("id", localUser.id).single();
      if (!profile || profile.role !== "admin" || !profile.is_active) {
        toast.error("Sizda admin huquqlari yo'q!");
        return navigate("/user-dashboard");
      }
      if (profile.language) setLang(profile.language);
      fetchDashboardData();
    };
    checkAdminStatus();
  }, [navigate, fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sortedChartData = [...topMasters].sort((a, b) => sortOrder === "asc" ? a.ball - b.ball : b.ball - a.ball).slice(0, 10);

  return (
    <div className="dash-container">
      {/* 📱 Chap tomondagi ixcham to'rtburchak mobil menyu tugmasi */}
      <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mastersCount={mastersList.length} 
        codesCount={allPromoCodes.length}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        lang={lang} 
      />

      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <main className="dash-main">
        <section className="dash-content">
          {activeTab === "dashboard" && (
            <DashboardTab stats={stats} sortOrder={sortOrder} setSortOrder={setSortOrder} sortedChartData={sortedChartData} pendingRequests={pendingRequests} lang={lang} />
          )}

          {activeTab === "ustalar" && (
            <MastersTab mastersList={mastersList} navigate={navigate} toggleMasterStatus={() => {}} lang={lang} />
          )}

          {activeTab === "random" && (
            <GeneratorTab codeQuantity={codeQuantity} setCodeQuantity={setCodeQuantity} loading={loading} allPromoCodes={allPromoCodes} lang={lang} />
          )}

          {activeTab === "magazin" && (
            <MagazinTab lang={lang} />
          )}

          {activeTab === "history" && (
            <HistoryTab lang={lang} />
          )}
          
          {activeTab === "aksiya" && (
            <AksiyaTab lang={lang} />
          )}

          {activeTab === "maslahatlar" && (
            <MaslahatlarTab lang={lang} />
          )}

          {activeTab === "profil" && (
            <ProfilTab handleLogout={handleLogout} lang={lang} changeLanguage={() => {}} />
          )}
        </section>
      </main>
    </div>
  );
}