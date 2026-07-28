import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Send, MessageSquare, User, Loader2, MoreVertical, Pencil, Trash2, X, Check, ArrowLeft } from "lucide-react";
import {
  getConversationsClient, startConversation, getMessages, sendMessage,
  updateMessage, deleteMessage,
} from "../../services/message.service";
import ClientTopNav from "../../components/ClientTopNav";
import "../../assets/styles/ClientDashboard.css";
import "../../assets/styles/Messages.css";

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, mode }
  const menuRef = useRef(null);

  const loadConversations = useCallback(() => {
    getConversationsClient()
      .then((res) => setConversations(res.data || []))
      .catch(() => setError("Impossible de charger vos conversations."));
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const talentId = searchParams.get("talent_id");
    if (!talentId) return;

    startConversation(talentId)
      .then((res) => {
        setActiveId(res.data.conversation_id);
        loadConversations();
      })
      .catch(() => setError("Impossible de démarrer la conversation."))
      .finally(() => {
        searchParams.delete("talent_id");
        setSearchParams(searchParams, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Ferme le menu contextuel au clic en dehors
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const handleDelete = (id, mode) => {
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
    <div className="cd-root">
      <ClientTopNav activeKey="messages" />

      <main className="cd-main">
        {/* ✅ La classe "ms-thread-open" pilote l'affichage liste/fil sur
            mobile (voir Messages.css) — sans elle, le fil reste masqué
            même après avoir sélectionné une conversation. */}
        <div className={`ms-layout ${activeId ? "ms-thread-open" : ""}`}>

          <aside className="ms-sidebar">
            <h1 className="ms-sidebar-title">Messages</h1>

            {conversations === null ? (
              <p className="ms-empty-text">Chargement...</p>
            ) : conversations.length === 0 ? (
              <div className="ms-empty">
                <MessageSquare size={26} />
                <p>Aucune conversation pour le moment.</p>
                <button onClick={() => navigate("/recherche")} className="ms-empty-btn">
                  Explorer les talents
                </button>
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
                      {c.talent_photo
                        ? <img src={c.talent_photo} alt={c.talent_nom} />
                        : <User size={18} />
                      }
                    </div>
                    <div className="ms-conv-info">
                      <p className="ms-conv-name">{c.talent_nom}</p>
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
                    {activeConversation?.talent_photo
                      ? <img src={activeConversation.talent_photo} alt="" />
                      : <User size={18} />
                    }
                  </div>
                  <p className="ms-thread-name">{activeConversation?.talent_nom}</p>
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

        {error && <p className="cd-error">{error}</p>}
      </main>

      {confirmDelete && (
        <div className="ms-confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="ms-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <p className="ms-confirm-text">
              {confirmDelete.mode === "tous"
                ? "Supprimer ce message pour tout le monde ?"
                : "Supprimer ce message pour vous uniquement ?"}
            </p>
            <div className="ms-confirm-actions">
              <button onClick={() => setConfirmDelete(null)} className="ms-confirm-cancel">Annuler</button>
              <button onClick={() => handleDelete(confirmDelete.id, confirmDelete.mode)} className="ms-confirm-delete">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}