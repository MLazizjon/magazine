import { useState } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    // 1. Bo'sh maydonlarni tekshirish
    if (!phone || !password) {
      toast.error("Telefon va parolni kiriting!");
      return;
    }

    // 🔥 2. TELEFON VALIDATION (Kirishda ham tekshiramiz)
    if (!phone.startsWith("+998")) {
      toast.error("Telefon raqami +998 bilan boshlanishi shart!");
      return;
    }
    if (phone.length !== 13) {
      toast.error("Telefon raqami 13 ta belgi bo‘lishi shart!");
      return;
    }

    // 🔥 3. PAROL VALIDATION
    if (password.length < 4) {
      toast.error("Parol xato! Kamida 4 ta belgi bo‘lishi kerak.");
      return;
    }

    // Supabase orqali tekshirish
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("phone", phone)
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

    // Muvaffaqiyatli kirish
    localStorage.setItem("user", JSON.stringify(data));
    toast.success("Xush kelibsiz!");

    // Rolga qarab yo'naltirish
    if (data.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  return (
    <div className="auth">
      <h2>Login</h2>

      <input
        placeholder="Telefon (+998XXXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="password"
        placeholder="Parol"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>Kirish</button>

      <p className="register-link" onClick={() => navigate("/register")}>
        Ro‘yxatdan o‘tish
      </p>
    </div>
  );
}