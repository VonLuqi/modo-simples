# Proposta do Projeto — UC Projeto Integrador 2025

Fonte: *1. Proposta de Projeto 2025.docx*

## Identificação

| Campo | Valor |
| --- | --- |
| Turma | 028.2025.126 |
| Professora | Jô Ferreira |
| Tema principal | Acessibilidade para plataformas digitais |
| Tema do grupo | Implementação do Modo Simplificado / Modo Simples em plataformas digitais |

## Equipe

- Lucas Frederico Soares de Aragão
- Márcio José da Silva Junior
- Flavio Magno Fulgencio Junior
- Juliana Gomes
- Larisse Aparecida de Rezende Silva
- Reynaldo Julio Lara Rodriguez

## Objetivo

Desenvolver e implementar um modo de acessibilidade (**Modo Simples**) em plataformas digitais, facilitando a interface e a navegação para pessoas com dificuldade em tecnologia ou com deficiências cognitivas que dificultam o uso dessas plataformas.

## Ações previstas (descrição)

1. **Ferramenta aplicável** que adapta uma plataforma digital existente, modificando layout e elementos em cena, para uma navegação mais simples, direta e proveitosa.
2. **Protótipo / modelo de implementação** (código) para desenvolvedores, facilitando a adoção do Modo Simples em outros sites.

## Justificativa

- Inclusão social de públicos com maior barreira digital (ex.: idosos, pessoas com TDAH, pessoas no espectro autista).
- Redução do excesso de informação nas interfaces, tornando a navegação mais agradável, objetiva e aproveitável.

## Desafios reconhecidos na proposta

- Prazo de produção
- Comunicação da equipe
- Aprendizado das linguagens e softwares alinhado ao calendário das aulas
- Estudo de caso / conteúdo do projeto
- Divisão de tarefas
- Desenvolvimento do projeto
- Aceitação das ideias propostas

## Como isso se traduz no repositório

| Intenção da proposta | Tradução técnica no repo |
| --- | --- |
| Adaptar plataforma existente | Site protótipo Senac Minas em `examples/` + script injetável |
| Facilitar navegação | Ocultar distrações, destacar conteúdo principal, opções de a11y |
| Modelo para desenvolvedores | Biblioteca `src/` empacotável em `dist/modo-simples.min.js` |
| Inclusão cognitiva | UI com menu radial, persistência de preferências, ARIA/teclado |
