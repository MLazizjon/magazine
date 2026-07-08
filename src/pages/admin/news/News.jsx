import React, { useState, useEffect } from "react";
import { FaLightbulb, FaTrashAlt, FaPlusCircle, FaRegCommentDots } from "react-icons/fa";
import { supabase } from "../../../supabase/client";
import { toast } from "react-toastify";
import "./news.css"; 

export default function MaslahatlarTab({ lang = "uz" }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Jadvalingizdagi 'content' maydoni uchun
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🌍 Ko'p tillilik lug'ati
  const translations = {
    uz: {
      formTitle: "Ustalar uchun Maslahatlar va Tavsiyalar",
      formDesc: "Bu yerga yozilgan tavsiyalar yoki muhim gaplar bevosita ustalar (userlar) panelida ko'rinadi.",
      labelTitle: "Sarlavha / Nomlanishi *",
      placeholderTitle: "Masalan: To'lov tizimidagi yangilanishlar",
      labelContent: "Maslahat yoki Yangilik Matni *",
      placeholderContent: "Foydalanuvchilar ko'rishi kerak bo'lgan gaplar va tavsiyalarni yozing...",
      btnPublish: "E'lon Qilish",
      btnSaving: "Saqlanmoqda...",
      listTitle: "📋 Mavjud Maslahat va Yangiliklar",
      thTitle: "Sarlavha",
      thContent: "Matn",
      thDate: "Sana",
      thAction: "Amal",
      emptyRow: "Hozircha hech qanday ma'lumot kiritilmagan.",
      toastFieldsErr: "Iltimos, barcha maydonlarni to'ldiring!",
      toastSuccess: "Yangi maslahat/yangilik muvaffaqiyatli qo'shildi! 💡",
      toastDeleted: "Muvaffaqiyatli o'chirildi 🗑️",
      confirmDelete: "Ushbu ma'lumotni o'chirib tashlamoqchimisiz?",
      errorLoad: "Mavjud ma'lumotlarni yuklab bo'lmadi",
      errorLoadConsole: "Ma'lumotlarni yuklashda xatolik:",
      errorAction: "Xatolik yuz berdi: "
    },
    ru: {
      formTitle: "Советы и Рекомендации для Мастеров",
      formDesc: "Написанные здесь рекомендации или важные сообщения будут отображаться непосредственно в панели мастеров (пользователей).",
      labelTitle: "Заголовок / Название *",
      placeholderTitle: "Например: Обновления в платежной системе",
      labelContent: "Текст Совета или Новости *",
      placeholderContent: "Напишите сообщения и рекомендации, которые должны увидеть пользователи...",
      btnPublish: "Опубликовать",
      btnSaving: "Сохранение...",
      listTitle: "📋 Доступные Советы и Новости",
      thTitle: "Заголовок",
      thContent: "Текст",
      thDate: "Дата",
      thAction: "Действие",
      emptyRow: "На данный момент информация не введена.",
      toastFieldsErr: "Пожалуйста, заполните все поля!",
      toastSuccess: "Новый совет/новость успешно добавлен! 💡",
      toastDeleted: "Успешно удалено 🗑️",
      confirmDelete: "Вы действительно хотите удалить эту информацию?",
      errorLoad: "Не удалось загрузить существующие данные",
      errorLoadConsole: "Ошибка при загрузке данных:",
      errorAction: "Произошла ошибка: "
    }
  };

  const t = translations[lang] || translations.uz;

  // 1. Supabase-dagi 'news' jadvalidan ma'lumotlarni yuklash
  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNewsList(data || []);
    } catch (err) {
      console.error(t.errorLoadConsole, err);
      toast.error(t.errorLoad);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // 2. Yangi maslahat/yangilik yaratish va bazaga yozish
  const handleCreateNews = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error(t.toastFieldsErr);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("news").insert([
        {
          title: title.trim(),
          content: content.trim(), // 'content' maydoniga yozadi
        },
      ]);

      if (error) throw error;

      toast.success(t.toastSuccess);
      setTitle("");
      setContent("");
      fetchNews();
    } catch (err) {
      toast.error(t.errorAction + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. O'chirish funksiyasi
  const handleDeleteNews = async (id) => {
    const isConfirmed = window.confirm(t.confirmDelete);
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;

      toast.info(t.toastDeleted);
      fetchNews();
    } catch (err) {
      toast.error(t.errorAction + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-section fade-in maslahatlar-container">
      
      {/* YANGI MASLAHAT/YANGILIK QO'SHISH FORMASI */}
      <div className="aksiya-card">
        <h4 className="aksiya-card-title">
          <FaLightbulb style={{ color: "#eab308" }} /> {t.formTitle}
        </h4>
        <p className="aksiya-card-desc">
          {t.formDesc}
        </p>

        <form onSubmit={handleCreateNews} className="aksiya-form">
          <div className="input-group">
            <label>{t.labelTitle}</label>
            <input
              type="text"
              placeholder={t.placeholderTitle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>{t.labelContent}</label>
            <textarea
              placeholder={t.placeholderContent}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea-input-style"
              rows="4"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit" style={{ background: "#eab308" }}>
            <FaPlusCircle /> {loading ? t.btnSaving : t.btnPublish}
          </button>
        </form>
      </div>

      {/* MAVJUD RO'YXAT JADBAlI */}
      <div className="aksiya-card">
        <h4 className="aksiya-card-title">{t.listTitle}</h4>
        
        <div className="custom-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>{t.thTitle}</th>
                <th style={{ width: "50%" }}>{t.thContent}</th>
                <th style={{ width: "15%" }}>{t.thDate}</th>
                <th style={{ textAlign: "center", width: "10%" }}>{t.thAction}</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.title}</strong></td>
                  <td>
                    <div className="tip-desc-cell">
                      <FaRegCommentDots style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <span>{item.content}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      {new Date(item.created_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ")}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="btn-delete"
                      title={lang === "ru" ? "Удалить" : "O'chirish"}
                      disabled={loading}
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
              
              {newsList.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-row" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                    {t.emptyRow}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}