import { useEffect, useRef } from 'react';
import './ConversationAssistant.css';

/**
 * 💬 ASSISTANT CONVERSATIONNEL
 * Affiche les messages du guide interactif
 */

function ConversationAssistant({ messages }) {
  const messagesEndRef = useRef(null);

  // Scroller automatiquement vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) return null;

  return (
    <div className="conversation-assistant">
      <div className="conversation-header">
        <div className="assistant-avatar">🤖</div>
        <div className="assistant-info">
          <h3>Assistant ElijahGod</h3>
          <p>Je vous guide dans la création de votre devis</p>
        </div>
      </div>

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
                {msg.data && (
                  <div className="message-data">
                    {JSON.stringify(msg.data, null, 2)}
                  </div>
                )}
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
    </div>
  );
}

export default ConversationAssistant;
