import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabase/client";
import { 
  FiArrowLeft, FiPlus, FiPackage, FiFolderPlus,
  FiGrid, FiCheck, FiX, FiImage, FiUploadCloud, FiTrash2, FiEdit2 
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./katalog.css";

export default function KatalogTab({ selectedCategory, setSelectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- MODAL STATES ---
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);

  // --- EDIT MODES ---
  const [editCatId, setEditCatId] = useState(null);
  const [editProdId, setEditProdId] = useState(null);

  // --- FORM STATES ---
  const [newCat, setNewCat] = useState({ name_uz: "", image_url: "" });
  const [newProd, setNewProd] = useState({ title_uz: "", price: "", image_url: "" });

  // 1. Kataloglarni yuklash (useCallback bilan optimallashtirildi)
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("categories").select("*").order("id", { ascending: true });
      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      toast.error("Kataloglarni yuklashda xatolik yuz berdi!");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 2. Mahsulotlarni yuklash (useCallback bilan optimallashtirildi)
  const fetchProducts = useCallback(async () => {
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
    } finally { setProductsLoading(false); }
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 📸 SUPABASE STORAGE'GA RASM YUKLASH
  const handleImageUpload = async (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `katalog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      
      if (target === "category") {
        setNewCat(prev => ({ ...prev, image_url: data.publicUrl }));
        toast.success("Katalog rasmi yuklandi! ✅");
      } else {
        setNewProd(prev => ({ ...prev, image_url: data.publicUrl }));
        toast.success("Mahsulot rasmi yuklandi! ✅");
      }
    } catch (error) {
      toast.error("Rasm yuklashda xatolik yuz berdi!");
    } finally {
      setUploading(false);
    }
  };

  // 📁 KATALOG QO'SHISH YOKI TAHRIRLASH (ADD & EDIT)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name_uz) return toast.warning("Katalog nomini kiriting!");
    
    try {
      const autoSlug = newCat.name_uz.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      const finalData = {
        name_uz: newCat.name_uz,
        name_ru: newCat.name_uz, 
        slug: autoSlug,
        image_url: newCat.image_url 
      };

      if (editCatId) {
        const { error } = await supabase.from("categories").update(finalData).eq("id", editCatId);
        if (error) throw error;
        toast.success("Katalog muvaffaqiyatli yangilandi! 📝");
      } else {
        const { error } = await supabase.from("categories").insert([finalData]);
        if (error) throw error;
        toast.success("Yangi katalog muvaffaqiyatli qo'shildi! 🎉");
      }
      
      setIsCatModalOpen(false);
      setEditCatId(null);
      setNewCat({ name_uz: "", image_url: "" });
      fetchCategories();
    } catch (error) {
      toast.error(`Baza xatosi: ${error.message}`);
    }
  };

  // 📝 TAHRIRLASH REJIMINI YOQISH (KATALOG)
  const handleEditCategoryClick = (cat, e) => {
    e.stopPropagation();
    setEditCatId(cat.id);
    setNewCat({ name_uz: cat.name_uz, image_url: cat.image_url || "" });
    setIsCatModalOpen(true);
  };

  // 🗑️ KATALOGNI O'CHIRISH
  const handleDeleteCategory = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Ushbu katalog va uning ichidagi hamma tovarlar o'chib ketadi. Tasdiqlaysizmi?")) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Katalog o'chirildi!");
      fetchCategories();
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi.");
    }
  };

  // 📦 MAHSULOT QO'SHISH YOKI TAHRIRLASH (ADD & EDIT)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProd.title_uz || !newProd.price) return toast.warning("Barcha majdonlarni to'ldiring!");
    
    try {
      const productData = {
        title_uz: newProd.title_uz,
        title_ru: newProd.title_uz,
        price: parseFloat(newProd.price),
        image_url: newProd.image_url,
        category_id: selectedCategory.id
      };

      if (editProdId) {
        const { error } = await supabase.from("products").update(productData).eq("id", editProdId);
        if (error) throw error;
        toast.success("Mahsulot muvaffaqiyatli yangilandi! 📝");
      } else {
        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;
        toast.success("Mahsulot muvaffaqiyatli qo'shildi! 📦");
      }

      setIsProdModalOpen(false);
      setEditProdId(null);
      setNewProd({ title_uz: "", price: "", image_url: "" });
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 📝 TAHRIRLASH REJIMINI YOQISH (MAHSULOT)
  const handleEditProductClick = (prod) => {
    setEditProdId(prod.id);
    setNewProd({ title_uz: prod.title_uz, price: prod.price, image_url: prod.image_url || "" });
    setIsProdModalOpen(true);
  };

  // 🗑️ MAHSULOTNI O'CHIRISH
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Ushbu mahsulotni o'chirishni tasdiqlaysizmi?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Mahsulot o'chirildi!");
      fetchProducts();
    } catch (error) {
      toast.error("Mahsulotni o'chirishda xatolik.");
    }
  };

  // --- REJIM 1: ASOSIY KATALOG EKRANI ---
  if (!selectedCategory) {
    return (
      <div className="katalog-light-wrapper">
        <div className="katalog-light-banner">
          <div className="banner-left-info">
            <div className="banner-icon-title">
              <FiGrid className="main-grid-icon" />
              <h2>Xo'jalik Mollari Katalogi</h2>
            </div>
            <p>Do'kondagi toifalar va mahsulotlar zaxirasini boshqarish paneli (Admin)</p>
          </div>
          <button className="katalog-light-add-btn" onClick={() => { setEditCatId(null); setNewCat({ name_uz: "", image_url: "" }); setIsCatModalOpen(true); }}>
            <FiFolderPlus size={16} />
            Yangi Katalog Qo'shish
          </button>
        </div>

        <div className="section-divider">
          <h3>Mavjud Kataloglar</h3>
          <span className="badge-count">{categories.length} toifa</span>
        </div>

        {loading ? (
          <div className="katalog-spinner-box"><div className="spinner"></div></div>
        ) : (
          <div className="categories-light-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="category-light-card" onClick={() => setSelectedCategory(cat)}>
                <div className="card-img-top">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name_uz} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="no-image-placeholder"><FiImage size={28} /></div>
                  )}
                </div>
                <div className="card-body-content">
                  <div className="card-title-row">
                    <h3>{cat.name_uz}</h3>
                    <div className="card-actions-box">
                      <button className="btn-card-edit" onClick={(e) => handleEditCategoryClick(cat, e)} title="Tahrirlash">
                        <FiEdit2 size={14} />
                      </button>
                      <button className="btn-card-delete" onClick={(e) => handleDeleteCategory(cat.id, e)} title="O'chirish">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="card-footer-action">
                    <span>Tovarlarni ko'rish</span>
                    <span className="arrow-icon">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🛠️ KATALOG QO'SHISH / TAHRIRLASH MODALI */}
        {isCatModalOpen && (
          <div className="modal-light-overlay">
            <div className="modal-light-container animate-slide">
              <div className="modal-header">
                <h3>{editCatId ? "Katalogni Tahrirlash" : "Yangi Katalog Yaratish"}</h3>
                <button className="close-modal-btn" onClick={() => setIsCatModalOpen(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSaveCategory} className="modal-form">
                <div className="form-group">
                  <label>Katalog Nomi *</label>
                  <input 
                    type="text" 
                    placeholder="Masalan: Suv nasoslari, Krantlar..." 
                    value={newCat.name_uz} 
                    onChange={(e) => setNewCat({...newCat, name_uz: e.target.value})} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Katalog Rasmi *</label>
                  <div className="file-input-wrapper">
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="category-file-input"
                      className="hidden-file-input"
                      onChange={(e) => handleImageUpload(e, "category")} 
                      disabled={uploading}
                    />
                    <label htmlFor="category-file-input" className="file-upload-trigger">
                      <FiUploadCloud size={18} />
                      <span>
                        {uploading ? "Rasm yuklanmoqda..." : newCat.image_url ? "Rasm yangilandi ✅" : "Rasmni tanlash (Fayl)"}
                      </span>
                    </label>
                  </div>
                  {newCat.image_url && (
                    <div className="preview-container">
                      <img src={newCat.image_url} alt="Preview" className="upload-preview-img" />
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsCatModalOpen(false)}>Bekor qilish</button>
                  <button type="submit" className="btn-submit" disabled={uploading}><FiCheck /> Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- REJIM 2: MAHSULOTLAR RO'YXATI EKRANI ---
  return (
    <div className="katalog-light-wrapper">
      <div className="katalog-inner-header">
        <button className="katalog-back-btn" onClick={() => setSelectedCategory(null)}>
          <FiArrowLeft size={16} /> Orqaga
        </button>
        <div className="inner-title-box">
          <h2>{selectedCategory.name_uz}</h2>
          <span className="badge">{products.length} ta mahsulot</span>
        </div>
        <button className="katalog-light-add-btn" onClick={() => { setEditProdId(null); setNewProd({ title_uz: "", price: "", image_url: "" }); setIsProdModalOpen(true); }}>
          <FiPlus size={16} /> Yangi Mahsulot Qo'shish
        </button>
      </div>

      {productsLoading ? (
        <div className="katalog-spinner-box"><div className="spinner"></div></div>
      ) : products.length === 0 ? (
        <div className="no-data-box">
          <FiPackage size={44} />
          <p>Bu katalogda hozircha mahsulotlar mevjud emas.</p>
        </div>
      ) : (
        <div className="products-light-grid">
          {products.map((prod) => (
            <div key={prod.id} className="product-light-card">
              <div className="product-img-box">
                <img src={prod.image_url || "https://via.placeholder.com/250x180?text=No+Image"} alt={prod.title_uz} onError={(e) => { e.target.src = "https://via.placeholder.com/250x180?text=No+Image"; }} />
              </div>
              <div className="product-details">
                <div className="product-title-row">
                  <h4 className="product-title">{prod.title_uz}</h4>
                  <div className="product-actions-box">
                    <button className="btn-prod-edit" onClick={() => handleEditProductClick(prod)} title="Tahrirlash">
                      <FiEdit2 size={13} />
                    </button>
                    <button className="btn-prod-delete" onClick={() => handleDeleteProduct(prod.id)} title="O'chirish">
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
                {prod.price && <p className="product-price">{prod.price.toLocaleString()} UZS</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📦 MAHSULOT QO'SHISH / TAHRIRLASH MODALI */}
      {isProdModalOpen && (
        <div className="modal-light-overlay">
          <div className="modal-light-container animate-slide">
            <div className="modal-header">
              <h3>{editProdId ? "Mahsulotni Tahrirlash" : "Katalogga Mahsulot Qo'shish"}</h3>
              <button className="close-modal-btn" onClick={() => setIsProdModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="modal-form">
              <div className="form-group">
                <label>Mahsulot Nomi *</label>
                <input type="text" placeholder="Masalan: Alyumin Suv Kranti" value={newProd.title_uz} onChange={(e) => setNewProd({...newProd, title_uz: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Narxi (UZS) *</label>
                <input type="number" placeholder="55000" value={newProd.price} onChange={(e) => setNewProd({...newProd, price: e.target.value})} required />
              </div>
              
              <div className="form-group">
                <label>Mahsulot Rasmi</label>
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="product-file-input"
                    className="hidden-file-input"
                    onChange={(e) => handleImageUpload(e, "product")} 
                    disabled={uploading}
                  />
                  <label htmlFor="product-file-input" className="file-upload-trigger">
                    <FiUploadCloud size={18} />
                    <span>
                      {uploading ? "Rasm yuklanmoqda..." : newProd.image_url ? "Rasm yangilandi ✅" : "Rasmni tanlash (Fayl)"}
                    </span>
                  </label>
                </div>
                {newProd.image_url && (
                  <div className="preview-container">
                    <img src={newProd.image_url} alt="Preview" className="upload-preview-img" />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsProdModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="btn-submit" disabled={uploading}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}