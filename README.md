Planora Architektur

Übersicht

Planora ist eine React-basierte Reiseplanungs-App mit modularer Struktur. Sie ermöglicht Nutzern, Reisen zu planen, Profile zu verwalten und Empfehlungen zu erhalten, unterstützt durch eine AI-Integration (Hugging Face API). Die App ist in Module aufgeteilt, die UI, Logik, Backend-Aufrufe und statische Daten trennen.

### Komponententabelle
| Komponente/Datei | Funktion |
|------------------|----------|
| **assets/images/** | Speicherort für hochgeladene Bilder. |
| **assets/icons/** | Icons für UI-Elemente (z. B. Buttons). |
| **assets/fonts/** | Benutzerdefinierte Schriftarten (z. B. Poppins). |
| **---** | **—** |
| **components/Navbar.jsx** | Navigationsleiste mit Links und Auth-Status. |
| **components/Footer.jsx** | Statischer Footer mit Links. |
| **components/SearchBar.jsx** | Suchfeld für Reiseziele oder Schlüsselwörter. |
| **components/TripCard.jsx** | Anzeige einzelner Reiseinformationen. |
| **components/Autosuggestion.jsx** | Stadt-Vorschläge mit Fuzzy Matching. |
| **---** | **—** |
| **config/.env** | Umgebungsvariablen (z. B. API-Schlüssel). |
| **---** | **—** |
| **context/AuthContext.jsx** | Globale Authentifizierungs-Zustand (Login, Logout). |
| **---** | **—** |
| **data/features.jsx** | Statische Feature-Listen (z. B. für Marketing). |
| **data/trips.js** | Mock-Daten für Reisen. |
| **data/recommendations.js** | Mock-Daten für Reiseempfehlungen. |
| **---** | **—** |
| **hooks/useRecommendation.js** | Logik für Reiseempfehlungen. |
| **hooks/useChat.js** | Chat-Zustand für Reiseplanung (PlanTripPage). |
| **hooks/useLogin.js** | Logik für Login-Formular. |
| **hooks/useRegister.js** | Logik für Registrierungs-Formular. |
| **hooks/useProfileSettings.js** | Verwaltung von Profil- und Reiseeinstellungen. |
| **---** | **—** |
| **pages/DashboardPage.jsx** | Übersicht der Benutzer-Reisen. |
| **pages/ErrorPage.jsx** | Fehlerseite (z. B. 404). |
| **pages/ExplorePage.jsx** | Anzeige von Reisevorschlägen. |
| **pages/HelpFeedbackPage.jsx** | Formular für Feedback und Hilfe. |
| **pages/HomePage.jsx** | Öffentliche Startseite. |
| **pages/LandingPage.jsx** | Marketing-Seite für neue Nutzer. |
| **pages/LoginPage.jsx** | Login-Seite. |
| **pages/OnboardingPage.jsx** | Einführung für neue Nutzer. |
| **pages/PastTripsPage.jsx** | Anzeige vergangener Reisen. |
| **pages/PlanTripPage.jsx** | Interaktive Reiseplanung mit AI-Chat. |
| **pages/ProfilePage.jsx** | Profil- und Reiseeinstellungen. |
| **pages/RegisterPage.jsx** | Registrierungs-Seite. |
| **pages/SavedTripsPage.jsx** | Anzeige gespeicherter Reisen. |
| **pages/SearchResultsPage.jsx** | Suchergebnisse. |
| **pages/SettingsPage.jsx** | Allgemeine Einstellungen (z. B. Sprache). |
| **pages/TripDetailsPage.jsx** | Details einer spezifischen Reise. |
| **pages/UpgradePlanPage.jsx** | Upgrade-Optionen für Premium-Pläne. |
| **---** | **—** |
| **services/accommodationService.js** | API-Aufrufe für Unterkünfte. |
| **services/airlineService.js** | API-Aufrufe für Flüge. |
| **services/authService.js** | Authentifizierungslogik (Login, Register). |
| **services/llmService.js** | API-Aufrufe zum Hugging Face LLM. |
| **services/recommendationService.js** | Logik für Reiseempfehlungen. |
| **---** | **—** |
| **utils/animationUtils.js** | Animations-Hilfsfunktionen (Framer Motion). |
| **utils/autosuggestUtils.js** | Logik für Stadt/Land-Vorschläge. |
| **utils/chatLogic.js** | Chat-Logik für PlanTripPage. |
| **utils/chatUtils.js** | Hilfsfunktionen für Chat. |
| **utils/constants.js** | Globale Konstanten (z. B. Klassen). |
| **utils/navigationUtils.js** | Navigations-Hilfsfunktionen. |
| **utils/protectedRoute.jsx** | Schutz für authentifizierte Routen. |
| **utils/storageUtils.js** | LocalStorage-Verwaltung. |
| **utils/travelOptions.js** | Optionen für Reisepräferenzen. |
| **utils/userUtils.js** | Benutzerbezogene Hilfsfunktionen. |
| **---** | **—** |
| **styles/theme.css** | Globale Styles (z. B. Tailwind). |
| **---** | **—** |
| **App.jsx** | Hauptkomponente mit Router und AuthContext. |
| **main.jsx** | Einstiegspunkt der App. |
| **index.css** | Globale CSS-Styles. |
| **App.css** | App-spezifische CSS-Styles. |
