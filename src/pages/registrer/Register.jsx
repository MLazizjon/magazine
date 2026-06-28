import { useState } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./register.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const register = async () => {
    // 1. Bo'sh maydonlarni tekshirish
    if (!fullName || !phone || !region || !password || !role) {
      return toast.error("Iltimos, barcha maydonlarni to‘ldiring!");
    }

    // 🔥 2. ISM VALIDATION (kamida 3 ta harf)
    if (fullName.trim().length <= 2) {
      return toast.error("Ism kamida 3 ta harfdan iborat bo‘lishi kerak!");
    }

    // 🔥 3. TELEFON VALIDATION (+998 bilan boshlanishi va 13 ta belgi)
    if (!phone.startsWith("+998")) {
      return toast.error("Telefon raqami +998 bilan boshlanishi majburiy!");
    }
    if (phone.length !== 13) {
      return toast.error("Telefon raqami noto‘g‘ri! Jami 13 ta belgi bo‘lishi kerak (masalan: +998901234567).");
    }

    // 🔥 4. PAROL VALIDATION (kamida 4 ta belgi)
    if (password.length < 4) {
      return toast.error("Parol juda qisqa! Kamida 4 ta belgidan iborat bo‘lsin.");
    }

    // Telefon bandligini tekshirish
    const { data: existing } = await supabase
      .from("profiles")
      .select("phone")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      return toast.error("Bu telefon allaqachon ro‘yxatdan o‘tgan");
    }

    // Bazaga yuborish
    const { error } = await supabase.from("profiles").insert([
      {
        full_name: fullName.trim(),
        phone,
        region,
        password,
        role,
      },
    ]);

    if (error) {
      return toast.error(error.message);
    }

    toast.success("Ro‘yxatdan muvaffaqiyatli o‘tdingiz!");
    navigate("/login");
  };

  return (
    <div className="auth">
      <h2>Register</h2>

      <input 
        placeholder="Ism (kamida 3 ta harf)" 
        onChange={(e) => setFullName(e.target.value)} 
      />
      <input 
        placeholder="Telefon (+998901234567)" 
        value={phone}
        onChange={(e) => setPhone(e.target.value)} 
      />

      <select onChange={(e) => setRegion(e.target.value)}>
        <option value="">Viloyatni tanlang</option>
        <option>Tashkent</option>
        <option>Samarkand</option>
        <option>Andijan</option>
      </select>

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="">Kim bo‘lib ro‘yxatdan o‘tasiz?</option>
        <option value="user">Mijoz</option>
        <option value="admin">Admin</option>
      </select>

      <input 
        type="password" 
        placeholder="Parol (kamida 4 ta belgi)" 
        onChange={(e) => setPassword(e.target.value)} 
      />

      <button onClick={register}>Yuborish</button>
    </div>
  );
}