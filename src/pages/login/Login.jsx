import { useState } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  // Boshlang'ich holatda uzbekistan kodi turadi
  const [phone, setPhone] = useState("+998 ");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Telefon raqamini faqat raqamlardan iborat qilish va formatlash funksiyasi
  const handlePhoneChange = (e) => {
    let input = e.target.value;

    // Agar foydalanuvchi boshlang'ich +998 ni o'chirib tashlamoqchi bo'lsa, yo'l qo'ymaymiz
    if (!input.startsWith("+998")) {
      input = "+998 " + input.replace(/\D/g, "");
    }

    // Faqat +998 dan keyingi qismini tozalab olamiz (faqat raqamlar qoladi)
    const rawNumbers = input.slice(4).replace(/\D/g, "");

    // 9 ta raqamdan oshib ketmasligini ta'minlaymiz (masalan: 901234567)
    const limitedNumbers = rawNumbers.slice(0, 9);

    // Bo'laklarga bo'lib formatlash: +998 XX XXX XX XX
    let formatted = "+998 ";
    if (limitedNumbers.length > 0) {
      formatted += limitedNumbers.slice(0, 2); // Kod (90, 91, ...)
    }
    if (limitedNumbers.length > 2) {
      formatted += " " + limitedNumbers.slice(2, 5); // 3 ta raqam (123)
    }
    if (limitedNumbers.length > 5) {
      formatted += " " + limitedNumbers.slice(5, 7); // 2 ta raqam (45)
    }
    if (limitedNumbers.length > 7) {
      formatted += " " + limitedNumbers.slice(7, 9); // 2 ta raqam (67)
    }

    setPhone(formatted);
  };

  const login = async () => {
    // Probellardan tozalangan toza variant (bazaga jo'natish va validatsiya uchun)
    // Masalan: "+998 90 123 45 67" -> "+998901234567"
    const cleanPhone = phone.replace(/\s/g, "");

    if (!cleanPhone || !password) {
      toast.error("Telefon va parolni kiriting!");
      return;
    }

    if (cleanPhone.length !== 13) {
      toast.error("Telefon raqami to‘liq kiritilmagan!");
      return;
    }

    if (password.length < 4) {
      toast.error("Parol kamida 4 ta belgi bo‘lishi kerak.");
      return;
    }

    setIsLoading(true);

    try {
      // Supabase orqali tekshirish (Toza formatlangan raqam bilan)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", cleanPhone)
        .eq("password", password)
        .maybeSingle();

      if (error) {
        toast.error("Server xatolik!");
        return;
      }

      if (!data) {
        toast.error("Telefon yoki parol noto‘g‘ri!");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Xush kelibsiz!");

      if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      toast.error("Kutilmagan xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth">
      <h2>Tizimga kirish</h2>

      <div className="input-group">
        <input
          type="tel" // Mobil qurilmalarda raqamli klaviatura ochilishi uchun
          placeholder="+998 90 123 45 67"
          value={phone}
          onChange={handlePhoneChange}
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={login} disabled={isLoading}>
        {isLoading ? "Yuklanmoqda..." : "Kirish"}
      </button>

      <p style={{
        textAlign: "center",
        cursor: "pointer",
        color: "#007bff",
      }} onClick={() => navigate("/register")}>
        Ro‘yxatdan o‘tish
      </p>
    </div>
  );
}