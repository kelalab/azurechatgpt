from typing import List, Optional, Dict, Any, Tuple
import os

import openai
import time
from tqdm import tqdm


from haystack import component, Document, default_to_dict


@component
class Debugger:
    """
    A component for debugging Documents in Hay pipeline.
    

    Usage example:
    ```python
    from haystack import Document
    from haystack.components.embedders import OpenAIDocumentEmbedder

    doc = Document(content="I love pizza!")

    document_embedder = OpenAIDocumentEmbedder()

    result = document_embedder.run([doc])
    print(result['documents'][0].embedding)

    # [0.017020374536514282, -0.023255806416273117, ...]
    ```
    """

    def __init__(
        self,
        assistantId: str ,
        debug:bool = False
    ):
        """
        Create a OpenAIDocumentEmbedder component. 
        """
        self.debug = debug
        self.assistantId = assistantId
        # if the user does not provide the API key, check if it is set in the module client
        

    def _get_telemetry_data(self) -> Dict[str, Any]:
        """
        Data that is sent to Posthog for usage analytics.
        """
        return {"model": self.model_name}


    @component.output_types(documents=List[Document])
    def run(self, documents: List[Document]):
        """
        Fix documents
        """

        for doc in documents:
            if self.debug:
              print(doc.id, doc.content[:20])

        return {"documents": documents}
