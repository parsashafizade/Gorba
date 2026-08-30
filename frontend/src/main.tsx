import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './app/App';
import './localization/i18n';
import './styles/fonts.css';
import './styles/global.css';

const useHashRouter = import.meta.env.VITE_GITHUB_PAGES === 'true';
const Router = useHashRouter ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
