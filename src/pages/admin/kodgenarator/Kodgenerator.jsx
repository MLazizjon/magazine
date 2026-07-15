import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabase/client";
import { 
  FaPlus, 
  FaBarcode, 
  FaCopy, 
  FaTrashAlt, 
  FaLayerGroup, 
  FaCalendarAlt,
  FaExclamationTriangle,
  FaTimesCircle,
  FaPause,
  FaPlay,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./kodgenerator.css";

const generateRandomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function CodeGenerator({ lang = "uz" }) {
  const [quantity, setQuantity] = useState(100); 
  const [batches, setBatches] = useState([]); 
  const [expandedBatch, setExpandedBatch] = useState(null); 
  const [activeBatchCodes, setActiveBatchCodes] = useState([]); 
  const [usedCodes, setUsedCodes] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [codesLoading, setCodesLoading] = useState(false);
  const [progress, setProgress] = useState(0); 

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroupCodes, setSelectedGroupCodes] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const translations = {
    uz: {
      mainTitle: "Mukammal Kod Generatori",
      subtitle: "Tizim uchun unikal shtrix-kodlar guruhini yarating va boshqaring",
      quantityLabel: "Miqdori:",
      btnGenerate: "Kod Yaratish",
      generating: "Yaratilmoqda...",
      sectionTitle: "Aktiv Partiyalar & Ishlatilganlar",
      partiya: "PARTIYA",
      createdAt: "Yaratilgan vaqti",
      statusActive: "Aktiv",
      statusPaused: "Pauzada",
      statusUsed: "Ishlatilgan",
      available: "Mavjud:",
      unitCodes: "ta kod",
      usedTitle: "Ishlatilgan Kodlar",
      usedSubtitle: "Mijozlar ishlatib bo'lgan eski kodlar",
      noUsedCodes: "Hozircha ishlatilgan kodlar yo'q",
      totalUsed: "Jami ishlatilgan:",
      modalTitle: "O'chirishni tasdiqlaysizmi?",
      modalDesc1: "Rostdan ham ushbu (",
      modalDesc2: " ta) kodlarni o'chirib tashlamoqchimisiz? Bu amalni mutlaqo ortga qaytarib bo'lmaydi.",
      modalConfirm: "Ha, o'chirilsin",
      modalDeleting: "O'chirilmoqda...",
      modalCancel: "Bekor qilish",
      toastLimit: "Iltimos, 1 dan 10000 gacha son kiriting!",
      toastSuccessGen: "Yangi promo-kod yaratildi! 🎉",
      toastSuccessDel: "Kodlar muvaffaqiyatli o'chirildi! 🗑️",
      toastCopied: "Kodlar nusxalandi! 📋",
      toastErrLoad: "Kodlarni yuklashda xatolik:",
      toastErrDel: "O'chirishda xatolik: ",
      toastStatusUpdated: "Partiya holati muvaffaqiyatli yangilandi! 🔄",
      summaryBadge: "YAKUNIY XULOSA",
      loadCodes: "Kodlarni ko'rsatish",
      hideCodes: "Yopish"
    },
    ru: {
      mainTitle: "Совершенный Генератор Кодов",
      subtitle: "Создавайте и управляйте группами уникальных штрих-кодов для системы",
      quantityLabel: "Количество:",
      btnGenerate: "Создать Код",
      generating: "Создание...",
      sectionTitle: "Активные Партии и Использованные",
      partiya: "ПАРТИЯ",
      createdAt: "Время создания",
      statusActive: "Активен",
      statusPaused: "На паузе",
      statusUsed: "Использован",
      available: "Доступно:",
      unitCodes: "шт. кодов",
      usedTitle: "Использованные Коды",
      usedSubtitle: "Старые коды, которые клиенты уже использовали",
      noUsedCodes: "Использованных кодов пока нет",
      totalUsed: "Всего использовано:",
      modalTitle: "Подтвердите удаление?",
      modalDesc1: "Вы действительно хотите удалить эти (",
      modalDesc2: " шт.) коды? Это действие невозможно отменить.",
      modalConfirm: "Да, удалить",
      modalDeleting: "Удаление...",
      modalCancel: "Отмена",
      toastLimit: "Пожалуйста, введите число от 1 до 10000!",
      toastSuccessGen: "Созданы новые промокоды! 🎉",
      toastSuccessDel: "Коды успешно удалены! 🗑️",
      toastCopied: "Коды скопированы! 📋",
      toastErrLoad: "Ошибка при загрузке кодов:",
      toastErrDel: "Ошибка при удалении: ",
      toastStatusUpdated: "Статус партии успешно обновлен! 🔄",
      summaryBadge: "ИТОГ",
      loadCodes: "Показать коды",
      hideCodes: "Скрыть"
    }
  };

  const t = translations[lang] || translations.uz;

  // 🔄 Supabase'dan 1000 talik limitni range() yordamida aylanib o'tib, barcha ma'lumotlarni yig'ish funksiyasi
  const fetchBatches = useCallback(async () => {
    try {
      let allData = [];
      let from = 0;
      let to = 999;
      let hasMore = true;

      // Hamma ma'lumotlarni bo'laklab (chunk) yuklab olamiz
      while (hasMore) {
        const { data, error } = await supabase
          .from("promo_codes")
          .select("id, created_at, status, batch_id")
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          from += 1000;
          to += 1000;
        } else {
          hasMore = false;
        }
      }

      // 1. Ishlatilgan kodlarni ajratamiz
      const spent = allData.filter(c => c.status === "used");
      setUsedCodes(spent);

      // 2. Faol va pauzadagi guruhlarni (partiyalarni) hisoblaymiz
      const activeAndPaused = allData.filter(c => c.status !== "used");
      const groups = {};

      activeAndPaused.forEach(item => {
        const uniqueBatchKey = item.batch_id || item.created_at.substring(0, 19); 

        const dateObj = new Date(item.created_at);
        const currentLocale = lang === "ru" ? "ru-RU" : "uz-UZ";
        const formattedTime = dateObj.toLocaleTimeString(currentLocale, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }) + " - " + dateObj.toLocaleDateString(currentLocale);

        if (!groups[uniqueBatchKey]) {
          groups[uniqueBatchKey] = {
            batchId: uniqueBatchKey,
            time: formattedTime,
            count: 0,
            status: item.status,
            ids: [],
            rawDate: dateObj
          };
        }
        groups[uniqueBatchKey].count += 1;
        groups[uniqueBatchKey].ids.push(item.id);
      });

      const formattedBatches = Object.values(groups).sort((a, b) => b.rawDate - a.rawDate);
      setBatches(formattedBatches);

    } catch (err) {
      console.error(t.toastErrLoad, err);
      toast.error(t.toastErrLoad + " " + err.message);
    }
  }, [lang, t.toastErrLoad]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // 📂 Partiya ochilganda uning ichidagi kod matnlarini bo'laklab (paginated) lazy loading bilan tortish
  const handleToggleBatchExpand = async (batch) => {
    if (expandedBatch === batch.batchId) {
      setExpandedBatch(null);
      setActiveBatchCodes([]);
      return;
    }

    setCodesLoading(true);
    setExpandedBatch(batch.batchId);

    try {
      let loadedCodes = [];
      const batchIds = batch.ids;
      const chunkSize = 1000;

      for (let i = 0; i < batchIds.length; i += chunkSize) {
        const chunkIds = batchIds.slice(i, i + chunkSize);
        const { data, error } = await supabase
          .from("promo_codes")
          .select("*")
          .in("id", chunkIds);

        if (error) throw error;
        if (data) loadedCodes = [...loadedCodes, ...data];
      }

      setActiveBatchCodes(loadedCodes);
    } catch (err) {
      toast.error(t.toastErrLoad + " " + err.message);
    } finally {
      setCodesLoading(false);
    }
  };

  // 🚀 Yangi partiya yaratish
  const handleGenerate = async () => {
    if (quantity < 1 || quantity > 10000) {
      toast.error(t.toastLimit);
      return;
    }

    setLoading(true);
    setProgress(0);

    const newCodesArray = [];
    const usedCodesSet = new Set();
    const uniqueBatchId = generateUUID(); 

    while (newCodesArray.length < quantity) {
      const newCode = generateRandomCode();
      if (!usedCodesSet.has(newCode)) {
        usedCodesSet.add(newCode);
        newCodesArray.push({
          code: newCode,
          is_active: true,
          status: "active",
          batch_id: uniqueBatchId 
        });
      }
    }

    const chunkSize = 1000;
    try {
      for (let i = 0; i < newCodesArray.length; i += chunkSize) {
        const chunk = newCodesArray.slice(i, i + chunkSize);
        const { error } = await supabase.from("promo_codes").insert(chunk);
        
        if (error) throw error;

        const currentProgress = Math.min(Math.round(((i + chunk.length) / quantity) * 100), 100);
        setProgress(currentProgress);
      }

      toast.success(`Yangi ${quantity} ${t.toastSuccessGen}`);
      await fetchBatches();
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + err.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Partiyani pauza qilish yoki faollashtirish
  const toggleGroupPause = async (batch) => {
    const nextStatus = batch.status === "paused" ? "active" : "paused";

    try {
      const chunkSize = 1000;
      for (let i = 0; i < batch.ids.length; i += chunkSize) {
        const chunkIds = batch.ids.slice(i, i + chunkSize);
        const { error } = await supabase
          .from("promo_codes")
          .update({ status: nextStatus })
          .in("id", chunkIds);

        if (error) throw error;
      }

      toast.success(t.toastStatusUpdated);
      await fetchBatches();
      if (expandedBatch === batch.batchId) {
        setActiveBatchCodes(prev => prev.map(c => ({ ...c, status: nextStatus })));
      }
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    }
  };

  const openDeleteModal = (ids) => {
    setSelectedGroupCodes(ids);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = async () => {
    if (selectedGroupCodes.length === 0) return;
    setDeleteLoading(true);

    try {
      const chunkSize = 1000;
      for (let i = 0; i < selectedGroupCodes.length; i += chunkSize) {
        const chunk = selectedGroupCodes.slice(i, i + chunkSize);
        const { error } = await supabase.from("promo_codes").delete().in("id", chunk);
        if (error) throw error;
      }

      toast.success(t.toastSuccessDel);
      setExpandedBatch(null);
      setActiveBatchCodes([]);
      await fetchBatches();
    } catch (err) {
      toast.error(t.toastErrDel + err.message);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setSelectedGroupCodes([]);
    }
  };

  const copyGroupToClipboard = async (ids) => {
    try {
      let allCopied = [];
      const chunkSize = 1000;

      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunkIds = ids.slice(i, i + chunkSize);
        const { data, error } = await supabase
          .from("promo_codes")
          .select("code")
          .in("id", chunkIds);

        if (error) throw error;
        if (data) allCopied = [...allCopied, ...data];
      }

      const text = allCopied.map(c => c.code).join("\n");
      navigator.clipboard.writeText(text);
      toast.info(t.toastCopied);
    } catch (err) {
      toast.error("Nusxalashda xatolik: " + err.message);
    }
  };

  return (
    <div className="generator-wrapper fade-in">
      <div className="generator-header-card">
        <div className="header-info">
          <div className="header-icon-container">
            <FaLayerGroup size={22} />
          </div>
          <div>
            <h3>{t.mainTitle}</h3>
            <p>{t.subtitle}</p>
          </div>
        </div>

        <div className="generator-controls">
          <div className="custom-input-group">
            <label>{t.quantityLabel}</label>
            <input 
              type="number" 
              min="1" 
              max="10000" 
              value={quantity === 0 ? "" : quantity} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setQuantity(0);
                } else {
                  setQuantity(parseInt(val, 10) || 0);
                }
              }}
              disabled={loading}
              style={{ width: "85px" }} 
            />
          </div>
          <button onClick={handleGenerate} disabled={loading} className="main-generate-btn">
            {loading ? (
              <span>{t.generating} {progress}%</span>
            ) : (
              <><FaPlus size={13} /> {t.btnGenerate}</>
            )}
          </button>
        </div>
      </div>

      <div className="generated-title-bar">
        <h4><FaCalendarAlt color="#64748b"/> {t.sectionTitle}</h4>
      </div>

      <div className="groups-grid-layout">
        {batches.map((batch, index) => {
          const isGroupPaused = batch.status === "paused";
          const isExpanded = expandedBatch === batch.batchId;

          return (
            <div className={`group-batch-card ${isGroupPaused ? "paused-batch-card" : ""}`} key={batch.batchId}>
              <div className="batch-card-header">
                <div>
                  <span className={`batch-badge ${isGroupPaused ? "paused-badge" : ""}`}>
                    #{batches.length - index} {t.partiya}
                  </span>
                  <h5>{t.createdAt}</h5>
                  <p>{batch.time}</p>
                </div>
                
                <div className="batch-action-buttons">
                  <button 
                    onClick={() => toggleGroupPause(batch)} 
                    className={`btn-action-pause ${isGroupPaused ? "btn-active-play" : ""}`}
                    title={isGroupPaused ? "Faollashtirish" : "Vaqtincha to'xtatish"}
                  >
                    {isGroupPaused ? <FaPlay size={11} /> : <FaPause size={11} />}
                  </button>

                  <button onClick={() => openDeleteModal(batch.ids)} className="btn-action-delete">
                    <FaTrashAlt size={12} />
                  </button>
                  <button onClick={() => copyGroupToClipboard(batch.ids)} className="btn-action-copy">
                    <FaCopy size={12} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <button 
                  onClick={() => handleToggleBatchExpand(batch)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px dashed #cbd5e1",
                    background: "#f8fafc",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "6px",
                    color: "#475569"
                  }}
                >
                  {isExpanded ? (
                    <>{t.hideCodes} <FaChevronUp size={10} /></>
                  ) : (
                    <>{t.loadCodes} ({batch.count}) <FaChevronDown size={10} /></>
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="batch-codes-scroll">
                  {codesLoading ? (
                    <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#64748b" }}>
                      Yuklanmoqda...
                    </div>
                  ) : (
                    <ul>
                      {activeBatchCodes.map((item) => (
                        <li key={item.id} className={item.status === "paused" ? "paused-code-li" : ""}>
                          <div className="code-item-left">
                            <FaBarcode className={`barcode-icon ${item.status === "paused" ? "paused-barcode-icon" : ""}`} />
                            <span className={item.status === "paused" ? "paused-code-text" : ""}>{item.code}</span>
                          </div>
                          <span className={`status-pill ${item.status === "paused" ? "paused-pill" : "active-pill"}`}>
                            {item.status === "paused" ? t.statusPaused : t.statusActive}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="batch-card-footer">
                <span>{t.available} <b>{batch.count} {t.unitCodes}</b></span>
              </div>
            </div>
          );
        })}

        {/* Ishlatilgan kodlar qismi */}
        <div className="group-batch-card used-codes-special-card">
          <div className="batch-card-header">
            <div>
              <span className="batch-badge used-badge">{t.summaryBadge}</span>
              <h5 className="used-title-heading">
                <FaTimesCircle /> {t.usedTitle}
              </h5>
              <p>{t.usedSubtitle}</p>
            </div>
            {usedCodes.length > 0 && (
              <button onClick={() => openDeleteModal(usedCodes.map(c => c.id))} className="btn-action-delete">
                <FaTrashAlt size={12} />
              </button>
            )}
          </div>

          <div className="batch-codes-scroll">
            {usedCodes.length === 0 ? (
              <div className="empty-used-text">
                {t.noUsedCodes}
              </div>
            ) : (
              <ul>
                {usedCodes.map((item) => (
                  <li key={item.id} className="used-code-li">
                    <div className="code-item-left">
                      <FaBarcode className="barcode-icon disabled-icon" />
                      <span className="strikethrough-text">{item.code}</span>
                    </div>
                    <span className="status-pill used-pill">{t.statusUsed}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="batch-card-footer used-footer-top">
            <span>{t.totalUsed}</span>
            <span className="used-count-text">{usedCodes.length} {t.unitCodes}</span>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-icon-wrapper">
              <FaExclamationTriangle size={24} />
            </div>
            <h3>{t.modalTitle}</h3>
            <p>{t.modalDesc1}{selectedGroupCodes.length}{t.modalDesc2}</p>
            <div className="modal-buttons-group">
              <button onClick={confirmDeleteGroup} disabled={deleteLoading} className="modal-confirm-btn">
                {deleteLoading ? t.modalDeleting : t.modalConfirm}
              </button>
              <button onClick={() => { setShowDeleteModal(false); setSelectedGroupCodes([]); }} disabled={deleteLoading} className="modal-cancel-btn">
                {t.modalCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}