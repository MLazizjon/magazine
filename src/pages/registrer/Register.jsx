import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./register.css";

const UZBEKISTAN_DATA = {
  "Toshkent shahri": ["Bektemir tumani", "Chilonzor tumani", "Mirobod tumani", "Mirzo Ulug‘bek tumani", "Olmazor tumani", "Sergeli tumani", "Shayxontohur tumani", "Uchtepa tumani", "Yakkasaroy tumani", "Yashnobod tumani", "Yunusobod tumani", "Yangihayot tumani"],
  "Toshkent viloyati": ["Angren shahri", "Olmaliq shahri", "Chirchiq shahri", "Bekobod shahri", "Ohangaron shahri", "Nurafshon shahri", "Bekobod tumani", "Bo‘stonliq tumani", "Bo‘ka tumani", "Chinoz tumani", "Qibray tumani", "Ohangaron tumani", "Oqqo‘rg‘on tumani", "Parkent tumani", "Piskent tumani", "Quyi Chirchiq tumani", "O‘rta Chirchiq tumani", "Yangiyo‘l tumani", "Yuqori Chirchiq tumani", "Zangiota tumani"],
  "Andijon": ["Andijon shahri", "Xonobod shahri", "Andijon tumani", "Asaka tumani", "Baliqchi tumani", "Bo‘ston tumani", "Buloqboshi tumani", "Izboskan tumani", "Jalaquduq tumani", "Marhamat tumani", "Oltinköl tumani", "Paxtaobod tumani", "Qo‘rg‘ontepa tumani", "Shahrixon tumani", "Ulug‘nor tumani", "Xo‘jaobod tumani"],
  "Buxoro": ["Buxoro shahri", "Kogon shahri", "Buxoro tumani", "G‘ijduvon tumani", "Jondor tumani", "Kogon tumani", "Qorako‘l tumani", "Qoravulbozor tumani", "Olot tumani", "Peshku tumani", "Romitan tumani", "Shofirkon tumani", "Vobkent tumani"],
  "Farg'ona": ["Farg‘ona shahri", "Marg‘ilon shahri", "Qo‘qon shahri", "Quva shahri", "Oltiariq tumani", "Bag‘dod tumani", "Beshariq tumani", "Buvayda tumani", "Dang‘ara tumani", "Farg‘ona tumani", "Furqat tumani", "Qo‘shtepa tumani", "Quva tumani", "Rishton tumani", "So‘x tumani", "Toshloq tumani", "Uchko‘prik tumani", "O‘zbekiston tumani", "Yozyovon tumani"],
  "Jizzax": ["Jizzax shahri", "Arnasoy tumani", "Baxtamal tumani", "Do‘stlik tumani", "Forish tumani", "G‘allaorol tumani", "Sharof Rashidov tumani", "Mirzachöl tumani", "Paxtakor tumani", "Yangiobod tumani", "Zamin tumani", "Zafarobod tumani", "Zarbdor tumani"],
  "Xorazm": ["Urganch shahri", "Xiva shahri", "Bog‘ot tumani", "Gurlan tumani", "Xonqa tumani", "Hazorasp tumani", "Qushko‘pir tumani", "Shovot tumani", "Tuproqqal‘a tumani", "Urganch tumani", "Xiva tumani", "Yangiariq tumani", "Yangibozor tumani"],
  "Namangan": ["Namangan shahri", "Chortoq tumani", "Chust tumani", "Kosonsoy tumani", "Mingbuloq tumani", "Namangan tumani", "Norin tumani", "Pop tumani", "To‘raqo‘rg‘on tumani", "Uychi tumani", "Uchqo‘rg‘on tumani", "Yangiqo‘rg‘on tumani", "Davlatobod tumani", "Yangi Namangan tumani"],
  "Navoiy": ["Navoiy shahri", "Zarafshon shahri", "G‘ozg‘on shahri", "Karmana tumani", "Konimex tumani", "Qiziltepa tumani", "Xatirchi tumani", "Navbahor tumani", "Nurota tumani", "Tomdi tumani", "Uchquduq tumani"],
  "Qashqadaryo": ["Qarshi shahri", "Shahrisabz shahri", "Chiroqchi tumani", "Dehqonobod tumani", "G‘uzor tumani", "Kasbi tumani", "Kitob tumani", "Koson tumani", "Ko‘kdala tumani", "Mirishkor tumani", "Muborak tumani", "Nishan tumani", "Qarshi tumani", "Shahrisabz tumani", "Yakkabog‘ tumani", "Kamashi tumani"],
  "Samarqand": ["Samarqand shahri", "Kattaqo‘rg‘on shahri", "Bulung‘ur tumani", "Ishtixon tumani", "Jomboy tumani", "Kattaqo‘rg‘on tumani", "Narpay tumani", "Nurobod tumani", "Oqdaryo tumani", "Paxtachi tumani", "Payariq tumani", "Pastdarg‘om tumani", "Samarqand tumani", "Toyloq tumani", "Urgut tumani", "Qo‘shrabot tumani"],
  "Sirdaryo": ["Guliston shahri", "Shirin shahri", "Yangiyer shahri", "Boyovut tumani", "Guliston tumani", "Xovos tumani", "Mirzaobod tumani", "Oqoltin tumani", "Sardoba tumani", "Sayxunobod tumani", "Sirdaryo tumani"],
  "Surxondaryo": ["Termiz shahri", "Angor tumani", "Boysun tumani", "Denov tumani", "Jarqo‘rg‘on tumani", "Qiziriq tumani", "Qumqo‘rg‘on tumani", "Muzrabot tumani", "Oltinsoy tumani", "Sariosiyo tumani", "Sherobod tumani", "Sho‘rchi tumani", "Termiz tumani", "Uzun tumani"],
  "Qoraqalpog'iston Respublikasi": ["Nukus shahri", "Amudaryo tumani", "Beruniy tumani", "Chimboy tumani", "Ellikqal‘a tumani", "Kegeyli tumani", "Mo‘ynoq tumani", "Nukus tumani", "Qonliko‘l tumani", "Qo‘ng‘irot tumani", "Qorao‘zak tumani", "Shumanay tumani", "Taxtako‘pir tumani", "To‘rtko‘l tumani", "Xo‘jayli tumani", "Taxiatosh tumani", "Bo‘zatov tumani"]
};

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState(""); 
  const [password, setPassword] = useState("");

  // Dropdown ochilib/yopilish holatlari
  const [regionOpen, setRegionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);

  const regionRef = useRef(null);
  const districtRef = useRef(null);
  const navigate = useNavigate();

  // Tashqariga bosilganda ro'yxatni yopish
  useEffect(() => {
    function handleClickOutside(event) {
      if (regionRef.current && !regionRef.current.contains(event.target)) setRegionOpen(false);
      if (districtRef.current && !districtRef.current.contains(event.target)) setDistrictOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneChange = (e) => {
    let input = e.target.value;
    if (!input.startsWith("+998")) input = "+998 ";
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

    if (!fullName || rawPhone === "+998" || !region || !district || !password) {
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
          district, 
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

  return (
    <div className="auth-page-wrapper">
      <div className="auth">
        <h2>Ro`yxatdan o`tish</h2>

        <div className="input-group">
          <input
            type="text"
            placeholder="Ism (kamida 3 ta harf)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="+998 90 123 45 67"
            value={phone}
            onChange={handlePhoneChange}
          />
        </div>

        {/* 🏙️ Custom Viloyat Select */}
        <div className="input-group" ref={regionRef}>
          <div 
            className={`custom-select-trigger ${!region ? "is-placeholder" : ""}`}
            onClick={() => setRegionOpen(!regionOpen)}
          >
            {region || "Viloyatni tanlang"}
          </div>
          {regionOpen && (
            <div className="custom-options-box">
              {Object.keys(UZBEKISTAN_DATA).map((reg) => (
                <div 
                  key={reg} 
                  className={`custom-option ${region === reg ? "selected" : ""}`}
                  onClick={() => {
                    setRegion(reg);
                    setDistrict("");
                    setRegionOpen(false);
                  }}
                >
                  {reg}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🏡 Custom Tuman Select */}
        {region && (
          <div className="input-group" ref={districtRef}>
            <div 
              className={`custom-select-trigger ${!district ? "is-placeholder" : ""}`}
              onClick={() => setDistrictOpen(!districtOpen)}
            >
              {district || "Tumanni/Shaharni tanlang"}
            </div>
            {districtOpen && (
              <div className="custom-options-box">
                {UZBEKISTAN_DATA[region].map((dist) => (
                  <div 
                    key={dist} 
                    className={`custom-option ${district === dist ? "selected" : ""}`}
                    onClick={() => {
                      setDistrict(dist);
                      setDistrictOpen(false);
                    }}
                  >
                    {dist}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="input-group">
          <input
            type="password"
            placeholder="Parol (kamida 4 ta belgi)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn-submit" onClick={register}>
          Yuborish
        </button>

        <p className="auth-link" onClick={() => navigate("/login")}>
          Tizimga kirish sahifasiga o`tish
        </p>
      </div>
    </div>
  );
}