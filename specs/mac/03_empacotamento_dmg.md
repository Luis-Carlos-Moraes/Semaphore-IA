# Spec 03: Empacotamento DMG (macOS)

Esta especificação define as diretrizes para compilação, distribuição e criação de pacotes DMG para computadores macOS no Semaphore-IA.

---

## 📦 Ferramenta de Empacotamento

Utilizamos o **electron-builder** para criar o arquivo `.dmg` de instalação.

*   **Configurações do compilador**: Definidas na seção `"build"` do [package.json](../../package.json#L34).
*   **Alvo de Saída (Target)**: DMG (Apple Disk Image).
*   **Formato Final**: Arquivo `.dmg` contendo o executável `.app` para arrastar e soltar em `/Applications`.

---

## 🛠️ Configuração de Build do macOS

Configuração específica definida no `package.json`:

```json
"mac": {
  "target": "dmg",
  "icon": "assets/icon.png"
}
```

*   **Ícones**: O electron-builder exige o formato `.icns` ou converte automaticamente o PNG de origem (`assets/icon.png`) se possuir resolução mínima de 512x512 pixels.

---

## ⚙️ Comandos de Compilação

Para compilar em uma máquina macOS:

```bash
# Executa a geração do DMG final
npm run dist
```
*Resultado:* Um instalador executável `SemaphoreJS-<versao>.dmg` será criado na pasta `dist/`.

---

## 🛡️ Particularidades do Gatekeeper e Assinatura de Código

1.  **Código Não Assinado (Unsigned App)**:
    Se compilado localmente sem certificados pagos da Apple, o macOS bloqueará a execução do app informando que *"o desenvolvedor não pode ser verificado"*.
2.  **Solução de Contorno Local (Workaround)**:
    Para desenvolvedores testarem ou compartilharem de forma livre de taxas com colaboradores internos, eles devem rodar o seguinte comando no terminal do macOS para limpar as flags de quarentena do arquivo baixado:
    ```bash
    sudo xattr -cr /Applications/SemaphoreJS.app
    ```
3.  **Assinatura de Produção**:
    Para uma distribuição oficial pública sem avisos do sistema, o build deve ser assinado e notarizado usando as chaves de ambiente `CSC_LINK` e `CSC_KEY_PASSWORD` atreladas a uma conta de desenvolvedor da Apple.
