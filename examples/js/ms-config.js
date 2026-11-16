/**
 * Config pré-boot do protótipo Senac (examples/).
 * Carregue ANTES de ../dist/modo-simples.min.js — a lib lê window.ModoSimplesConfig no boot.
 *
 * Na lib genérica a barra de sessão é opt-in; o protótipo ativa e diz onde montar:
 *   mount.chrome → container do switch SIMPLES
 *   mount.bar    → elemento APÓS o qual a barra "Modo Simples" entra
 */
window.ModoSimplesConfig = {
  sessionBar: true,
  mount: {
    chrome: ['.site-header .header-inner', 'header'],
    bar: ['header'],
  },
};
