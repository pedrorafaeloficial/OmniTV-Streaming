# Build e Empacotamento

## Samsung Tizen
1. `npm install`
2. `npm run build -w apps/tizen-web`
3. Gerar pacote `.wgt`:
   ```bash
   tizen package -t wgt -s YOUR_CERT_PROFILE -o dist -- ./apps/tizen-web/dist
   ```
4. Instalar na TV:
   ```bash
   tizen install -n OmniTV.wgt -t <device_id>
   ```

## LG webOS
1. `npm install`
2. `npm run build -w apps/webos-web`
3. Empacotar `.ipk` com ares:
   ```bash
   ares-package ./apps/webos-web/dist -o dist
   ```
4. Instalar:
   ```bash
   ares-install dist/OmniTV.ipk -d <device_name>
   ```

## Roku
1. Gere o zip:
   ```bash
   npm run zip:roku
   ```
2. Acesse `http://<roku-ip>` no Dev Installer e envie o `.zip`.

## Backend/Xtream
O backend Xtream não faz parte deste repositório. Configure as credenciais em tempo de execução na tela de login.
