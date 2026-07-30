// src/componentes/WelcomeCard.jsx
import React from 'react';
import './WelcomeCard.css';

export function WelcomeCard({ userName }) {
  // Format current date in Spanish
  const today = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('es-ES', options);

  // Capitalize the first letter of the weekday
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="welcome-card">
      <p className="welcome-subtitle">Bienvenido de nuevo,</p>
      <h1 className="welcome-title">{userName || 'Líder de Proyecto'}</h1>
      <p className="welcome-date">{capitalizedDate}</p>
    </div>
  );
}

export default WelcomeCard;
