import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/client";
import { toast } from "react-toastify";
import { FaCoins, FaGift, FaShoppingBag, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "../magazine/magazine.css";

export default function UserMagazin({ currentUser }) {
  const [prizes, setPrizes] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [userBonus, setUserBonus] = useState(0);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  // Ma'lumotlarni yuklash (Sovg'alar, Foydalanuvchi balansi va Buyurtmalar tarixi)
  const fetchData = async () => {
    if (!currentUser?.id) return;
    try {
      // 1. Do'kondagi sovg'alarni olish
      const { data: pData, error: pErr } = await supabase
        .from("prizes")
        .select("*")
        .order("price", { ascending: true });
      if (pErr) throw pErr;
      setPrizes(pData || []);

      // 2. Foydalanuvchining joriy bonusbalansini qayta tekshirish
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select("bonus")
        .eq("id", currentUser.id)
        .single();
      if (profErr) throw profErr;
      setUserBonus(profData?.bonus || 0);

      // 3. Foydalanuvchining buyurtmalar tarixini olish
      const { data: oData, error: oErr } = await supabase
        .from("orders")
        .select("id, status, created_at, prizes(name, price)")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      if (oErr) throw oErr;
      setMyOrders(oData || []);

    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xatolik: " + err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Sovg'aga buyurtma berish (Sotib olish)
  const handleBuyPrize = async (prize) => {
    if (userBonus < prize.price) {
      return toast.error("Kechirasiz, balansingizda yetarli ball mavjud emas! 😔");
    }

    const confirmBuy = window.confirm(`"${prize.name}" sovg'asini ${prize.price} ballga sotib olmoqchimisiz?`);
    if (!confirmBuy) return;

    setLoadingOrderId(prize.id);
    try {
      // 1. Foydalanuvchi balansidan ballni ayirish
      const newBonus = userBonus - prize.price;
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ bonus: newBonus })
        .eq("id", currentUser.id);
      
      if (profileErr) throw profileErr;

      // 2. Orders (buyurtmalar) jadvaliga yangi qator qo'shish
      const { error: orderErr } = await supabase
        .from("orders")
        .insert([
          {
            user_id: currentUser.id,
            prize_id: prize.id,
            status: "pending" // Kutilmoqda statusi
          }
        ]);

      if (orderErr) throw orderErr;

      toast.success("Buyurtma qabul qilindi! Admin tasdiqlashini kuting. 🎁");
      fetchData(); // Sahifani yangilash
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + err.message);
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="user-magazin-container">
      
      {/* 🔝 TEPPA QISM: BALANS KARTASI */}
      <div className="magazin-header-card">
        <div className="header-info">
          <h2>🎁 Sovg'alar do'koni</h2>
          <p>Yig'gan ballaringizni ajoyib sovg'alarga almashtiring!</p>
        </div>
        <div className="user-balance-badge">
          <FaCoins className="coin-icon" />
          <div className="balance-text">
            <span>Sizning balansingiz:</span>
            <strong>{userBonus} ball</strong>
          </div>
        </div>
      </div>

      {/* 🛍️ ASOSIY QISM: SOVG'ALAR RO'YXATI (GRID) */}
      <h3 className="section-title"><FaShoppingBag /> Mavjud sovg'alar</h3>
      <div className="prizes-grid">
        {prizes.length === 0 ? (
          <p className="empty-text">Hozircha do'konda sovg'alar yo'q.</p>
        ) : (
          prizes.map((prize) => {
            const isAffordable = userBonus >= prize.price;
            return (
              <div className={`prize-card ${!isAffordable ? "locked" : ""}`} key={prize.id}>
                <div className="prize-icon-wrapper">
                  <FaGift />
                </div>
                <div className="prize-details">
                  <h4>{prize.name}</h4>
                  <div className="prize-price-tag">
                    <FaCoins /> {prize.price} ball
                  </div>
                  <button
                    className={`buy-btn ${isAffordable ? "active" : "disabled"}`}
                    onClick={() => handleBuyPrize(prize)}
                    disabled={!isAffordable || loadingOrderId === prize.id}
                  >
                    {loadingOrderId === prize.id ? "Yuborilmoqda..." : isAffordable ? "Sotib olish" : "Ball yetarli emas"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 📜 BUYURTMALAR TARIXI */}
      <h3 className="section-title"><FaClock /> Buyurtmalaringiz tarixi</h3>
      <div className="orders-history-card">
        {myOrders.length === 0 ? (
          <p className="empty-text">Sizda hali buyurtmalar mavjud emas.</p>
        ) : (
          <div className="user-orders-table-wrapper">
            <table className="user-orders-table">
              <thead>
                <tr>
                  <th>Sovg'a nomi</th>
                  <th>Sarflangan ball</th>
                  <th>Sana</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.prizes?.name || "O'chirilgan mahsulot"}</strong></td>
                    <td className="table-price"><FaCoins /> {order.prizes?.price || 0}</td>
                    <td>{new Date(order.created_at).toLocaleDateString("uz-UZ")}</td>
                    <td>
                      <span className={`user-status-badge ${order.status}`}>
                        {order.status === "pending" && <><FaClock /> Kutilmoqda</>}
                        {order.status === "approved" && <><FaCheckCircle /> Topshirildi</>}
                        {order.status === "rejected" && <><FaTimesCircle /> Rad etildi</>}
                      </span>
                    </td>
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