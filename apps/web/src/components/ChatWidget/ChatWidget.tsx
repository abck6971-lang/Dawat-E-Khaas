'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MessageCircle, X, Send, Bot, Sparkles, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCart } from '@/lib/CartContext';
import styles from './ChatWidget.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  "What's popular here?",
  "Any spicy dishes?",
  "Vegetarian options?",
  "What do you recommend?",
];

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Assalam o Alaikum! 👋 I'm Dawat AI. What are you craving today?",
};

// --- Custom Interactive Card Component ---
function ChatMenuCard({ itemId, menuData }: { itemId: string, menuData: any[] }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const item = menuData.find(i => i.id === itemId);
  if (!item) return null; // Wait for data or if item doesn't exist

  const handleAdd = () => {
    // Add it 'qty' times
    for (let i = 0; i < qty; i++) {
      addToCart(item);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.menuCard}>
      <div className={styles.mcImageArea}>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} width={80} height={80} className={styles.mcImage} />
        ) : (
          <div className={styles.mcImagePlaceholder}><ShoppingCart size={24} /></div>
        )}
      </div>
      <div className={styles.mcInfo}>
        <h4>{item.name}</h4>
        <p className={styles.mcPrice}>Rs. {Number(item.price).toLocaleString()}</p>
        <div className={styles.mcActions}>
          <div className={styles.mcQty}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={12} /></button>
            <span>{qty}</span>
            <button onClick={() => setQty(q => q + 1)}><Plus size={12} /></button>
          </div>
          <button className={`${styles.mcAddBtn} ${added ? styles.mcAdded : ''}`} onClick={handleAdd}>
            {added ? 'Added!' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    INITIAL_MESSAGE,
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [menuData, setMenuData] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/menu').then(r => r.json()).then(d => setMenuData(d.menuItems || []));
  }, []);

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setStreamText('');
    setInput('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setStreamText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: err.error || 'Something went wrong. Please try again.' }]);
        return;
      }

      // Stream the response word by word
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamText(fullText);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
      setStreamText('');
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Bubble */}
      <button
        className={`${styles.bubble} ${open ? styles.bubbleHidden : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open AI Assistant"
        id="chat-widget-btn"
      >
        <MessageCircle size={26} />
        <span className={styles.bubbleLabel}>Ask AI</span>
        <span className={styles.bubblePulse} />
      </button>

      {/* Chat Panel */}
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              <Image src="/logo.jpg" alt="Dawat E Khaas" width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div>
              <p className={styles.headerName}>Dawat AI</p>
              <p className={styles.headerStatus}>
                <span className={styles.statusDot} />
                Online
              </p>
            </div>
          </div>
          <div className={styles.headerRight}>
            {messages.length > 1 && (
              <button
                className={styles.clearBtn}
                onClick={handleClearChat}
                title="Clear chat"
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            )}
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : ''}`}>
              {msg.role === 'assistant' && (
                <div className={styles.msgAvatar}><Bot size={14} /></div>
              )}
              <div className={`${styles.bubble2} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    urlTransform={(url) => url}
                    components={{
                      p: ({ children }) => <div className={styles.mdP}>{children}</div>,
                      strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
                      em: ({ children }) => <em className={styles.mdEm}>{children}</em>,
                      ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
                      ol: ({ children }) => <ol className={styles.mdOl}>{children}</ol>,
                      li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
                      code: ({ children }) => <code className={styles.mdCode}>{children}</code>,
                      h3: ({ children }) => <h3 className={styles.mdH3}>{children}</h3>,
                      h4: ({ children }) => <h4 className={styles.mdH4}>{children}</h4>,
                      hr: () => <hr className={styles.mdHr} />,
                      img: ({ src, alt }) => {
                        if (typeof src === 'string' && src.startsWith('item:')) {
                          const itemId = src.split(':')[1];
                          return <ChatMenuCard itemId={itemId} menuData={menuData} />;
                        }
                        if (!src) return null;
                        return <img src={src} alt={alt} className={styles.mdImg} />;
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* Streaming message — also rendered as markdown */}
          {streamText && (
            <div className={styles.msgRow}>
              <div className={styles.msgAvatar}><Bot size={14} /></div>
              <div className={`${styles.bubble2} ${styles.bubbleAI}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(url) => url}
                  components={{
                    p: ({ children }) => <div className={styles.mdP}>{children}</div>,
                    strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
                    ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
                    ol: ({ children }) => <ol className={styles.mdOl}>{children}</ol>,
                    li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
                    code: ({ children }) => <code className={styles.mdCode}>{children}</code>,
                    img: ({ src, alt }) => {
                      if (typeof src === 'string' && src.startsWith('item:')) {
                        const itemId = src.split(':')[1];
                        return <ChatMenuCard itemId={itemId} menuData={menuData} />;
                      }
                      if (!src) return null;
                      return <img src={src} alt={alt} className={styles.mdImg} />;
                    },
                  }}
                >
                  {streamText}
                </ReactMarkdown>
                <span className={styles.cursor} />
              </div>
            </div>
          )}

          {/* Thinking dots */}
          {loading && !streamText && (
            <div className={styles.msgRow}>
              <div className={styles.msgAvatar}><Bot size={14} /></div>
              <div className={`${styles.bubble2} ${styles.bubbleAI} ${styles.thinkingBubble}`}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts (only shown at start) */}
        {messages.length === 1 && !loading && (
          <div className={styles.quickPrompts}>
            <p className={styles.quickLabel}><Sparkles size={12} /> Try asking:</p>
            <div className={styles.quickGrid}>
              {QUICK_PROMPTS.map(q => (
                <button key={q} className={styles.quickBtn} onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Ask about our menu..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            maxLength={300}
          />
          <button
            className={styles.sendBtn}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Backdrop on mobile */}
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}
    </>
  );
}
