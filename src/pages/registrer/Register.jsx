import { useState } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./register.css";

const UZBEKISTAN_REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Buxoro",
  "Farg'ona",
  "Jizzax",
  "Xorazm",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
  "Qoraqalpog'iston Respublikasi"
];

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [region, setRegion] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    let input = e.target.value;
    if (!input.startsWith("+998")) {
      input = "+998 ";
    }
    const cleanNumbers = input.slice(4).replace(/\D/g, "");
    const limitedNumbers = cleanNumbers.substring(0, 9);

    let formattedPhone = "+998 ";
    if (limitedNumbers.length > 0) formattedPhone += limitedNumbers.substring(0, 2);
    if (limitedNumbers.length > 2) formattedPhone += " " + limitedNumbers.substring(2, 5);
    if (limitedNumbers.length > 5) formattedPhone += " " + limitedNumbers.substring(5, 7);
    if (limitedNumbers.length > 7) formattedPhone += " " + limitedNumbers.substring(7, 9);

    setPhone(formattedPhone);
  };

  const register = async () => {
    const rawPhone = phone.replace(/\s/g, "");

    if (!fullName || rawPhone === "+998" || !region || !password) {
      return toast.error("Iltimos, barcha maydonlarni to‘ldiring!");
    }
    if (fullName.trim().length <= 2) {
      return toast.error("Ism kamida 3 ta harf bo‘lishi kerak!");
    }
    if (rawPhone.length !== 13) {
      return toast.error("Telefon raqami to'liq kiritilmadi!");
    }
    if (password.length < 4) {
      return toast.error("Parol kamida 4 ta belgidan iborat bo‘lsin!");
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from("profiles")
        .select("phone")
        .eq("phone", rawPhone)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) return toast.error("Bu telefon allaqachon ro‘yxatdan o‘tgan!");

      const { error: insertError } = await supabase.from("profiles").insert([
        {
          full_name: fullName.trim(),
          phone: rawPhone,
          region,
          password,
          role: "user",
        },
      ]);

      if (insertError) throw insertError;

      toast.success("Ro‘yxatdan muvaffaqiyatli o‘tdingiz!");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  };

  // Input va Select elementlari 100% bir xil turishi uchun umumiy stil
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box"
  };

  // Placeholder va selectning default holatidagi rangini bir xil qilish uchun stil
  const selectStyle = {
    ...inputStyle,
    color: region ? "inherit" : "#9ca3af", // Agar viloyat tanlanmagan bo'lsa, placeholder rangi (gray-400) bo'ladi
    background: 'white',
    border: '1.5px solid #e2e8f0',
    padding: '15px ',
    borderRadius: '10px',
    
  };

  return (
    <div className="auth">
      <h2>Ro`yxatdan o`tish</h2>

      <div className="input-group">
        <input
          type="text"
          placeholder="Ism (kamida 3 ta harf)"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="+998 90 123 45 67"
          value={phone}
          onChange={handlePhoneChange}
          style={inputStyle}
        />
      </div>

      <div className="input-group">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={selectStyle}
        >
          <option value="" style={{ color: "#9ca3af" }}>Viloyatni tanlang</option>
          {UZBEKISTAN_REGIONS.map((reg) => (
            <option key={reg} value={reg} style={{ color: "initial" }}>
              {reg}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <input
          type="password"
          placeholder="Parol (kamida 4 ta belgi)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button className="btn-submit" onClick={register}>
        Yuborish
      </button>

      <p className="auth-link" 
         style={{ textAlign: "center", cursor: "pointer", color: "#007bff" }} 
         onClick={() => navigate("/login")}
      >
        Tizimga kirish sahifasiga o`tish
      </p>
    </div>
  );
}