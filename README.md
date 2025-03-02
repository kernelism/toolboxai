## toolbox.ai

### Overview

Toolbox is a reading assistant for research papers. You can select text from uploaded pdf files and ask specific questions, and save the answers as notes to view later. Supports llms through together.ai or locally hosted models.
Still in beta.

### How it looks
*Ignore the response quality. Used a pretty small model to test the work*

![screenshot1](./assets/ss1.png)

![screenshot1](./assets/ss2.png)

![screenshot1](./assets/ss3.png)

![screenshot1](./assets/ss4.png)

![screenshot1](./assets/ss5.png)

### Setup

```
git clone https://github.com/MinatoNamikaze02?tab=repositories
```

#### Frontend 

```
cd toolboxai

npm install && npm start
```

#### Backend

```
cd backend
python -m venv local_env #optional
source local_env/bin/activate #optional
pip install -r requirements.txt

python server.py
```

#### Major issues
- [x] Cannot select text from multiple pdf pages
- [x] Cannot delete notes
- [x] Clicking outside before saving note deletes question and context, but retains answer and does not go away until saved
- [x] Right side scroll z-index issues
- [ ] Ask a question box explodes in size if answer is too long. temporary fix with max tokens
- [ ] cannot upload pdf, currently just reads all pdfs from a default folder 
- [x] cannot ask question on entire pdf
- [x] cannot ask follow up questions
- [ ] cannot use models outside togetherai if not locally hosted.

Cheers!
