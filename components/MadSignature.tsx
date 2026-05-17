
export default function MadSignature() {
  return (
    <a href="https://marcus.aleks.nom.br" className="mad-signature" aria-label="built by MAD Developers">
      <img src="/favicon.svg?v=2" width={20} height={20} alt="MAD" style={{ borderRadius: 5, flexShrink: 0 }} />
      <span className="mad-signature-text text-[10px] sm:text-[11px] md:text-[13px]">MAD DEVELOPERS</span>
    </a>
  );
}
