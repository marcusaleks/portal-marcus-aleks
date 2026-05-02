import React from 'react';

export default function MadSignature() {
  return (
    <a href="https://marcus.aleks.nom.br" className="mad-signature" aria-label="built by MAD Developers">
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 20, height: 20, background: '#004AC6', borderRadius: 4, flexShrink: 0,
      }}>
        <svg viewBox="0 0 32 32" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 21 L5 6 L10 6 L16 16 L22 6 L27 6 L27 21 L23 21 L23 11 L17.5 20 L14.5 20 L9 11 L9 21 Z" fill="#ffffff" />
        </svg>
      </span>
      <span style={{ color: '#ffffff', fontWeight: 900, letterSpacing: '0.08em' }}>MAD</span>
      <span style={{ color: '#6B7E99' }}>·</span>
      <span>MAD DEVELOPERS</span>
    </a>
  );
}
