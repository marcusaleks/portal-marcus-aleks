// tailwind.config.js
//
// Projeto roda Tailwind v4 (@tailwindcss/postcss) — animações/keyframes
// customizados NÃO são lidos daqui, e sim via @theme no styles/globals.css.
// Este arquivo só define os paths de content; não adicionar theme/animation
// aqui sem conferir se o v4 realmente os consome (já causou um bug onde o
// pulso de alerta de variações extremas não aparecia em produção).
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
};
