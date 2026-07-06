# Spec 03: Empacotamento para Distribuição (Linux)

Esta especificação define as diretrizes para compilação, geração de pacotes e distribuição do Semaphore-IA no sistema operacional Linux.

---

## 📦 Formatos de Distribuição

Dada a fragmentação das distribuições Linux, empacotamos o aplicativo em dois formatos principais e amplamente suportados:

1.  **AppImage**: Um executável portátil universal de arquivo único que roda em qualquer distribuição Linux moderna sem a necessidade de instalação ou permissões de root.
2.  **DEB (Debian Package)**: Pacote de instalação nativo para distribuições baseadas em Debian e Ubuntu (utiliza o utilitário `dpkg` ou instaladores gráficos).

---

## 🛠️ Configuração de Build do Linux

Definição configurada na seção `"build"` do arquivo [package.json](../../package.json#L38):

```json
"linux": {
  "target": [
    "AppImage",
    "deb"
  ],
  "icon": "assets/icon.png"
}
```

---

## ⚙️ Comandos de Compilação

Para compilar em uma máquina Linux ou ambiente Docker correspondente:

```bash
# Gera o pacote AppImage e o instalador DEB final
npm run dist
```

### Resultados Gerados no Diretório `dist/`
*   `SemaphoreJS-<versao>.AppImage`: O executável portátil. O usuário precisa conceder permissão de execução (`chmod +x <arquivo>.AppImage`) antes de rodar.
*   `semaphore_<versao>_amd64.deb`: O instalador Debian. Pode ser instalado via terminal usando `sudo dpkg -i semaphore_<versao>_amd64.deb`.
