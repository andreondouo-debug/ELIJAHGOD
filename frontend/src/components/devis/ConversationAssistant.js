import { useState, useEffect, useRef } from 'react';
import './ConversationAssistant.css';

/**
 * 💬 ASSISTANT CONVERSATIONNEL INTERACTIF
 * Guide l'utilisateur pendant la création du devis
 * et répond à ses questions en temps réel
 */

const QUICK_QUESTIONS = [
  'Quel est le délai de réponse ?',
  'Aide pour cette étape',
  'Quels sont vos tarifs ?',
  'Quelles prestations proposez-vous ?'
];

function ConversationAssistant({ messages, onUserMessage }) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroller automatiquement vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text || !onUserMessage) return;
    onUserMessage(text);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question) => {
    if (!onUserMessage) return;
    onUserMessage(question);
    inputRef.current?.focus();
  };

  return (
    <div className={`conversation-assistant ${isOpen ? 'open' : 'collapsed'}`}>
      {/* En-tête */}
      <div className="conversation-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="assistant-avatar">🤖</div>
        <div className="assistant-info">
          <h3>Assistant ElijahGod</h3>
          <p>{isOpen ? 'Cliquez pour réduire' : 'Je vous guide dans la création de votre devis'}</p>
        </div>
        <button type="button" className="toggle-btn" aria-label={isOpen ? 'Réduire' : 'Agrandir'}>
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {isOpen && (
        <>
          {/* Messages */}
          <div className="conversation-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message message-${msg.source}`}
              >
                <div className="message-bubble">
                  <div className="message-icon">
                    {msg.source === 'guide' && '🤖'}
                    {msg.source === 'client' && '👤'}
                    {msg.source === 'system' && 'ℹ️'}
                  </div>
                  <div className="message-content">
                    <p>{msg.message}</p>
                  </div>
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          {onUserMessage && (
            <div className="quick-questions">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="quick-btn"
                  onClick={() => handleQuickQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Zone de saisie */}
          {onUserMessage && (
            <div className="chat-input-area">
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez une question à l'assistant..."
                maxLength={300}
              />
              <button
                type="button"
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Envoyer"
              >
                ➤
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ConversationAssistant;
