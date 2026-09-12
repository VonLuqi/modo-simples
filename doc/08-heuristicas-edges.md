# Heurísticas — casos edge (F2-T05)

Após ajustes de seletores (`slider`, `s1`, `barra-superior`, etc.):

| Página | Comportamento esperado | Edge / limitação |
| --- | --- | --- |
| Início | Oculta header/nav/carrossel; mantém `<main>` com cursos | Carrossel (`.slider` / `.s1`) some no Modo Simples — intencional |
| Sobre Nós | Mantém texto + vídeo no main; oculta header/footer | iframe do YouTube pode ser ocultado se casar seletor `iframe` — conteúdo principal deve permanecer |
| Cursos | Cards no main visíveis | OK se `<main>` semântico |
| Contato | Form no main; barra superior/footer ocultos | Footer longo some (ruído) — OK |
| Pesquisa | Form de busca no main | OK |

Se a confiança da heurística for baixa, o painel/fluxo pede **seleção manual** do bloco principal (F2-T03) e salva o caminho por hostname (F2-T04).
