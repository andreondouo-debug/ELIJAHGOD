import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.');
      setStatus('error');
      return;
    }
    if (password !== confirm) {
      setMessage('Les mots de passe ne correspondent pas.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const { data } = await axios.post(`${API_URL}/api/clients/reset-password/${token}`, { password });
      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Mot de passe réinitialisé avec succès !');
        // Redirection auto
        let c = 5;
        const interval = setInterval(() => {
          c -= 1;
          setCountdown(c);
          if (c <= 0) { clearInterval(interval); window.location.href = '/client/login'; }
        }, 1000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Le lien est invalide ou a expiré.');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f5f7fa' }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: '2.5rem 2rem', borderRadius: 16, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>

        {status === 'success' ? (
          <>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#27ae60', marginBottom: '0.5rem' }}>Mot de passe modifié !</h2>
            <p style={{ color: '#444', marginBottom: '1rem' }}>{message}</p>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Redirection dans <strong>{countdown}</strong> seconde{countdown !== 1 ? 's' : ''}…
            </p>
            <Link to="/client/login" style={{ display: 'inline-block', padding: '12px 28px', background: '#1a1a1a', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔑</div>
            <h2 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>Nouveau mot de passe</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Choisissez un mot de passe sécurisé (minimum 6 caractères).</p>

            {status === 'error' && (
              <div style={{ background: '#fadbd8', color: '#c0392b', padding: '10px 14px', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.9rem' }}>Nouveau mot de passe *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.9rem' }}>Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Répéter le mot de passe"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{ width: '100%', padding: '12px', background: '#1a1a1a', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: '1rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer', border: 'none', opacity: status === 'loading' ? 0.7 : 1 }}
              >
                {status === 'loading' ? 'Enregistrement…' : 'Réinitialiser le mot de passe'}
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#888' }}>
              <Link to="/client/login" style={{ color: '#1a1a1a', fontWeight: 600 }}>← Retour à la connexion</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
