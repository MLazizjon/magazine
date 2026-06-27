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

  const navigate = useNavigate();

  const register = async () => {
  const { data: existing } = await supabase
    .from("profiles")
    .select("phone")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    return toast.error("Bu telefon allaqachon ro‘yxatdan o‘tgan");
  }

  const { error } = await supabase.from("profiles").insert([
    {
      full_name: fullName,
      phone,
      region,
      password,
    },
  ]);

  if (error) {
    return toast.error(error.message);
  }

  toast.success("Ro‘yxatdan o‘tdi");
  navigate("/login");
};

  return (
    <div className="auth">
      <h2>Register</h2>

      <input placeholder="Ism" onChange={(e) => setFullName(e.target.value)} />
      <input placeholder="Telefon" onChange={(e) => setPhone(e.target.value)} />

      <select onChange={(e) => setRegion(e.target.value)}>
        <option value="">Viloyat</option>
        <option>Tashkent</option>
        <option>Samarkand</option>
        <option>Andijan</option>
      </select>

      <input type="password" placeholder="Parol" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={register}>Yuborish</button>
    </div>
  );
}