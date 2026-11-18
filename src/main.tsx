import React from 'react';
import ReactDOM from 'react-dom/client';
import { PreviewProvider } from './PreviewProvider';
import App from './App';
import './style.css';
import './recommendation.css';
const Provider = import.meta.env.MODE === 'toss' ? React.lazy(() => import('./TossProvider')) : PreviewProvider;
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><React.Suspense fallback={<p role="status">헤어핏을 준비하고 있어요…</p>}><Provider><App /></Provider></React.Suspense></React.StrictMode>);
