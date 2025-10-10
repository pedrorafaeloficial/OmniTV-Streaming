# OmniTV-IPTV

Monorepo para o aplicativo premium de IPTV OmniTV com builds para Samsung Tizen, LG webOS e Roku.

## Pré-requisitos

- Node.js 18+
- npm 9+
- Tizen Studio CLI configurado (`tizen`)
- webOS SDK / ares CLI (`ares-package`, `ares-install`)
- Roku TV ou player com Dev Mode habilitado

## Instalação

```bash
npm install
```

## Configurando credenciais Xtream

Crie um arquivo `.env.local` nas apps web (`apps/tizen-web`, `apps/webos-web`) ou defina via UI:

```
XTREAM_HOST=https://example.com
XTREAM_USERNAME=seuusuario
XTREAM_PASSWORD=suasenha
```

As credenciais são cifradas localmente após login com AES-GCM (WebCrypto) ou ofuscadas no Roku.

## Desenvolvimento

### Tizen

```bash
npm run dev:tizen
```

Abre um servidor Vite com hot reload para navegador/TV. Utilize `npm run build -w apps/tizen-web` para build de produção.

### webOS

```bash
npm run dev:webos
```

Similar ao Tizen, com adaptações de bridge webOS.

### Roku

Execute o script para gerar o zip:

```bash
npm run zip:roku
```

Envie o pacote pela Roku Dev Installer.

## Build e empacotamento

Consulte [`tools/build-scripts.md`](tools/build-scripts.md) para instruções completas de empacotamento `.wgt`, `.ipk` e `.zip`.

## Limitações da Fase 1

- Sem billing in-app nas TVs
- Sem DRM
- EPG simplificado (quando indisponível, o app continua funcionando)

## FAQ

- **Host inválido**: verifique se o domínio Xtream responde em `player_api.php`.
- **Sem EPG**: o adaptador tolera respostas vazias; confirme se o provider entrega XMLTV.
- **Sem capa**: exibimos placeholders amigáveis; verifique `stream_icon` e URLs HTTPS válidas.

## Repositório

Monorepo com workspaces:

- `packages/core`: lógica de Xtream, parental, storage e utilitários.
- `packages/ui`: componentes TV-safe e tema.
- `apps/tizen-web`: app web para Samsung Tizen.
- `apps/webos-web`: app web para LG webOS (reutiliza lógica Tizen com bridge).
- `apps/roku`: app SceneGraph/BrightScript.
- `tools`: scripts auxiliares e templates de assets.

## Scripts principais

- `npm run build` – build dos pacotes e apps web.
- `npm run dev:tizen` – desenvolvimento Tizen.
- `npm run dev:webos` – desenvolvimento webOS.
- `npm run zip:roku` – cria pacote Roku.

## Licença

Placeholders de assets livres de restrições. Adapte conforme necessidade comercial.
