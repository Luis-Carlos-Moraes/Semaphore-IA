# Spec 03: Empacotamento via NSIS (Windows)

Esta especificação define as diretrizes para empacotamento, distribuição e geração de instaladores no Windows para o Semaphore-IA.

---

## 📦 Ferramenta de Empacotamento

Utilizamos o **electron-builder** para compilar a aplicação e gerar o instalador executável final do Windows.

*   **Configurações do compilador**: Definidas na seção `"build"` do arquivo [package.json](../../package.json).
*   **Alvo de Saída (Target)**: NSIS (Nullsoft Scriptable Install System).
*   **Formato Final**: Arquivo `.exe` auto-instalável.

---

## 🛠️ Configuração de Build do Windows

Abaixo está o bloco de configurações no [package.json](../../package.json#L30) dedicado ao Windows:

```json
"build": {
  "appId": "com.semaphore.js",
  "productName": "SemaphoreJS",
  "directories": {
    "output": "dist"
  },
  "files": [
    "src/**/*",
    "assets/**/*",
    "package.json"
  ],
  "win": {
    "target": "nsis",
    "icon": "assets/icon.png"
  }
}
```

---

## ⚙️ Comandos de Distribuição

1.  **Geração Rápida de Compilação (Apenas para Testes):**
    Gera uma pasta com os arquivos de distribuição descompactados para verificar o comportamento antes de compilar o instalador.
    ```bash
    npm run pack
    ```
    *Resultado:* Os binários brutos estarão em `dist/win-unpacked/`.

2.  **Geração do Instalador NSIS Final:**
    Gera o executável de instalação que pode ser distribuído para outros colaboradores.
    ```bash
    npm run dist
    ```
    *Resultado:* O instalador executável `SemaphoreJS Setup <versao>.exe` será gerado em `dist/`.

---

## 🛡️ Particularidades do NSIS

*   **Instalação Silenciosa**: O instalador gerado por padrão suporta argumentos silenciosos (como `/S`) no terminal Windows.
*   **Diretório de Instalação Padrão**: Por padrão, o NSIS instala a aplicação no diretório local do usuário: `AppData\Local\Programs\semaphore`.
*   **Ícones**: O arquivo de ícone padrão do Windows deve ser `assets/icon.png` ou `assets/icon.ico` (o electron-builder converte automaticamente o PNG para ICO caso não seja fornecido).
