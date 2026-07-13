import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/client";
import { FiArrowLeft, FiPackage, FiGrid, FiImage } from "react-icons/fi";
import { toast } from "react-toastify";
import "./katalog.css"; // Admin katalog stili bilan bir xil yoki o'xshash qilsangiz bo'ladi

export default function UserKatalog() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  // 1. Kataloglarni (Toifalarni) yuklash
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      toast.error("Kataloglarni yuklashda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Tanlangan katalogga tegishli mahsulotlarni yuklash
  const fetchProducts = async () => {
    if (!selectedCategory) return;
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", selectedCategory.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      toast.error("Mahsulotlarni yuklab bo'lmadi");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  // --- REJIM 1: FOYDALANUVCHIGA TOIFALARNI KO'RSATISH ---
  if (!selectedCategory) {
    return (
      <div className="user-katalog-wrapper">
        <div className="user-katalog-banner">
          <div className="banner-icon-title">
            <FiGrid className="main-grid-icon" />
            <h2>Mahsulotlar Katalogi</h2>
          </div>
          <p>Mavjud barcha mahsulotlar va toifalar bilan tanshishingiz mumkin</p>
        </div>

        <div className="section-divider">
          <h3>Kataloglar</h3>
          <span className="badge-count">{categories.length} ta toifa</span>
        </div>

        {loading ? (
          <div className="katalog-spinner-box"><div className="spinner"></div></div>
        ) : (
          <div className="categories-user-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="category-user-card" onClick={() => setSelectedCategory(cat)}>
                <div className="card-img-top">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name_uz} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="no-image-placeholder"><FiImage size={28} /></div>
                  )}
                </div>
                <div className="card-body-content">
                  <h3>{cat.name_uz}</h3>
                  <div className="card-footer-action">
                    <span>Tovarlarni ko'rish</span>
                    <span className="arrow-icon">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- REJIM 2: TANLANGAN KATALOG ICHIDAGI MAHSULOTLAR RO'YXATI ---
  return (
    <div className="user-katalog-wrapper">
      <div className="katalog-inner-header">
        <button className="katalog-back-btn" onClick={() => setSelectedCategory(null)}>
          <FiArrowLeft size={16} /> Orqaga
        </button>
        <div className="inner-title-box">
          <h2>{selectedCategory.name_uz}</h2>
          <span className="badge">{products.length} ta mahsulot</span>
        </div>
      </div>

      {productsLoading ? (
        <div className="katalog-spinner-box"><div className="spinner"></div></div>
      ) : products.length === 0 ? (
        <div className="no-data-box">
          <FiPackage size={44} />
          <p>Bu katalogda hozircha mahsulotlar mavjud emas.</p>
        </div>
      ) : (
        <div className="products-user-grid">
          {products.map((prod) => (
            <div key={prod.id} className="product-user-card">
              <div className="product-img-box">
                <img src={prod.image_url || "https://via.placeholder.com/250x180?text=No+Image"} alt={prod.title_uz} onError={(e) => { e.target.src = "https://via.placeholder.com/250x180?text=No+Image"; }} />
              </div>
              <div className="product-details">
                <h4 className="product-title">{prod.title_uz}</h4>
                {prod.price && <p className="product-price">{prod.price.toLocaleString()} UZS</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}