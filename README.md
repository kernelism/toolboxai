<div align="center">
  <img src="./assets/toolboxai.png" alt="ToolboxAi Logo" width="160"/>
  <h1>ToolboxAi</h1>
  <p>
    <b>Your AI-powered research assistant for reading and understanding papers.</b>
  </p>
  <p>
    <a href="https://github.com/MinatoNamikaze02/toolboxai">
      <img src="https://img.shields.io/github/stars/MinatoNamikaze02/toolboxai?style=social" alt="GitHub stars"/>
    </a>
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"/>
    <img src="https://img.shields.io/docker/pulls/library/python?label=Dockerized" alt="Docker"/>
  </p>
</div>

---

## 🚀 Overview

**ToolboxAi** is an AI reading assistant designed for researchers and students. Select text from uploaded PDF files, ask questions about the content, and save answers as notes for later reference. ToolboxAi supports multiple LLMs (Together.ai, OpenAI, or local Ollama models) and is under active development.

---

## ✨ Features

- 🔍 **Select text and ask questions** from any part of your PDF.
- 🤖 **Ask general questions** about the entire document.
- 📝 **Save notes** for each PDF (stored in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)).
- 📄 **Select text across multiple pages**.
- 🗒️ **Focus mode**: View notes with context, question, and answer highlighted.
- 🗑️ **Delete notes** and clear conversations anytime.
- 🔎 **PDF viewer** with zoom and navigation.
- 📥 **Upload PDFs** directly.
- 🔄 **Docker support** for easy deployment.
- ➕ **Follow-up questions** on notes.
- 🧠 **Multiple LLM backends**: Together.ai, OpenAI, or local Ollama.
- 🛣️ **Roadmap**: DOI scraping, image querying, and more!

---

## 🖼️ How it looks

<p align="center">
  <img src="./assets/ss1.png" width="350"/>
  <img src="./assets/ss2.png" width="350"/>
  <br/>
  <img src="./assets/ss3.png" width="350"/>
  <img src="./assets/ss4.png" width="350"/>
</p>

---

## ⚡ Quick Start

### Using Docker (Recommended)

```bash
git clone https://github.com/MinatoNamikaze02/toolboxai.git
cd toolboxai
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

---

### Manual Setup

#### Frontend

```bash
cd toolboxai/frontend
npm install
npm start
```

#### Backend

Make sure you have [Poetry](https://python-poetry.org/) installed:

```bash
cd toolboxai/backend
poetry install
poetry run uvicorn server:app --host 0.0.0.0 --port 8000
```

---

## ⚙️ Configuration

### Backend

1. Create a `.env` file in the `backend` directory:

    ```bash
    touch backend/.env
    ```

2. Add your configuration:

    ```env
    # Choose your model backend: together_ai, openai, or local
    MODEL_BACKEND=together_ai

    # For Together.ai
    API_KEY=your_api_key_here
    MODEL=model_name  # e.g., togethercomputer/llama-2-70b-chat
    API_URL=https://api.together.xyz/v1/completions

    # For local models via Ollama
    LOCAL_MODEL_NAME=model_name  # e.g., llama2 or mistral
    OLLAMA_API_URL=http://localhost:11434

    # Path to your documents
    DOCUMENTS_DIR=./documents
    ```

### Frontend

1. Create a `.env` file in the `frontend` directory:

    ```bash
    touch frontend/.env
    ```

2. Add your backend API endpoint:

    ```env
    REACT_APP_API_PATH=http://localhost:8000
    ```

---

## 🛣️ Roadmap

- [ ] Support scraping PDFs with DOI
- [ ] Querying on images
- [x] Select text across multiple PDF pages
- [x] Delete notes
- [x] Ask questions on the entire PDF
- [x] Follow-up questions on notes

---

## 🐞 Issue Log

- [x] Cannot select text from multiple PDF pages
- [x] Cannot delete notes
- [x] UI scroll/z-index issues
- [x] "Ask a question" box sizing with long answers (temporary fix: max tokens)

---

## 📄 License

MIT

---

<p align="center">
  <b>Made with ❤️ for researchers and students.</b>
</p>