import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageSquare, User, Loader2, Pencil, Trash2, X, Check, ArrowLeft } from "lucide-react";
import {
  getConversationsTalent, getMessages, sendMessage, updateMessage, deleteMessage,
} from "../../services/message.service";
import TalentTopNav from "../../components/TalentTopNav";
import "../../assets/styles/TalentDashboard.css";
import "../../assets/styles/Messages.css";

export default function MessagesTalent() {
  const [conversations, setConversations] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  // ── Menu contextuel / édition / suppression ──
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  const loadConversations = useCallback(() => {
    getConversationsTalent()
      .then((res) => setConversations(res.data || []))
      .catch(() => setError("Impossible de charger vos conversations."));
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    setLoadingThread(true);
    getMessages(activeId)
      .then((res) => setMessages(res.data.messages || []))
      .catch(() => setError("Impossible de charger cette conversation."))
      .finally(() => setLoadingThread(false));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Ferme la modale de confirmation avec Échap
  useEffect(() => {
    if (!confirmDelete) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !deleting) setConfirmDelete(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmDelete, deleting]);

  const handleSend = () => {
    if (!input.trim() || !activeId) return;
    setSending(true);
    const contenu = input.trim();
    setInput("");

    sendMessage(activeId, contenu)
      .then((res) => {
        setMessages((prev) => [...prev, res.data]);
        loadConversations();
      })
      .catch(() => setError("Impossible d'envoyer le message."))
      .finally(() => setSending(false));
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditText(m.contenu);
    setOpenMenuId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const confirmEdit = (id) => {
    if (!editText.trim()) return;
    updateMessage(id, editText.trim())
      .then((res) => {
        setMessages((prev) => prev.map((m) => (m.id === id ? res.data : m)));
        cancelEdit();
      })
      .catch(() => setError("Impossible de modifier ce message."));
  };

  // ✅ Appelée uniquement depuis la modale de confirmation ci-dessous.
  const handleDelete = (id, mode) => {
    setDeleting(true);
    deleteMessage(id, mode)
      .then(() => {
        if (mode === "tous") {
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, contenu: null, supprime_pour_tous: true } : m))
          );
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== id));
        }
        loadConversations();
      })
      .catch(() => setError("Impossible de supprimer ce message."))
      .finally(() => {
        setDeleting(false);
        setConfirmDelete(null);
        setOpenMenuId(null);
      });
  };

  // ✅ Revient à la liste des conversations (bouton retour mobile).
  const handleBackToList = () => {
    setActiveId(null);
  };

  const activeConversation = conversations?.find((c) => c.id === activeId);

  return (
    <div className="td-root">
      <TalentTopNav activeKey="messages" />

      <main className="td-main">
        {/* ✅ La classe "ms-thread-open" pilote l'affichage liste/fil sur
            mobile (voir Messages.css) — sans elle, le fil reste masqué
            même après avoir sélectionné une conversation. */}
        <div className={`ms-layout ${activeId ? "ms-thread-open" : ""}`}>

          <aside className="ms-sidebar">
            <h1 className="ms-sidebar-title">Messages</h1>

            {conversations === null ? (
              <div className="ms-sidebar-loading">
                <Loader2 size={18} className="ms-spin" />
                <span>Chargement...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="ms-empty">
                <MessageSquare size={26} />
                <p>Aucune conversation pour le moment.</p>
              </div>
            ) : (
              <div className="ms-conv-list">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    className={`ms-conv-item ${activeId === c.id ? "ms-conv-active" : ""}`}
                    onClick={() => setActiveId(c.id)}
                  >
                    <div className="ms-conv-avatar">
                      {c.client_photo
                        ? <img src={c.client_photo} alt={c.client_nom} />
                        : <User size={18} />
                      }
                    </div>
                    <div className="ms-conv-info">
                      <p className="ms-conv-name">{c.client_nom}</p>
                      <p className="ms-conv-preview">{c.dernier_message || "Nouvelle conversation"}</p>
                    </div>
                    {c.non_lus > 0 && <span className="ms-conv-badge">{c.non_lus}</span>}
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="ms-thread">
            {!activeId ? (
              <div className="ms-thread-empty">
                <MessageSquare size={32} />
                <p>Sélectionnez une conversation</p>
              </div>
            ) : (
              <>
                <div className="ms-thread-header">
                  {/* ✅ Bouton retour (visible uniquement sur mobile via CSS) */}
                  <button
                    type="button"
                    className="ms-thread-back-btn"
                    onClick={handleBackToList}
                    aria-label="Retour aux conversations"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div className="ms-conv-avatar">
                    {activeConversation?.client_photo
                      ? <img src={activeConversation.client_photo} alt="" />
                      : <User size={18} />
                    }
                  </div>
                  <p className="ms-thread-name">{activeConversation?.client_nom}</p>
                </div>

                <div className="ms-thread-body">
                  {loadingThread ? (
                    <div className="ms-thread-loading">
                      <Loader2 size={20} className="ms-spin" />
                    </div>
                  ) : (
                    <>
                      {messages.map((m) => {
                        const isEditing = editingId === m.id;
                        const isMenuOpen = openMenuId === m.id;
                        const isSupprime = m.supprime_pour_tous;

                        return (
                          <div key={m.id} className={`ms-bubble-row ${m.est_moi ? "ms-bubble-row-me" : ""}`}>
                            <div
                              className={`ms-bubble ${m.est_moi ? "ms-bubble-me" : "ms-bubble-them"} ${isSupprime ? "ms-bubble-deleted" : ""}`}
                              onClick={() => !isSupprime && !isEditing && setOpenMenuId(isMenuOpen ? null : m.id)}
                            >
                              {isEditing ? (
                                <div className="ms-edit-box" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    className="ms-edit-input"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && confirmEdit(m.id)}
                                    autoFocus
                                  />
                                  <div className="ms-edit-actions">
                                    <button onClick={() => confirmEdit(m.id)} className="ms-edit-confirm"><Check size={14} /></button>
                                    <button onClick={cancelEdit} className="ms-edit-cancel"><X size={14} /></button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className={isSupprime ? "ms-deleted-text" : ""}>
                                    {isSupprime ? "Message supprimé" : m.contenu}
                                  </p>
                                  <span className="ms-bubble-time">
                                    {m.modifie && !isSupprime && <span className="ms-edited-tag">modifié · </span>}
                                    {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </>
                              )}
                            </div>

                            {isMenuOpen && !isSupprime && (
                              <div className="ms-bubble-menu" ref={menuRef}>
                                {m.est_moi && (
                                  <button onClick={() => startEdit(m)} className="ms-menu-item">
                                    <Pencil size={13} /> Modifier
                                  </button>
                                )}
                                <button onClick={() => setConfirmDelete({ id: m.id, mode: "moi" })} className="ms-menu-item">
                                  <Trash2 size={13} /> Supprimer pour moi
                                </button>
                                {m.est_moi && (
                                  <button onClick={() => setConfirmDelete({ id: m.id, mode: "tous" })} className="ms-menu-item ms-menu-item-danger">
                                    <Trash2 size={13} /> Supprimer pour tout le monde
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </>
                  )}
                </div>

                <div className="ms-thread-input-row">
                  <input
                    type="text"
                    placeholder="Écrire un message..."
                    className="ms-thread-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button
                    className="ms-send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>

        {error && <p className="td-error">{error}</p>}
      </main>

      {/* ✅ Modale de confirmation de suppression — manquait dans la version
          précédente : confirmDelete était bien renseigné par les boutons du
          menu contextuel, mais rien ne s'en servait pour appeler handleDelete. */}
      {confirmDelete && (
        <div className="ms-confirm-overlay" onClick={() => !deleting && setConfirmDelete(null)}>
          <div className="ms-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="ms-confirm-title">
              {confirmDelete.mode === "tous"
                ? "Supprimer ce message pour tout le monde ?"
                : "Supprimer ce message pour moi ?"}
            </h2>
            <p className="ms-confirm-text">
              {confirmDelete.mode === "tous"
                ? "Cette action est irréversible. Le message sera remplacé par \"Message supprimé\" pour vous et votre interlocuteur."
                : "Le message disparaîtra uniquement de votre côté de la conversation."}
            </p>
            <div className="ms-confirm-actions">
              <button
                className="ms-confirm-cancel"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                className="ms-confirm-delete"
                onClick={() => handleDelete(confirmDelete.id, confirmDelete.mode)}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={14} className="ms-spin" /> : null}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}