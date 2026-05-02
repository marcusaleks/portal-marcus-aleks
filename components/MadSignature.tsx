import React from 'react';

export default function MadSignature() {
  return (
    <a href="https://marcus.aleks.nom.br" className="mad-signature" aria-label="built by MAD Developers">
      <img src="/favicon.svg" width={24} height={24} alt="MAD" style={{ borderRadius: 5, flexShrink: 0 }} />
      <span>MAD DEVELOPERS</span>
    </a>
  );
}
