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

**ToolboxAi** is an AI reading assistant designed for researchers and students. Select text from uploaded PDF files, ask questions about the content, and save answers as notes for later reference. ToolboxAi supports routing across different llms from openai, anthropic and ollama.

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
- 🧠 **Multiple LLM backends**: OpenAI, Anthropic or local Ollama.
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
    OPENAI_API_KEY=<your-api-key>
    ANTHROPIC_API_KEY=<your-api-key>
    MODEL_BACKEND=openai # default
    DOCUMENTS_DIR="./data/documents" # documents storage folder
    ```

3. Add your preferred model list in backend/models.toml

    ```toml
    # Model configurations for different providers
    # Each provider can have multiple models with different weights
    # Weights determine the probability of selecting a model (higher weight = more likely to be selected)

    [models]
    # Available models: gpt-4, gpt-3.5-turbo, gpt-4-turbo-preview
    openai = [
        { name = "gpt-4", weight = 1 },           # Most capable but expensive
        { name = "gpt-3.5-turbo", weight = 2 }    # Good balance of cost and capability
    ]

    # Available models: claude-3-opus, claude-3-sonnet, claude-3-haiku

    # Available models depend on what you've pulled into Ollama
    # Common models: llama2, mistral, codellama, neural-chat


    # Routing configuration
    [routing]
    # Default provider to use when making requests
    # Must be one of: openai, anthropic, ollama
    default_provider = "openai"

    # Fallback provider if the default provider fails
    # Must be one of: openai, anthropic, ollama
    fallback_provider = "anthropic" 
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