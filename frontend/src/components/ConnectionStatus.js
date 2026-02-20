import React, { useContext } from 'react';
import AdminContext from '../context/AdminContext';
import { ClientContext } from '../context/ClientContext';
import { PrestataireContext } from '../context/PrestataireContext';
import './ConnectionStatus.css';

/**
 * 🔍 COMPOSANT DE DEBUG - STATUS DE CONNEXION
 * Affiche qui est connecté et avec quel profil
 * Utile pour le développement
 */
const ConnectionStatus = () => {
  const { admin, token: adminToken } = useContext(AdminContext);
  const { client, isAuthenticated: clientAuth, token: clientToken } = useContext(ClientContext);
  const { prestataire, isAuthenticated: prestataireAuth, token: prestataireToken } = useContext(PrestataireContext);

  // Vérifier dans localStorage aussi
  const localAdminToken = localStorage.getItem('adminToken');
  const localClientToken = localStorage.getItem('clientToken');
  const localPrestataireToken = localStorage.getItem('prestataireToken');

  const isConnected = admin || client || prestataire;

  return (
    <div className="connection-status">
      <div className="status-header">
        <h3>🔍 Statut de Connexion</h3>
        {isConnected ? (
          <span className="status-badge connected">✅ Connecté</span>
        ) : (
          <span className="status-badge disconnected">❌ Non connecté</span>
        )}
      </div>

      <div className="status-details">
        {/* ADMIN */}
        <div className={`status-section ${admin ? 'active' : ''}`}>
          <h4>👑 Admin</h4>
          {admin ? (
            <div className="user-info">
              <p><strong>Email:</strong> {admin.email}</p>
              <p><strong>Nom:</strong> {admin.nom || admin.prenom}</p>
              <p><strong>Role:</strong> {admin.role}</p>
              <p className="token-info">
                <strong>Token:</strong> 
                <span className="token-preview">
                  {adminToken ? `${adminToken.substring(0, 20)}...` : 'N/A'}
                </span>
              </p>
              <p><small>✅ Token en contexte</small></p>
              <p><small>{localAdminToken ? '✅ Token en localStorage' : '❌ Pas de token localStorage'}</small></p>
            </div>
          ) : (
            <div className="user-info">
              <p className="not-connected">Non connecté</p>
              {localAdminToken && (
                <p className="warning">⚠️ Token trouvé en localStorage mais non chargé en contexte</p>
              )}
            </div>
          )}
        </div>

        {/* CLIENT */}
        <div className={`status-section ${client ? 'active' : ''}`}>
          <h4>👤 Client</h4>
          {client ? (
            <div className="user-info">
              <p><strong>Nom:</strong> {client.prenom} {client.nom}</p>
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Téléphone:</strong> {client.telephone || 'N/A'}</p>
              <p><strong>Authentifié:</strong> {clientAuth ? '✅ Oui' : '❌ Non'}</p>
              <p className="token-info">
                <strong>Token:</strong> 
                <span className="token-preview">
                  {clientToken ? `${clientToken.substring(0, 20)}...` : 'N/A'}
                </span>
              </p>
              <p><small>✅ Token en contexte</small></p>
              <p><small>{localClientToken ? '✅ Token en localStorage' : '❌ Pas de token localStorage'}</small></p>
            </div>
          ) : (
            <div className="user-info">
              <p className="not-connected">Non connecté</p>
              {localClientToken && (
                <p className="warning">⚠️ Token trouvé en localStorage mais non chargé en contexte</p>
              )}
            </div>
          )}
        </div>

        {/* PRESTATAIRE */}
        <div className={`status-section ${prestataire ? 'active' : ''}`}>
          <h4>🎤 Prestataire</h4>
          {prestataire ? (
            <div className="user-info">
              <p><strong>Entreprise:</strong> {prestataire.nomEntreprise}</p>
              <p><strong>Contact:</strong> {prestataire.prenom} {prestataire.nom}</p>
              <p><strong>Email:</strong> {prestataire.email}</p>
              <p><strong>Catégorie:</strong> {prestataire.categorie}</p>
              <p><strong>Authentifié:</strong> {prestataireAuth ? '✅ Oui' : '❌ Non'}</p>
              <p className="token-info">
                <strong>Token:</strong> 
                <span className="token-preview">
                  {prestataireToken ? `${prestataireToken.substring(0, 20)}...` : 'N/A'}
                </span>
              </p>
              <p><small>✅ Token en contexte</small></p>
              <p><small>{localPrestataireToken ? '✅ Token en localStorage' : '❌ Pas de token localStorage'}</small></p>
            </div>
          ) : (
            <div className="user-info">
              <p className="not-connected">Non connecté</p>
              {localPrestataireToken && (
                <p className="warning">⚠️ Token trouvé en localStorage mais non chargé en contexte</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="status-actions">
        <h4>🛠️ Actions rapides</h4>
        <div className="action-buttons">
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="btn-clear"
          >
            🗑️ Tout déconnecter
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="btn-refresh"
          >
            🔄 Rafraîchir
          </button>
          <button 
            onClick={() => {
              console.log('📊 État localStorage:');
              console.log('Admin Token:', localStorage.getItem('adminToken'));
              console.log('Client Token:', localStorage.getItem('clientToken'));
              console.log('Prestataire Token:', localStorage.getItem('prestataireToken'));
              console.log('---');
              console.log('📊 État Contexts:');
              console.log('Admin:', admin);
              console.log('Client:', client);
              console.log('Prestataire:', prestataire);
            }}
            className="btn-debug"
          >
            📋 Console Log
          </button>
        </div>
      </div>

      <div className="status-footer">
        <small>💡 Ce composant est pour le développement. Masquez-le en production.</small>
      </div>
    </div>
  );
};

export default ConnectionStatus;
