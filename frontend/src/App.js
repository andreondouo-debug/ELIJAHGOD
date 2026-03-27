import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { ClientProvider } from './context/ClientContext';
import { PrestataireProvider } from './context/PrestataireContext';
import { AdminProvider } from './context/AdminContext';
import { EvenementProvider } from './context/EvenementContext';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/App.css';

// Pages chargées immédiatement (visibles dès l'arrivée)
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Pages chargées à la demande (lazy loading) — réduit le bundle initial
const PrestationsPage = lazy(() => import('./pages/PrestationsPage'));
const DevisPage = lazy(() => import('./pages/DevisPage'));
const DevisBuilderPage = lazy(() => import('./pages/devis/DevisBuilderPage'));
const DevisConfirmation = lazy(() => import('./pages/devis/DevisConfirmation'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrestatairesPage = lazy(() => import('./pages/PrestatairesPage'));
const PrestataireProfilPage = lazy(() => import('./pages/PrestataireProfilPage'));
const AProposPage = lazy(() => import('./pages/AProposPage'));
const TemoignagesPage = lazy(() => import('./pages/TemoignagesPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const GestionUtilisateurs = lazy(() => import('./pages/GestionUtilisateurs'));
const GestionDevis = lazy(() => import('./pages/GestionDevis'));
const DevisDetailAdmin = lazy(() => import('./pages/DevisDetailAdmin'));
const GestionPrestationsSimple = lazy(() => import('./pages/GestionPrestationsSimple'));
const StatistiquesAdmin = lazy(() => import('./pages/StatistiquesAdmin'));
const GestionTemoignages = lazy(() => import('./pages/GestionTemoignages'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ClientLoginPage = lazy(() => import('./pages/ClientLoginPage'));
const VerifierEmailPage = lazy(() => import('./pages/VerifierEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const MesDevisPage = lazy(() => import('./pages/MesDevisPage'));
const DevisDetailClientPage = lazy(() => import('./pages/DevisDetailClientPage'));
const PrestataireSignupPage = lazy(() => import('./pages/PrestataireSignupPage'));
const PrestataireLoginPage = lazy(() => import('./pages/PrestataireLoginPage'));
const PrestataireDashboard = lazy(() => import('./pages/PrestataireDashboard'));
const PrestataireMonProfil = lazy(() => import('./pages/PrestataireMonProfil'));
const PrestataireMissionsPage = lazy(() => import('./pages/PrestataireMissionsPage'));
const PrestataireStatsPage = lazy(() => import('./pages/PrestataireStatsPage'));
const PrestataireAvisPage = lazy(() => import('./pages/PrestataireAvisPage'));
const ClientProfilPage = lazy(() => import('./pages/ClientProfilPage'));
const ParametresPage = lazy(() => import('./pages/ParametresPage'));
const GestionPrestationsAdmin = lazy(() => import('./pages/GestionPrestationsAdmin'));
const CGVPage = lazy(() => import('./pages/CGVPage'));
const MentionsLegalesPage = lazy(() => import('./pages/MentionsLegalesPage'));
const PolitiqueConfidentialitePage = lazy(() => import('./pages/PolitiqueConfidentialitePage'));
const MesEvenementsPage = lazy(() => import('./pages/MesEvenementsPage'));

// Scroll en haut à chaque changement de page
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Fallback affiché pendant le chargement d'une page lazy
function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', color: '#667eea' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
        <p style={{ fontSize: '1rem', color: '#888' }}>Chargement...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SettingsProvider>
        <ClientProvider>
          <PrestataireProvider>
            <AdminProvider>
              <EvenementProvider>
              <ScrollToTop />
              <div className="App">
                <Header />
                <main className="main-content">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Routes publiques */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/prestations" element={<PrestationsPage />} />
                      <Route path="/devis" element={<DevisPage />} />
                      <Route path="/devis/nouveau" element={<DevisPage />} />
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
                      <Route path="/client/verifier-email/:token" element={<VerifierEmailPage />} />
                      <Route path="/client/reset-password/:token" element={<ResetPasswordPage />} />
                      <Route path="/client/dashboard" element={<ClientDashboard />} />
                      <Route path="/mes-devis" element={<MesDevisPage />} />
                      <Route path="/client/mes-devis" element={<MesDevisPage />} />
                      <Route path="/client/devis/:devisId" element={<DevisDetailClientPage />} />
                      <Route path="/client/profil" element={<ClientProfilPage />} />
                      
                      {/* Routes Prestataire/Fournisseur */}
                      <Route path="/prestataire/inscription" element={<PrestataireSignupPage />} />
                      <Route path="/prestataire/login" element={<PrestataireLoginPage />} />
                      <Route path="/prestataire/dashboard" element={<PrestataireDashboard />} />
                      <Route path="/prestataire/profil" element={<PrestataireMonProfil />} />
                      <Route path="/prestataire/missions" element={<PrestataireMissionsPage />} />
                      <Route path="/prestataire/stats" element={<PrestataireStatsPage />} />
                      <Route path="/prestataire/avis" element={<PrestataireAvisPage />} />
                      <Route path="/prestataire/evenements" element={<MesEvenementsPage />} />
                      
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
                      <Route path="/admin/evenements" element={<MesEvenementsPage />} />
                      
                      {/* Pages légales */}
                      <Route path="/cgv" element={<CGVPage />} />
                      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
                      <Route path="/politique-confidentialite" element={<PolitiqueConfidentialitePage />} />

                      {/* 404 */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
              </EvenementProvider>
            </AdminProvider>
          </PrestataireProvider>
        </ClientProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
