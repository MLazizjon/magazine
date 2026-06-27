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
    // 🔥 1. INPUT VALIDATION
    if (!phone || !password) {
      toast.error("Telefon va parolni kiriting!");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("phone", phone)
      .eq("password", password)
      .maybeSingle(); // 🔥 single o‘rniga better

    // 🔥 2. WRONG CREDENTIALS
    if (error) {
      toast.error("Server xatolik!");
      return;
    }

    if (!data) {
      toast.error("Telefon yoki parol noto‘g‘ri!");
      return;
    }

    // 🔥 3. SUCCESS
    localStorage.setItem("user", JSON.stringify(data));

    toast.success("Xush kelibsiz!");

    navigate("/home");
  };

  return (
    <div className="auth">
      <h2>Login</h2>

      <input
        placeholder="Telefon"
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