# Modo Simples

Bem-vindo ao projeto **Modo Simples**! Este projeto serve como base para desenvolvimento, já configurado com ferramentas automáticas para garantir a qualidade e padronização do código.

---

## 🚀 Como começar (Obrigatório)

Para garantir que todas as ferramentas de automação (como o Prettier e o Husky) funcionem corretamente no teu computador, segue estes passos rigorosamente:

1. **Clonar o repositório:**

   ```bash
   git clone https://github.com/VonLuqui/modo-simples.git
   cd modo-simples
   ```

2. **Instalar dependências (IMPORTANTE):**
   Este passo é fundamental. Além de baixar as bibliotecas, ele ativa o sistema de verificação de código (Husky) no teu computador.

   ```bash
   npm install
   ```

---

## 🛠️ Comandos Disponíveis

No terminal, podes executar os seguintes comandos:

- **`npm start`**:
  Executa o projeto principal (roda o arquivo `src/modo-simples.js`).

- **`npm run format`**:
  Formata manualmente todos os arquivos do projeto usando as regras do Prettier.

---

## 🎨 Padronização de Código (Automático)

Nós usamos **Prettier** para manter o código limpo e **Husky** para garantir que ninguém envie código fora do padrão para o GitHub.

### Como funciona?

Tu não precisas de te preocupar em formatar o código manualmente. O processo é automático:

1. Escreve o teu código normalmente.
2. Quando fizeres um `git commit`, o sistema (Husky + lint-staged) vai verificar e **formatar automaticamente** os teus arquivos.
3. Se houver algum erro grave que o sistema não consiga corrigir sozinho, o commit será bloqueado e verás o aviso no terminal para que possas corrigir.

### Regras principais (definidas no `.prettierrc`)

- **Ponto e vírgula**: Obrigatório no final da linha (`semi: true`).
- **Aspas**: Simples (`' '`) em vez de duplas (`singleQuote: true`).
- **Indentação**: 2 espaços (`tabWidth: 2`).
- **Vírgula final**: Adicionada em listas e objetos (`trailingComma: "all"`).

---

## ⚙️ Configuração do Editor (VS Code)

Este projeto contém uma pasta `.vscode` que ajuda a manter a consistência entre todos os programadores.

**Recomendações:**

1. Utilize o **Visual Studio Code**.
2. Instale a extensão **Prettier - Code formatter**.
3. O projeto está configurado para formatar o arquivo automaticamente sempre que salvar (`Ctrl + S` ou `Cmd + S`).

---

## 📁 Estrutura do Projeto

- **`src/`**: Código fonte do projeto.
- **`.husky/`**: Configurações dos ganchos do Git (não apagar).
- **`.vscode/`**: Configurações partilhadas do editor.
- **`.prettierrc`**: Arquivo de regras de formatação.

<!-- end list -->

### O que incluí nesta versão

1. **Correção de Espaçamentos:** Corrigi os erros que o teu editor estava a mostrar na imagem (as linhas amarelas em `MD030`), garantindo o espaço correto depois dos marcadores de lista.
2. **Links e Comandos:** O link de clone está correto baseando-se no teu `package.json`.
3. **Explicação Técnica:** Detalhei o que cada regra do `.prettierrc` faz, para que os teus colegas entendam porque é que o código muda sozinho.

Este código cobre tudo o que precisas? Se faltou alguma secção específica, diz-me!
