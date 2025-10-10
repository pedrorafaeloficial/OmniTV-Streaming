import '../public/index.html';
import '@omnitv/ui/src/theme.css';
import { createApp } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('Elemento root não encontrado');
  }
  createApp(root);
});
