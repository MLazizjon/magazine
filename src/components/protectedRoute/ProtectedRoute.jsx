// import { Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase/client";

// export default function ProtectedRoute({ children }) {
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const checkUser = async () => {
//       const { data } = await supabase.auth.getSession();
//       setUser(data.session);
//       setLoading(false);
//     };

//     checkUser();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   return user ? children : <Navigate to="/login" />;
// }
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}