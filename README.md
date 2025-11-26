# Calendário do II Simpósio de Extensão Curricular

Aplicação React + TypeScript que transforma a planilha do simpósio em uma visualização web interativa com filtros por dia, período, sala e busca por título. A identidade visual usa o logo e as cores da Unifametro.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy automático (GitHub Pages)

- Push na branch `main` dispara o workflow `.github/workflows/deploy.yml`.
- O Vite está configurado com `base: '/simposio/'` para funcionar no GitHub Pages.
- O workflow faz build e publica em `gh-pages`. Depois do primeiro deploy, ative o GitHub Pages apontando para a branch `gh-pages` nas configurações do repositório.

## Dados

Os 434 itens extraídos da planilha estão em `src/data/schedule.json`. O logo usado fica em `public/unifametro.png`.
