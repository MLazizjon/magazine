import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("user");

    if (!data) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(data));
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Home</h2>

      <p>Ism: {user?.full_name}</p>
      <p>Telefon: {user?.phone}</p>
      <p>Viloyat: {user?.region}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}