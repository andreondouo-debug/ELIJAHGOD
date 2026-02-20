import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <h1 className="error-code">404</h1>
          <h2>Page non trouvée</h2>
          <p>Désolé, la page que vous recherchez n'existe pas.</p>
          <Link to="/" className="btn btn-primary btn-lg">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
