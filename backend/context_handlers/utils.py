import models

def prompt_builder(request: models.AskRequest):
    return f"""
    You are a powerful research assistant who always answers questions using given context focusing on brevity and clarity.

    Here is the context which is a research paper snippet:
    {request.context}

    Here is the question you need to answer:
    {request.prompt}
    """