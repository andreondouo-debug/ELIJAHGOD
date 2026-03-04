import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './LoginPage.css'; // Réutilise les styles d'auth existants

function VerifierEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/clients/verifier-email/${token}`);
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Votre email a été vérifié avec succès !');
        } else {
          setStatus('error');
          setMessage(data.message || 'Lien invalide ou expiré.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'Le lien est invalide ou a expiré. Veuillez vous réinscrire.'
        );
      }
    };
    verify();
  }, [token]);

  // Redirection automatique vers login après succès
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) {
      window.location.href = '/client/login';
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown]);

  return (
    <div className="auth-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="auth-card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '2.5rem 2rem', borderRadius: 16, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>

        {status === 'loading' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>Vérification en cours…</h2>
            <p style={{ color: '#666' }}>Merci de patienter quelques instants.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#27ae60', marginBottom: '0.5rem' }}>Email vérifié !</h2>
            <p style={{ color: '#444', marginBottom: '1.5rem' }}>{message}</p>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Redirection automatique dans <strong>{countdown}</strong> seconde{countdown !== 1 ? 's' : ''}…
            </p>
            <Link
              to="/client/login"
              style={{ display: 'inline-block', padding: '12px 28px', background: '#1a1a1a', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}
            >
              Se connecter maintenant
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>Lien invalide</h2>
            <p style={{ color: '#444', marginBottom: '1.5rem' }}>{message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/client/inscription"
                style={{ display: 'inline-block', padding: '12px 24px', background: '#1a1a1a', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}
              >
                Créer un compte
              </Link>
              <Link
                to="/client/login"
                style={{ display: 'inline-block', padding: '12px 24px', background: 'transparent', color: '#1a1a1a', border: '2px solid #1a1a1a', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}
              >
                Se connecter
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifierEmailPage;
