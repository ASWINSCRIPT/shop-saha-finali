import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = "pk_test_c3BlY2lhbC1jb3JnaS0yMy5jbGVyay5hY2NvdW50cy5kZXYk"

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

createRoot(document.getElementById("root")!).render(
  <App />
);
