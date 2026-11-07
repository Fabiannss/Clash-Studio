# Clash Studio

Monte batalhas épicas de 60 segundos entre personagens de animes, mangás e quadrinhos.
O app organiza o roteiro e os prompts, une os clipes gerados no Flow e prepara o material de publicação.

Não usa API paga nem chave de acesso. Tudo roda no navegador.

## Como funciona

1. **Lutadores.** Busca no AniList (mangá/anime) e na Wikipedia (quadrinhos). A ficha é editável.
2. **Roteiro.** O app monta um prompt mestre. Você cola no Gemini e traz o JSON de volta. Também há um roteiro de modelo para testar.
3. **Clipes.** Cada take de 20s tem 3 sub-clipes (8s, 8s, 4s). Copie cada prompt, gere no Flow, baixe o MP4 e envie.
   Use "Baixar quadro final" para ter a imagem inicial do clipe seguinte e manter a cena contínua.
4. **Montagem.** O FFmpeg (WASM, no navegador) padroniza os clipes, une os takes com crossfade e aplica a trilha.
5. **Publicar.** Baixe o MP4 e gere títulos, descrições e tags para YouTube e TikTok pelo Gemini.

## Estrutura

```
src/
  domain/      tipos, constantes, schemas (Zod) e regras de tempo dos clipes
  services/    busca de lutadores, prompts, leitura do JSON, roteiro
  lib/ffmpeg/  uma etapa do vídeo por arquivo (padronizar, unir, trilha, último quadro)
  store/       estado global (Zustand)
  hooks/       useRender
  components/  interface em português, uma pasta por etapa
scripts/       copy-ffmpeg-core.mjs (copia o FFmpeg WASM para public/ no npm install)
```

## Rodar no seu computador

Requer Node.js 20 ou superior.

```
npm install
npm run dev
```

O `npm install` copia o FFmpeg WASM (cerca de 30 MB) para `public/ffmpeg`. A pasta não vai para o Git.
Abra http://localhost:3000.

## Publicar com GitHub e Vercel

1. Envie o projeto para um repositório no GitHub.
2. Na Vercel, escolha "Add New Project" e importe o repositório.
3. Mantenha as configurações padrão do Next.js e clique em Deploy.

A Vercel roda `npm install` (que copia o FFmpeg) e depois o build. Não há variáveis de ambiente.

## Salvamento do projeto

O projeto é salvo sozinho no navegador: textos no localStorage, vídeos e música no IndexedDB.
Ao atualizar ou reabrir a página, tudo volta. O botão "Novo projeto" apaga o que foi salvo.

- O salvamento vale por endereço: `localhost:3000` e `127.0.0.1:3000` guardam projetos separados. Use sempre o mesmo.
- Janela anônima e a limpeza de dados do site apagam o projeto.
- O vídeo final montado não é salvo. Ele é refeito a partir dos clipes, que ficam guardados.

## Limites conhecidos

- A montagem usa a memória do navegador. Em computadores com pouca RAM, feche outras abas.
- O FFmpeg WASM é mais lento que o nativo. Conte alguns minutos para os 60s.
- Cada geração no Flow consome créditos da sua assinatura Google AI Pro.
- Respeite os termos do Flow e as regras de uso dos personagens ao publicar.
