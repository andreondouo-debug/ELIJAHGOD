import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { ClientProvider } from './context/ClientContext';
import { PrestataireProvider } from './context/PrestataireContext';
import { AdminProvider } from './context/AdminContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PrestationsPage from './pages/PrestationsPage';
import DevisPage from './pages/DevisPage';
import DevisBuilderPage from './pages/devis/DevisBuilderPage';
import DevisConfirmation from './pages/devis/DevisConfirmation';
import ContactPage from './pages/ContactPage';
import PrestatairesPage from './pages/PrestatairesPage';
import PrestataireProfilPage from './pages/PrestataireProfilPage';
import AProposPage from './pages/AProposPage';
import TemoignagesPage from './pages/TemoignagesPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import GestionDevis from './pages/GestionDevis';
import DevisDetailAdmin from './pages/DevisDetailAdmin';
import GestionPrestationsSimple from './pages/GestionPrestationsSimple';
import StatistiquesAdmin from './pages/StatistiquesAdmin';
import GestionTemoignages from './pages/GestionTemoignages';
// Pages Client
import SignupPage from './pages/SignupPage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientDashboard from './pages/ClientDashboard';
import MesDevisPage from './pages/MesDevisPage';
// Pages Prestataire
import PrestataireSignupPage from './pages/PrestataireSignupPage';
import PrestataireLoginPage from './pages/PrestataireLoginPage';
import PrestataireDashboard from './pages/PrestataireDashboard';
import PrestataireMonProfil from './pages/PrestataireMonProfil';
import ParametresPage from './pages/ParametresPage';
import GestionPrestationsAdmin from './pages/GestionPrestationsAdmin';
import NotFoundPage from './pages/NotFoundPage';
import './styles/App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SettingsProvider>
        <ClientProvider>
          <PrestataireProvider>
            <AdminProvider>
              <div className="App">
                <Header />
                <main className="main-content">
                  <Routes>
                    {/* Routes publiques */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/prestations" element={<PrestationsPage />} />
                    <Route path="/devis" element={<DevisPage />} />
                    <Route path="/devis/nouveau" element={<DevisBuilderPage />} />
                    <Route path="/devis/:devisId/confirmation" element={<DevisConfirmation />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/a-propos" element={<AProposPage />} />
                    <Route path="/temoignages" element={<TemoignagesPage />} />
                    
                    {/* Routes prestataires publiques */}
                    <Route path="/prestataires" element={<PrestatairesPage />} />
                    <Route path="/prestataires/:id" element={<PrestataireProfilPage />} />
                    
                    {/* Routes Client */}
                    <Route path="/client/inscription" element={<SignupPage />} />
                    <Route path="/client/login" element={<ClientLoginPage />} />
                    <Route path="/client/dashboard" element={<ClientDashboard />} />
                    <Route path="/mes-devis" element={<MesDevisPage />} />
                    <Route path="/client/mes-devis" element={<MesDevisPage />} />
                    
                    {/* Routes Prestataire/Fournisseur */}
                    <Route path="/prestataire/inscription" element={<PrestataireSignupPage />} />
                    <Route path="/prestataire/login" element={<PrestataireLoginPage />} />
                    <Route path="/prestataire/dashboard" element={<PrestataireDashboard />} />
                    <Route path="/prestataire/profil" element={<PrestataireMonProfil />} />
                    
                    {/* Routes admin */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/utilisateurs" element={<GestionUtilisateurs />} />
                    <Route path="/admin/devis" element={<GestionDevis />} />
                    <Route path="/admin/devis/:id" element={<DevisDetailAdmin />} />
                    <Route path="/admin/prestations" element={<GestionPrestationsSimple />} />
                    <Route path="/admin/prestations-avancees" element={<GestionPrestationsAdmin />} />
                    <Route path="/admin/stats" element={<StatistiquesAdmin />} />
                    <Route path="/admin/temoignages" element={<GestionTemoignages />} />
                    <Route path="/admin/parametres" element={<ParametresPage />} />
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </AdminProvider>
          </PrestataireProvider>
        </ClientProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
