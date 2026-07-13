// import React, { useState, useEffect, useCallback } from "react";
// import { supabase } from "../../../supabase/client";
// import { 
//   FiArrowLeft, FiPlus, FiPackage, FiFolderPlus,
//   FiGrid, FiCheck, FiX, FiImage, FiUploadCloud, FiTrash2, FiEdit2 
// } from "react-icons/fi";
// import { toast } from "react-toastify";
// import "./katalog.css";

// export default function KatalogTab({ selectedCategory, setSelectedCategory }) {
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [productsLoading, setProductsLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   // --- MODAL STATES ---
//   const [isCatModalOpen, setIsCatModalOpen] = useState(false);
//   const [isProdModalOpen, setIsProdModalOpen] = useState(false);

//   // --- EDIT MODES ---
//   const [editCatId, setEditCatId] = useState(null);
//   const [editProdId, setEditProdId] = useState(null);

//   // --- FORM STATES ---
//   const [newCat, setNewCat] = useState({ name_uz: "", image_url: "" });
//   const [newProd, setNewProd] = useState({ title_uz: "", price: "", image_url: "" });

//   // 1. Kataloglarni yuklash (useCallback bilan optimallashtirildi)
//   const fetchCategories = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabase.from("categories").select("*").order("id", { ascending: true });
//       if (error) throw error;
//       if (data) setCategories(data);
//     } catch (error) {
//       toast.error("Kataloglarni yuklashda xatolik yuz berdi!");
//     } finally { setLoading(false); }
//   }, []);

//   useEffect(() => {
//     fetchCategories();
//   }, [fetchCategories]);

//   // 2. Mahsulotlarni yuklash (useCallback bilan optimallashtirildi)
//   const fetchProducts = useCallback(async () => {
//     if (!selectedCategory) return;
//     setProductsLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from("products")
//         .select("*")
//         .eq("category_id", selectedCategory.id)
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       if (data) setProducts(data);
//     } catch (error) {
//       toast.error("Mahsulotlarni yuklab bo'lmadi");
//     } finally { setProductsLoading(false); }
//   }, [selectedCategory]);

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   // 📸 SUPABASE STORAGE'GA RASM YUKLASH
//   const handleImageUpload = async (e, target) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setUploading(true);
//     try {
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
//       const filePath = `katalog/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from("images")
//         .upload(filePath, file);

//       if (uploadError) throw uploadError;

//       const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      
//       if (target === "category") {
//         setNewCat(prev => ({ ...prev, image_url: data.publicUrl }));
//         toast.success("Katalog rasmi yuklandi! ✅");
//       } else {
//         setNewProd(prev => ({ ...prev, image_url: data.publicUrl }));
//         toast.success("Mahsulot rasmi yuklandi! ✅");
//       }
//     } catch (error) {
//       toast.error("Rasm yuklashda xatolik yuz berdi!");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // 📁 KATALOG QO'SHISH YOKI TAHRIRLASH (ADD & EDIT)
//   const handleSaveCategory = async (e) => {
//     e.preventDefault();
//     if (!newCat.name_uz) return toast.warning("Katalog nomini kiriting!");
    
//     try {
//       const autoSlug = newCat.name_uz.toLowerCase()
//         .replace(/[^a-z0-9\s-]/g, '')
//         .replace(/\s+/g, '-');

//       const finalData = {
//         name_uz: newCat.name_uz,
//         name_ru: newCat.name_uz, 
//         slug: autoSlug,
//         image_url: newCat.image_url 
//       };

//       if (editCatId) {
//         const { error } = await supabase.from("categories").update(finalData).eq("id", editCatId);
//         if (error) throw error;
//         toast.success("Katalog muvaffaqiyatli yangilandi! 📝");
//       } else {
//         const { error } = await supabase.from("categories").insert([finalData]);
//         if (error) throw error;
//         toast.success("Yangi katalog muvaffaqiyatli qo'shildi! 🎉");
//       }
      
//       setIsCatModalOpen(false);
//       setEditCatId(null);
//       setNewCat({ name_uz: "", image_url: "" });
//       fetchCategories();
//     } catch (error) {
//       toast.error(`Baza xatosi: ${error.message}`);
//     }
//   };

//   // 📝 TAHRIRLASH REJIMINI YOQISH (KATALOG)
//   const handleEditCategoryClick = (cat, e) => {
//     e.stopPropagation();
//     setEditCatId(cat.id);
//     setNewCat({ name_uz: cat.name_uz, image_url: cat.image_url || "" });
//     setIsCatModalOpen(true);
//   };

//   // 🗑️ KATALOGNI O'CHIRISH
//   const handleDeleteCategory = async (id, e) => {
//     e.stopPropagation();
//     if (!window.confirm("Ushbu katalog va uning ichidagi hamma tovarlar o'chib ketadi. Tasdiqlaysizmi?")) return;

//     try {
//       const { error } = await supabase.from("categories").delete().eq("id", id);
//       if (error) throw error;
//       toast.success("Katalog o'chirildi!");
//       fetchCategories();
//     } catch (error) {
//       toast.error("O'chirishda xatolik yuz berdi.");
//     }
//   };

//   // 📦 MAHSULOT QO'SHISH YOKI TAHRIRLASH (ADD & EDIT)
//   const handleSaveProduct = async (e) => {
//     e.preventDefault();
//     if (!newProd.title_uz || !newProd.price) return toast.warning("Barcha majdonlarni to'ldiring!");
    
//     try {
//       const productData = {
//         title_uz: newProd.title_uz,
//         title_ru: newProd.title_uz,
//         price: parseFloat(newProd.price),
//         image_url: newProd.image_url,
//         category_id: selectedCategory.id
//       };

//       if (editProdId) {
//         const { error } = await supabase.from("products").update(productData).eq("id", editProdId);
//         if (error) throw error;
//         toast.success("Mahsulot muvaffaqiyatli yangilandi! 📝");
//       } else {
//         const { error } = await supabase.from("products").insert([productData]);
//         if (error) throw error;
//         toast.success("Mahsulot muvaffaqiyatli qo'shildi! 📦");
//       }

//       setIsProdModalOpen(false);
//       setEditProdId(null);
//       setNewProd({ title_uz: "", price: "", image_url: "" });
//       fetchProducts();
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // 📝 TAHRIRLASH REJIMINI YOQISH (MAHSULOT)
//   const handleEditProductClick = (prod) => {
//     setEditProdId(prod.id);
//     setNewProd({ title_uz: prod.title_uz, price: prod.price, image_url: prod.image_url || "" });
//     setIsProdModalOpen(true);
//   };

//   // 🗑️ MAHSULOTNI O'CHIRISH
//   const handleDeleteProduct = async (id) => {
//     if (!window.confirm("Ushbu mahsulotni o'chirishni tasdiqlaysizmi?")) return;
//     try {
//       const { error } = await supabase.from("products").delete().eq("id", id);
//       if (error) throw error;
//       toast.success("Mahsulot o'chirildi!");
//       fetchProducts();
//     } catch (error) {
//       toast.error("Mahsulotni o'chirishda xatolik.");
//     }
//   };

//   // --- REJIM 1: ASOSIY KATALOG EKRANI ---
//   if (!selectedCategory) {
//     return (
//       <div className="katalog-light-wrapper">
//         <div className="katalog-light-banner">
//           <div className="banner-left-info">
//             <div className="banner-icon-title">
//               <FiGrid className="main-grid-icon" />
//               <h2>Xo'jalik Mollari Katalogi</h2>
//             </div>
//             <p>Do'kondagi toifalar va mahsulotlar zaxirasini boshqarish paneli (Admin)</p>
//           </div>
//           <button className="katalog-light-add-btn" onClick={() => { setEditCatId(null); setNewCat({ name_uz: "", image_url: "" }); setIsCatModalOpen(true); }}>
//             <FiFolderPlus size={16} />
//             Yangi Katalog Qo'shish
//           </button>
//         </div>

//         <div className="section-divider">
//           <h3>Mavjud Kataloglar</h3>
//           <span className="badge-count">{categories.length} toifa</span>
//         </div>

//         {loading ? (
//           <div className="katalog-spinner-box"><div className="spinner"></div></div>
//         ) : (
//           <div className="categories-light-grid">
//             {categories.map((cat) => (
//               <div key={cat.id} className="category-light-card" onClick={() => setSelectedCategory(cat)}>
//                 <div className="card-img-top">
//                   {cat.image_url ? (
//                     <img src={cat.image_url} alt={cat.name_uz} onError={(e) => { e.target.style.display = 'none'; }} />
//                   ) : (
//                     <div className="no-image-placeholder"><FiImage size={28} /></div>
//                   )}
//                 </div>
//                 <div className="card-body-content">
//                   <div className="card-title-row">
//                     <h3>{cat.name_uz}</h3>
//                     <div className="card-actions-box">
//                       <button className="btn-card-edit" onClick={(e) => handleEditCategoryClick(cat, e)} title="Tahrirlash">
//                         <FiEdit2 size={14} />
//                       </button>
//                       <button className="btn-card-delete" onClick={(e) => handleDeleteCategory(cat.id, e)} title="O'chirish">
//                         <FiTrash2 size={14} />
//                       </button>
//                     </div>
//                   </div>
//                   <div className="card-footer-action">
//                     <span>Tovarlarni ko'rish</span>
//                     <span className="arrow-icon">→</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* 🛠️ KATALOG QO'SHISH / TAHRIRLASH MODALI */}
//         {isCatModalOpen && (
//           <div className="modal-light-overlay">
//             <div className="modal-light-container animate-slide">
//               <div className="modal-header">
//                 <h3>{editCatId ? "Katalogni Tahrirlash" : "Yangi Katalog Yaratish"}</h3>
//                 <button className="close-modal-btn" onClick={() => setIsCatModalOpen(false)}><FiX /></button>
//               </div>
//               <form onSubmit={handleSaveCategory} className="modal-form">
//                 <div className="form-group">
//                   <label>Katalog Nomi *</label>
//                   <input 
//                     type="text" 
//                     placeholder="Masalan: Suv nasoslari, Krantlar..." 
//                     value={newCat.name_uz} 
//                     onChange={(e) => setNewCat({...newCat, name_uz: e.target.value})} 
//                     required 
//                   />
//                 </div>
                
//                 <div className="form-group">
//                   <label>Katalog Rasmi *</label>
//                   <div className="file-input-wrapper">
//                     <input 
//                       type="file" 
//                       accept="image/*" 
//                       id="category-file-input"
//                       className="hidden-file-input"
//                       onChange={(e) => handleImageUpload(e, "category")} 
//                       disabled={uploading}
//                     />
//                     <label htmlFor="category-file-input" className="file-upload-trigger">
//                       <FiUploadCloud size={18} />
//                       <span>
//                         {uploading ? "Rasm yuklanmoqda..." : newCat.image_url ? "Rasm yangilandi ✅" : "Rasmni tanlash (Fayl)"}
//                       </span>
//                     </label>
//                   </div>
//                   {newCat.image_url && (
//                     <div className="preview-container">
//                       <img src={newCat.image_url} alt="Preview" className="upload-preview-img" />
//                     </div>
//                   )}
//                 </div>

//                 <div className="modal-actions">
//                   <button type="button" className="btn-cancel" onClick={() => setIsCatModalOpen(false)}>Bekor qilish</button>
//                   <button type="submit" className="btn-submit" disabled={uploading}><FiCheck /> Saqlash</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // --- REJIM 2: MAHSULOTLAR RO'YXATI EKRANI ---
//   return (
//     <div className="katalog-light-wrapper">
//       <div className="katalog-inner-header">
//         <button className="katalog-back-btn" onClick={() => setSelectedCategory(null)}>
//           <FiArrowLeft size={16} /> Orqaga
//         </button>
//         <div className="inner-title-box">
//           <h2>{selectedCategory.name_uz}</h2>
//           <span className="badge">{products.length} ta mahsulot</span>
//         </div>
//         <button className="katalog-light-add-btn" onClick={() => { setEditProdId(null); setNewProd({ title_uz: "", price: "", image_url: "" }); setIsProdModalOpen(true); }}>
//           <FiPlus size={16} /> Yangi Mahsulot Qo'shish
//         </button>
//       </div>

//       {productsLoading ? (
//         <div className="katalog-spinner-box"><div className="spinner"></div></div>
//       ) : products.length === 0 ? (
//         <div className="no-data-box">
//           <FiPackage size={44} />
//           <p>Bu katalogda hozircha mahsulotlar mevjud emas.</p>
//         </div>
//       ) : (
//         <div className="products-light-grid">
//           {products.map((prod) => (
//             <div key={prod.id} className="product-light-card">
//               <div className="product-img-box">
//                 <img src={prod.image_url || "https://via.placeholder.com/250x180?text=No+Image"} alt={prod.title_uz} onError={(e) => { e.target.src = "https://via.placeholder.com/250x180?text=No+Image"; }} />
//               </div>
//               <div className="product-details">
//                 <div className="product-title-row">
//                   <h4 className="product-title">{prod.title_uz}</h4>
//                   <div className="product-actions-box">
//                     <button className="btn-prod-edit" onClick={() => handleEditProductClick(prod)} title="Tahrirlash">
//                       <FiEdit2 size={13} />
//                     </button>
//                     <button className="btn-prod-delete" onClick={() => handleDeleteProduct(prod.id)} title="O'chirish">
//                       <FiTrash2 size={13} />
//                     </button>
//                   </div>
//                 </div>
//                 {prod.price && <p className="product-price">{prod.price.toLocaleString()} UZS</p>}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* 📦 MAHSULOT QO'SHISH / TAHRIRLASH MODALI */}
//       {isProdModalOpen && (
//         <div className="modal-light-overlay">
//           <div className="modal-light-container animate-slide">
//             <div className="modal-header">
//               <h3>{editProdId ? "Mahsulotni Tahrirlash" : "Katalogga Mahsulot Qo'shish"}</h3>
//               <button className="close-modal-btn" onClick={() => setIsProdModalOpen(false)}><FiX /></button>
//             </div>
//             <form onSubmit={handleSaveProduct} className="modal-form">
//               <div className="form-group">
//                 <label>Mahsulot Nomi *</label>
//                 <input type="text" placeholder="Masalan: Alyumin Suv Kranti" value={newProd.title_uz} onChange={(e) => setNewProd({...newProd, title_uz: e.target.value})} required />
//               </div>
//               <div className="form-group">
//                 <label>Narxi (UZS) *</label>
//                 <input type="number" placeholder="55000" value={newProd.price} onChange={(e) => setNewProd({...newProd, price: e.target.value})} required />
//               </div>
              
//               <div className="form-group">
//                 <label>Mahsulot Rasmi</label>
//                 <div className="file-input-wrapper">
//                   <input 
//                     type="file" 
//                     accept="image/*" 
//                     id="product-file-input"
//                     className="hidden-file-input"
//                     onChange={(e) => handleImageUpload(e, "product")} 
//                     disabled={uploading}
//                   />
//                   <label htmlFor="product-file-input" className="file-upload-trigger">
//                     <FiUploadCloud size={18} />
//                     <span>
//                       {uploading ? "Rasm yuklanmoqda..." : newProd.image_url ? "Rasm yangilandi ✅" : "Rasmni tanlash (Fayl)"}
//                     </span>
//                   </label>
//                 </div>
//                 {newProd.image_url && (
//                   <div className="preview-container">
//                     <img src={newProd.image_url} alt="Preview" className="upload-preview-img" />
//                   </div>
//                 )}
//               </div>

//               <div className="modal-actions">
//                 <button type="button" className="btn-cancel" onClick={() => setIsProdModalOpen(false)}>Bekor qilish</button>
//                 <button type="submit" className="btn-submit" disabled={uploading}>Saqlash</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




import React, { useState } from "react";
import { FiArrowLeft, FiGrid, FiPackage, FiImage } from "react-icons/fi";
import "./katalog.css";

// 1. KATALOGLAR RO'YXATI
const MOCK_CATEGORIES = [
  { id: 1, name_uz: "Nasoslar", image_url: "https://via.placeholder.com/250x180?text=Nasoslar" }
];

// 2. JADVALDAGI REYTINGI BO'YICHA ROSTMANA 24 TA NASOS ARRAYI
const MOCK_PRODUCTS = [
  // === QB (Вихревой) - 4 ta ===
  { id: 1, category_id: 1, title_uz: "Pumpman QB60 ECO (Вихревой)", price: 280000, image_url: "https://via.placeholder.com/250x180?text=QB60+ECO",
    specs: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "35" }, { key: "Balandligi (Подъём, m)", value: "32" } ] },
  { id: 2, category_id: 1, title_uz: "Pumpman QB60 (Вихревой)", price: 320000, image_url: "https://via.placeholder.com/250x180?text=QB60",
    specs: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "35" }, { key: "Balandligi (Подъём, m)", value: "35" } ] },
  { id: 3, category_id: 1, title_uz: "Pumpman QB70 (Вихревой)", price: 520000, image_url: "https://via.placeholder.com/250x180?text=QB70",
    specs: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.55" }, { key: "Suv sarfi (л/м)", value: "45" }, { key: "Balandligi (Подъём, m)", value: "45" } ] },
  { id: 4, category_id: 1, title_uz: "Pumpman QB80 (Вихревой)", price: 570000, image_url: "https://via.placeholder.com/250x180?text=QB80",
    specs: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.75" }, { key: "Suv sarfi (л/м)", value: "45" }, { key: "Balandligi (Подъём, m)", value: "53" } ] },

  // === CPm (Центробежный) - 5 ta ===
  { id: 5, category_id: 1, title_uz: "Pumpman CPm130 (Центробежный)", price: 510000, image_url: "https://via.placeholder.com/250x180?text=CPm130",
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "105" }, { key: "Balandligi (Подъём, m)", value: "22" } ] },
  { id: 6, category_id: 1, title_uz: "Pumpman CPm146 (Центробежный)", price: 620000, image_url: "https://via.placeholder.com/250x180?text=CPm146",
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.55" }, { key: "Suv sarfi (л/м)", value: "125" }, { key: "Balandligi (Подъём, m)", value: "27" } ] },
  { id: 7, category_id: 1, title_uz: "Pumpman CPm158 (Центробежный)", price: 690000, image_url: "https://via.placeholder.com/250x180?text=CPm158",
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.75" }, { key: "Suv sarfi (л/м)", value: "125" }, { key: "Balandligi (Подъём, m)", value: "32" } ] },
  { id: 8, category_id: 1, title_uz: "Pumpman CPm170 (Центробежный)", price: 1120000, image_url: "https://via.placeholder.com/250x180?text=CPm170",
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "1.1" }, { key: "Suv sarfi (л/м)", value: "133" }, { key: "Balandligi (Подъём, m)", value: "41" } ] },
  { id: 9, category_id: 1, title_uz: "Pumpman CPm200 (Центробежный)", price: 1250000, image_url: "https://via.placeholder.com/250x180?text=CPm200",
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "1.5" }, { key: "Suv sarfi (л/м)", value: "133" }, { key: "Balandligi (Подъём, m)", value: "43" } ] },

  // === PW (Периферийный) - 6 ta ===
  { id: 10, category_id: 1, title_uz: "Pumpman PW125 (Периферийный)", price: 550000, image_url: "https://via.placeholder.com/250x180?text=PW125",
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.125" }, { key: "Suv sarfi (л/м)", value: "33" }, { key: "Balandligi (Подъём, m)", value: "24" } ] },
  { id: 11, category_id: 1, title_uz: "Pumpman PW250 (Периферийный)", price: 570000, image_url: "https://via.placeholder.com/250x180?text=PW250",
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.25" }, { key: "Suv sarfi (л/м)", value: "36" }, { key: "Balandligi (Подъём, m)", value: "30" } ] },
  { id: 12, category_id: 1, title_uz: "Pumpman PW370 (Периферийный)", price: 580000, image_url: "https://via.placeholder.com/250x180?text=PW370",
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "40" }, { key: "Balandligi (Подъём, m)", value: "36" } ] },
  { id: 13, category_id: 1, title_uz: "Pumpman PW550 (Периферийный)", price: 700000, image_url: "https://via.placeholder.com/250x180?text=PW550",
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.55" }, { key: "Suv sarfi (л/м)", value: "50" }, { key: "Balandligi (Подъём, m)", value: "42" } ] },
  { id: 14, category_id: 1, title_uz: "Pumpman PW750 (Периферийный)", price: 780000, image_url: "https://via.placeholder.com/250x180?text=PW750",
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.75" }, { key: "Suv sarfi (л/м)", value: "56" }, { key: "Balandligi (Подъём, m)", value: "50" } ] },
  { id: 15, category_id: 1, title_uz: "Pumpman PW1100 (Периферийный)", price: 1070000, image_url: "https://via.placeholder.com/250x180?text=PW1100",
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "40*40" }, { key: "Quvvati (кВт)", value: "1.1" }, { key: "Suv sarfi (л/м)", value: "100" }, { key: "Balandligi (Подъём, m)", value: "55" } ] },

  // === PWE (Периферийный с сухой защитой) - 5 ta ===
  { id: 16, category_id: 1, title_uz: "Pumpman PWE 125", price: 620000, image_url: "https://via.placeholder.com/250x180?text=PWE+125",
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.125 кВт" }, { key: "Suv sarfi", value: "33 л/м" }, { key: "Balandligi", value: "24 m" } ] },
  { id: 17, category_id: 1, title_uz: "Pumpman PWE 250", price: 670000, image_url: "https://via.placeholder.com/250x180?text=PWE+250",
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.25 кВт" }, { key: "Suv sarfi", value: "36 л/м" }, { key: "Balandligi", value: "30 m" } ] },
  { id: 18, category_id: 1, title_uz: "Pumpman PWE 370", price: 690000, image_url: "https://via.placeholder.com/250x180?text=PWE+370",
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.37 кВт" }, { key: "Suv sarfi", value: "40 л/м" }, { key: "Balandligi", value: "36 m" } ] },
  { id: 19, category_id: 1, title_uz: "Pumpman PWE 550", price: 840000, image_url: "https://via.placeholder.com/250x180?text=PWE+550",
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.55 кВт" }, { key: "Suv sarfi", value: "50 л/м" }, { key: "Balandligi", value: "42 m" } ] },
  { id: 20, category_id: 1, title_uz: "Pumpman PWE 750", price: 920000, image_url: "https://via.placeholder.com/250x180?text=PWE+750",
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.75 кВт" }, { key: "Suv sarfi", value: "56 л/м" }, { key: "Balandligi", value: "50 m" } ] },

  // === PWF (Периферийный с защитой Адаптивный) - 4 ta ===
  { id: 21, category_id: 1, title_uz: "Pumpman PWF 125", price: 670000, image_url: "https://via.placeholder.com/250x180?text=PWF+125",
    specs: [ { key: "Turi", value: "Адаптивный" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.125 кВт" }, { key: "Suv sarfi", value: "33 л/м" }, { key: "Balandligi", value: "24 m" } ] },
  { id: 22, category_id: 1, title_uz: "Pumpman PWF 250", price: 710000, image_url: "https://via.placeholder.com/250x180?text=PWF+250",
    specs: [ { key: "Turi", value: "Адаптивный" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.25 кВт" }, { key: "Suv sarfi", value: "36 л/м" }, { key: "Balandligi", value: "30 m" } ] },
  { id: 23, category_id: 1, title_uz: "Pumpman PWF 370", price: 750000, image_url: "https://via.placeholder.com/250x180?text=PWF+370",
    specs: [ { key: "Turi", value: "Адаптивный" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.37 кВт" }, { key: "Suv sarfi", value: "40 л/м" }, { key: "Balandligi", value: "36 m" } ] },
  { id: 24, category_id: 1, title_uz: "Pumpman PWF 550", price: 900000, image_url: "https://via.placeholder.com/250x180?text=PWF+550",
    specs: [ { key: "Turi", value: "Адаптивный" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.55 кВт" }, { key: "Suv sarfi", value: "50 л/м" }, { key: "Balandligi", value: "42 m" } ] }
];

export default function KatalogTab() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = MOCK_PRODUCTS.filter(
    (prod) => selectedCategory && prod.category_id === selectedCategory.id
  );

  // --- REJIM 3: MAHSULOT XUSUSIYATLARI JADVALI EKRANI ---
  if (selectedProduct) {
    return (
      <div className="katalog-light-wrapper">
        <div className="katalog-inner-header">
          <button className="katalog-back-btn" onClick={() => setSelectedProduct(null)}>
            <FiArrowLeft size={16} /> Orqaga
          </button>
          <h2>Mahsulot xususiyatlari</h2>
        </div>

        <div className="product-detail-container">
          <div className="product-detail-main">
            <div className="product-detail-img">
              <img src={selectedProduct.image_url} alt={selectedProduct.title_uz} />
            </div>
            <div className="product-detail-info">
              <h3 className="product-detail-title">{selectedProduct.title_uz}</h3>
              <p className="product-detail-price">
                Narxi: <span>{selectedProduct.price.toLocaleString()} UZS</span>
              </p>
            </div>
          </div>

          {selectedProduct.specs && selectedProduct.specs.length > 0 && (
            <div className="product-specs-section">
              <table className="specs-table">
                <tbody>
                  {selectedProduct.specs.map((spec, index) => (
                    <tr key={index}>
                      <td className="spec-key">{spec.key}</td>
                      <td className="spec-value">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- REJIM 2: MAHSULOTLAR RO'YXATI (CARD REJIM) ---
  if (selectedCategory) {
    return (
      <div className="katalog-light-wrapper">
        <div className="katalog-inner-header">
          <button className="katalog-back-btn" onClick={() => setSelectedCategory(null)}>
            <FiArrowLeft size={16} /> Orqaga
          </button>
          <div className="inner-title-box">
            <h2>{selectedCategory.name_uz}</h2>
            <span className="badge">{filteredProducts.length} ta mahsulot</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-data-box">
            <FiPackage size={44} />
            <p>Bu katalogda hozircha mahsulotlar mavjud emas.</p>
          </div>
        ) : (
          <div className="products-light-grid">
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id} 
                className="product-light-card" 
                onClick={() => setSelectedProduct(prod)}
                style={{ cursor: "pointer" }}
              >
                <div className="product-img-box">
                  <img src={prod.image_url} alt={prod.title_uz} />
                </div>
                <div className="product-details">
                  <h4 className="product-title">{prod.title_uz}</h4>
                  <p className="product-price">{prod.price.toLocaleString()} UZS</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- REJIM 1: ASOSIY KATALOGLAR REJIMI ---
  return (
    <div className="katalog-light-wrapper">
      <div className="katalog-light-banner">
        <div className="banner-left-info">
          <div className="banner-icon-title">
            <FiGrid className="main-grid-icon" />
            <h2>Xo'jalik Mollari Katalogi</h2>
          </div>
          <p>Kerakli toifani tanlang va mahsulotlar bilan tanishing</p>
        </div>
      </div>

      <div className="section-divider">
        <h3>Mavjud Kataloglar</h3>
        <span className="badge-count">{MOCK_CATEGORIES.length} toifa</span>
      </div>

      <div className="categories-light-grid">
        {MOCK_CATEGORIES.map((cat) => (
          <div key={cat.id} className="category-light-card" onClick={() => setSelectedCategory(cat)}>
            <div className="card-img-top">
              <div className="no-image-placeholder">
                <FiImage size={28} />
              </div>
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
    </div>
  );
}