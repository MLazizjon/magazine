// import { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { supabase } from "../../../supabase/client";

// import { 
//   FaUsers, FaTools, FaGift, FaUserClock, 
//    FaRandom, FaHourglassHalf, FaCogs, 
//   FaSignOutAlt, FaBars, FaTimes, FaFilePdf, FaCheckCircle
// } from "react-icons/fa";

// import { 
//   ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
//   CartesianGrid, Tooltip 
// } from "recharts";

// import "./adminDash.css"; // CSS fayl bog'landi

// export default function AdminDash() {
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
  
//   const [stats, setStats] = useState({ totalUsers: 0, activeMasters: 0, pendingBonus: 0, newClients: 0 });
//   const [topMasters, setTopMasters] = useState([]);
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [mastersList, setMastersList] = useState([]);
  
//   const [codeQuantity, setCodeQuantity] = useState("");
//   const [generatedCodes, setGeneratedCodes] = useState([]);
  
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [bonusTitle, setBonusTitle] = useState("");
//   const [bonusDuration, setBonusDuration] = useState("3");

//   const navigate = useNavigate();

//   const fetchDashboardData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
//       const { count: pendingCount } = await supabase.from("used_codes").select("*", { count: "exact", head: true });

//       setStats({
//         totalUsers: usersCount || 0,
//         activeMasters: Math.floor((usersCount || 0) * 0.75),
//         pendingBonus: pendingCount || 0,
//         newClients: Math.floor((usersCount || 0) * 0.12)
//       });

//       const { data: profiles, error: profError } = await supabase
//         .from("profiles")
//         .select("*")
//         .order("bonus", { ascending: false });

//       if (profError) throw profError;
//       setMastersList(profiles || []);

//       const chartData = (profiles || []).slice(0, 5).map(u => ({
//         name: u.full_name || u.phone,
//         ball: u.bonus || 0
//       }));
//       setTopMasters(chartData);

//       const { data: pendingData } = await supabase
//         .from("used_codes")
//         .select(`
//           id,
//           created_at,
//           user_id,
//           profiles (full_name, phone, region),
//           promo_codes (code)
//         `)
//         .limit(10);
      
//       setPendingRequests(pendingData || []);

//     } catch (error) {
//       console.error("Xatolik:", error.message);
//       toast.error("Ma'lumotlar sinxronizatsiyasida muammo yuz berdi");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const checkAdmin = async () => {
//       const storedUser = localStorage.getItem("user");
//       if (!storedUser) {
//         navigate("/login");
//         return;
//       }
//       const user = JSON.parse(storedUser);
//       if (user.role !== "admin") {
//         toast.error("Siz admin emassiz!");
//         navigate("/user-dashboard");
//         return;
//       }
//       await fetchDashboardData();
//     };

//     checkAdmin();
//   }, [navigate, fetchDashboardData]);

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     toast.info("Tizimdan chiqdingiz");
//     navigate("/login");
//   };

//   const handleGenerateCodes = async () => {
//     const qty = parseInt(codeQuantity);
//     if (!qty || qty <= 0 || qty > 10000) {
//       toast.error("Iltimos, to'g'ri miqdor kiriting (Max: 10,000)!");
//       return;
//     }

//     setLoading(true);
//     const codesSet = new Set();
//     const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

//     while (codesSet.size < qty) {
//       let result = "";
//       for (let i = 0; i < 8; i++) {
//         result += characters.charAt(Math.floor(Math.random() * characters.length));
//       }
//       codesSet.add(result);
//     }

//     const finalCodesArray = Array.from(codesSet).map(code => ({
//       code: code,
//       is_active: true
//     }));

//     try {
//       const { error } = await supabase.from("promo_codes").insert(finalCodesArray);
//       if (error) throw error;

//       setGeneratedCodes(Array.from(codesSet));
//       toast.success(`${qty} ta unikal kod bazaga muvaffaqiyatli yuklandi! 🎉`);
//       setCodeQuantity("");
//     } catch (err) {
//       toast.error("Kodlarni bazaga yozishda xatolik: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApproveBonus = async (requestId, userId, currentBonus) => {
//     try {
//       const { error: userError } = await supabase
//         .from("profiles")
//         .update({ bonus: currentBonus + 1 })
//         .eq("id", userId);

//       if (userError) throw userError;

//       const { error: deleteError } = await supabase
//         .from("used_codes")
//         .delete()
//         .eq("id", requestId);

//       if (deleteError) throw deleteError;

//       toast.success("Usta balli muvaffaqiyatli tasdiqlandi!");
//       fetchDashboardData();
//     } catch (err) {
//       toast.error("Tasdiqlashda xatolik: " + err.message);
//     }
//   };

//   return (
//     <div className="dash-container">
//       <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//         {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
//       </button>

//       <aside className={`dash-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
//         <div className="sidebar-logo">
//           <h2>ADMIN PANEL</h2>
//           <span>Senior Control v2.0</span>
//         </div>
//         <nav className="sidebar-menu">
//           <button className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }}>
//             <FaCogs className="icon" /> Dashboard / Asosiy
//           </button>
//           <button className={`menu-item ${activeTab === "ustalar" ? "active" : ""}`} onClick={() => { setActiveTab("ustalar"); setIsMobileMenuOpen(false); }}>
//             <FaTools className="icon" /> Ustalar Bazasi
//           </button>
//           <button className={`menu-item ${activeTab === "random" ? "active" : ""}`} onClick={() => { setActiveTab("random"); setIsMobileMenuOpen(false); }}>
//             <FaRandom className="icon" /> Kod Generator
//           </button>
//           <button className={`menu-item ${activeTab === "bonuslar" ? "active" : ""}`} onClick={() => { setActiveTab("bonuslar"); setIsMobileMenuOpen(false); }}>
//             <FaGift className="icon" /> Aksiya Muddatlari
//           </button>
//         </nav>
//         <div className="sidebar-footer">
//           <button className="logout-btn" onClick={handleLogout}>
//             <FaSignOutAlt className="icon" /> Chiqish
//           </button>
//         </div>
//       </aside>

//       <main className="dash-main">
//         <header className="dash-header">
//           <div className="welcome-text">
//             Tizim holati: {loading ? <span style={{color: "var(--warning)"}}>Sinxronizatsiya...</span> : <span style={{color: "var(--success)"}}>Onlayn (Supabase)</span>}
//           </div>
//           <div className="user-profile"><span className="role-badge">SUPER ADMIN</span></div>
//         </header>

//         <section className="dash-content">
          
//           {activeTab === "dashboard" && (
//             <div className="tab-section fade-in">
//               <h3>Ssenariy bo'yicha Tahlillar</h3>
//               <br />
//               <div className="stats-grid">
//                 <div className="stat-card">
//                   <div className="stat-card-header"><h4>Umumiy Ustalar</h4><FaUsers className="card-icon blue" /></div>
//                   <p className="stat-number">{stats.totalUsers} ta</p>
//                 </div>
//                 <div className="stat-card">
//                   <div className="stat-card-header"><h4>Faol Mijozlar</h4><FaTools className="card-icon green" /></div>
//                   <p className="stat-number">{stats.activeMasters} ta</p>
//                 </div>
//                 <div className="stat-card">
//                   <div className="stat-card-header"><h4>Kutilayotgan Bonuslar</h4><FaUserClock className="card-icon orange" /></div>
//                   <p className="stat-number" style={{color: "var(--warning)"}}>{stats.pendingBonus} ariza</p>
//                 </div>
//               </div>

//               <div className="chart-section">
//                 <h4>📊 Eng ko'p ball to'plagan eng top ustalar diagrammasi</h4>
//                 <br />
//                 <div style={{ width: "100%", height: 300 }}>
//                   <ResponsiveContainer>
//                     <BarChart data={topMasters}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                       <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
//                       <YAxis stroke="#64748b" fontSize={12} />
//                       <Tooltip />
//                       <Bar dataKey="ball" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Joriy ballari" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               <div className="history-section">
//                 <h4>Yangi kiritilgan bonuslarni tasdiqlash paneli</h4>
//                 <div className="stats-grid" style={{marginTop: "15px", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))"}}>
//                   {pendingRequests.length === 0 ? (
//                     <p style={{color: "var(--text-muted)", fontSize: "14px"}}>Hozircha kutilayotgan arizalar mavjud emas.</p>
//                   ) : (
//                     pendingRequests.map((req) => (
//                       <div key={req.id} className="stat-card">
//                         <h5 style={{margin: "0 0 8px 0", fontSize: "16px"}}>{req.profiles?.full_name || "Noma'lum Usta"}</h5>
//                         <p style={{fontSize: "13px", margin: "4px 0", color: "var(--text-muted)"}}>Tel: {req.profiles?.phone}</p>
//                         <p style={{fontSize: "14px", margin: "8px 0 16px 0", fontWeight: "600"}}>
//                           Kod: <span style={{background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px"}}>{req.promo_codes?.code}</span>
//                         </p>
//                         <button 
//                           className="send-code-btn" 
//                           style={{width: "100%", background: "var(--success)", justifyContent: "center"}}
//                           onClick={() => handleApproveBonus(req.id, req.user_id, req.profiles?.bonus || 0)}
//                         >
//                           <FaCheckCircle /> Tasdiqlash
//                         </button>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "ustalar" && (
//             <div className="tab-section fade-in">
//               <h3>Baza ma'lumotlari: Ro'yxatdan o'tgan barcha ustalar</h3>
//               <br />
//               <div className="custom-table-wrapper">
//                 <table className="custom-table">
//                   <thead>
//                     <tr>
//                       <th>Ism Familiya</th>
//                       <th>Telefon raqami</th>
//                       <th>Hudud</th>
//                       <th style={{textAlign: "right"}}>Umumiy Ballari</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {mastersList.map((master) => (
//                       <tr key={master.id}>
//                         <td style={{fontWeight: "500"}}>{master.full_name || "Kiritilmagan"}</td>
//                         <td style={{color: "var(--text-muted)"}}>{master.phone}</td>
//                         <td>{master.region || "Mavjud emas"}</td>
//                         <td style={{textAlign: "right", fontWeight: "bold", color: "var(--success)"}}>{master.bonus || 0} ball</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {activeTab === "random" && (
//             <div className="tab-section fade-in">
//               <h3>Senior Random Generator (Takrorlanmas unikal kodlar)</h3>
//               <br />
//               <div className="code-box">
//                 <p style={{color: "var(--text-muted)", marginTop: 0}}>Bazaga bir vaqtning o'zida yuboriladigan kodlar sonini kiriting:</p>
//                 <div style={{display: "flex", gap: "15px", alignItems: "center", marginTop: "16px"}}>
//                   <input 
//                     type="number" 
//                     placeholder="Masalan: 5000" 
//                     value={codeQuantity}
//                     onChange={(e) => setCodeQuantity(e.target.value)}
//                     className="code-input"
//                     style={{maxWidth: "300px"}}
//                     disabled={loading}
//                   />
//                   <button className="send-code-btn" onClick={handleGenerateCodes} disabled={loading}>
//                     {loading ? "Generatsiya..." : <><FaRandom /> Supabase'ga yozish</> }
//                   </button>
//                 </div>

//                 {generatedCodes.length > 0 && (
//                   <div style={{marginTop: "32px"}} className="fade-in">
//                     <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
//                       <h4>Muvaffaqiyatli saqlangan oxirgi partiya ({generatedCodes.length} ta)</h4>
//                       <button className="send-code-btn" onClick={() => toast.info("PDF yuklanmoqda...")} style={{background: "var(--danger)"}}>
//                         <FaFilePdf /> PDF yuklab olish
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === "bonuslar" && (
//             <div className="tab-section fade-in">
//               <h3>Aksiya Amallari va Smart Eslatmalarni boshqarish</h3>
//               <br />
//               <div className="code-box" style={{maxWidth: "650px"}}>
//                 <h4>Ikki sana oralig'idagi barcha o'zgarishlar tarixi:</h4>
//                 <div style={{display: "flex", gap: "15px", marginTop: "16px"}}>
//                   <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="code-input" />
//                   <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="code-input" />
//                 </div>
//                 <button className="send-code-btn" style={{marginTop: "16px"}} onClick={() => toast.success("Filtrlangan ma'lumotlar yuklandi!")}>
//                   Hisobotni chiqarish
//                 </button>

//                 <hr style={{margin: "32px 0", border: "0", borderTop: "1px solid var(--border-color)"}} />

//                 <h4>Yangi aksiya muddati sozlamalari:</h4>
//                 <div style={{marginTop: "16px"}}>
//                   <label style={{fontWeight: "500", display: "block", marginBottom: "8px"}}>Aksiya sarlavhasi (Title):</label>
//                   <input type="text" placeholder="Masalan: Yozgi Super Aksiya" value={bonusTitle} onChange={(e) => setBonusTitle(e.target.value)} className="code-input" />
                  
//                   <label style={{fontWeight: "500", display: "block", marginBottom: "8px", marginTop: "16px"}}>Davomiylik muddati:</label>
//                   <select value={bonusDuration} onChange={(e) => setBonusDuration(e.target.value)} className="code-input" style={{padding: "12px"}}>
//                     <option value="1">1 Oy</option>
//                     <option value="3">3 Oy</option>
//                     <option value="6">6 Oy</option>
//                   </select>
//                 </div>
                
//                 <blockquote style={{margin: "24px 0", padding: "16px", background: "#fffbeb", borderLeft: "4px solid var(--warning)", borderRadius: "4px", fontSize: "14px", color: "#78350f", lineHeight: "1.5"}}>
//                   <FaHourglassHalf color="var(--warning)" style={{marginRight: "8px"}} /> 
//                   <b>Smart Eslatma Tizimi:</b> Tanlangan muddat yakunlanishiga 3 kun qolganida, tizim barcha ustalarga o'z sahifasida avtomatik ravishda eslatish xabarlarini chiqaradi.
//                 </blockquote>

//                 <button className="send-code-btn" onClick={() => toast.success("Aksiya muvaffaqiyatli ishga tushirildi!")}>
//                   Aksiyani faollashtirish
//                 </button>
//               </div>
//             </div>
//           )}

//         </section>
//       </main>
//     </div>
//   );
// }