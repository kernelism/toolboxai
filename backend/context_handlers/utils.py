import models

def research_q_prompt_builder(request: models.AskRequest):
    return f"""
    You are a powerful research assistant who always answers questions using given context focusing on brevity and clarity.
    The context is from a research paper, with document metadata and each section clearly marked by page numbers.
    Please use the context to provide accurate and detailed answers.

    Here is the context from the research paper:
    {request.context}

    Here is the question you need to answer:
    {request.prompt}

    Please provide a detailed answer based on the context above. If the context doesn't contain enough information to answer the question, please state that clearly.
    When referencing specific parts of the document, please mention the relevant page numbers.
    """
