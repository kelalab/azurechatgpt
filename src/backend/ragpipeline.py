from typing import Optional, Any
from haystack import Pipeline
from haystack.components.builders.prompt_builder import PromptBuilder
from haystack.components.builders.answer_builder import AnswerBuilder
from haystack.dataclasses import Answer

class RAGPipeline:
    """
    A simple ready-made pipeline for RAG. It requires a populated document store.
    """

    def __init__(self, retriever: Any, embedder: Any, generator: Any, prompt_template: str):
        """
        Initializes the pipeline.
        :param retriever: The retriever to use.
        :param embedder: The embedder to use.
        :param generator: The generator to use.
        :param prompt_template: The template to use for the prompt.
        """
        self.pipeline = Pipeline()
        self.pipeline.add_component(instance=embedder, name="text_embedder")
        self.pipeline.add_component(instance=retriever, name="retriever")
        self.pipeline.add_component(instance=PromptBuilder(template=prompt_template), name="prompt_builder")
        self.pipeline.add_component(instance=generator, name="llm")
        self.pipeline.add_component(instance=AnswerBuilder(), name="answer_builder")
        self.pipeline.connect("text_embedder.embedding", "retriever")
        self.pipeline.connect("retriever", "prompt_builder.documents")
        self.pipeline.connect("prompt_builder.prompt", "llm.prompt")
        self.pipeline.connect("llm.replies", "answer_builder.replies")
        self.pipeline.connect("llm.meta", "answer_builder.meta")
        self.pipeline.connect("retriever", "answer_builder.documents")

    def run(self, query: str) -> Answer:
        """
        Performs RAG using the given query.

        :param query: The query to ask.
        :return: An Answer object.
        """
        run_values = {
            "prompt_builder": {"question": query},
            "answer_builder": {"query": query},
            "text_embedder": {"text": query},
        }
        return self.pipeline.run(run_values)["answer_builder"]["answers"][0]