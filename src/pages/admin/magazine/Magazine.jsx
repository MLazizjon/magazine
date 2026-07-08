import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/client";
import { toast } from "react-toastify";
import { FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import "../magazine/magazine.css"; // 👈 Mana, CSS fayli chotkiy qilib import qilindi!

export default function MagazinTab() {
  const [prizes, setPrizes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  // Ma'lumotlarni yuklash
  const fetchData = async () => {
    try {
      const { data: p, error: pErr } = await supabase.from("prizes").select("*");
      if (pErr) throw pErr;

      const { data: o, error: oErr } = await supabase
        .from("orders")
        .select("id, status, user_id, prize_id, profiles(full_name, phone), prizes(name, price)")
        .order("created_at", { ascending: false });
      if (oErr) throw oErr;

      setPrizes(p || []);
      setOrders(o || []);
    } catch (err) {
      toast.error("Ma'lumot yuklashda xatolik: " + err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Yangi sovg'a qo'shish
  const addPrize = async () => {
    if (!name.trim() || !price) return toast.error("Hamma maydonlarni to'ldiring!");
    setLoading(true);
    try {
      const { error } = await supabase.from("prizes").insert([{ name: name.trim(), price: Number(price) }]);
      if (error) throw error;

      toast.success("Yangi sovg'a do'konga qo'shildi! 🎁");
      setName("");
      setPrice("");
      fetchData();
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buyurtma statusini yangilash (Tasdiqlash / Rad etish)
  const updateOrderStatus = async (order, newStatus) => {
    try {
      if (newStatus === "rejected") {
        const { data: prof } = await supabase.from("profiles").select("bonus").eq("id", order.user_id).single();
        if (prof) {
          const refundBonus = (prof.bonus || 0) + (order.prizes?.price || 0);
          await supabase.from("profiles").update({ bonus: refundBonus }).eq("id", order.user_id);
        }
      }

      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", order.id);
      if (error) throw error;

      toast.info(`Buyurtma holati o'zgardi: ${newStatus} 🔄`);
      fetchData();
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    }
  };

  return (
    <div className="magazin-admin">
      <h2>🎁 Sovg'alar Do'koni (Admin)</h2>
      
      {/* Sovg'a qo'shish formasi */}
      <div className="add-prize-form">
        <input 
          value={name} 
          placeholder="Sovg'a nomi (Masalan: Kepka)" 
          onChange={(e) => setName(e.target.value)} 
        />
        <input 
          value={price} 
          type="number" 
          placeholder="Ball narxi (Masalan: 15)" 
          onChange={(e) => setPrice(e.target.value)} 
        />
        <button onClick={addPrize} disabled={loading}>
          <FaPlus /> Qo'shish
        </button>
      </div>

      {/* Kelgan so'rovlar */}
      <h3>📥 Kelib tushgan so'rovlar</h3>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Usta (Foydalanuvchi)</th>
            <th>Telefon</th>
            <th>So'ralgan narsa</th>
            <th>Ketti (Ball)</th>
            <th>Status</th>
            <th>Amal</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.profiles?.full_name || "Noma'lum"}</td>
              <td>{o.profiles?.phone || "-"}</td>
              <td>{o.prizes?.name || "O'chirilgan"}</td>
              <td>{o.prizes?.price || 0}</td>
              <td>
                <span className={`status-text ${o.status}`}>
                  {o.status === "approved" ? "Tasdiqlandi" : o.status === "rejected" ? "Rad etildi" : "Kutilmoqda"}
                </span>
              </td>
              <td>
                {o.status === "pending" && (
                  <>
                    <button onClick={() => updateOrderStatus(o, "approved")} title="Tasdiqlash">
                      <FaCheck />
                    </button>
                    <button onClick={() => updateOrderStatus(o, "rejected")} title="Rad etish">
                      <FaTimes />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}