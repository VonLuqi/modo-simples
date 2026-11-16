/**
 * Config pré-boot do protótipo Senac (examples/).
 * Carregue ANTES de ../dist/modo-simples.min.js — a lib lê window.ModoSimplesConfig no boot.
 *
 * Na lib genérica a barra de sessão é opt-in; o protótipo ativa e diz onde montar:
 *   mount.chrome → container do switch SIMPLES
 *   mount.bar    → elemento APÓS o qual a barra "Modo Simples" entra
 *   brand        → textos do painel (a lib é genérica por padrão; aqui entra a marca do protótipo)
 */
window.ModoSimplesConfig = {
  sessionBar: true,
  mount: {
    chrome: ['.site-header .header-inner', 'header'],
    bar: ['header'],
  },
  brand: {
    title: 'Acessibilidade Digital',
    subtitle: 'Projeto Integrador 2025 • Senac',
    footer: 'Preferências salvas neste navegador · Projeto Integrador 2025',
  },
};
