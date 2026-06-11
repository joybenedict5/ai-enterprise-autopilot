import os
import pathlib
import chromadb
from chromadb.utils import embedding_functions

DB_PATH = str(pathlib.Path(__file__).parent.parent / "data" / "chromadb")

def get_collection():
    client = chromadb.PersistentClient(path=DB_PATH)
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    collection = client.get_or_create_collection(
        name="company_knowledge",
        embedding_function=ef
    )
    return collection

def search_knowledge(query: str, n_results: int = 3) -> str:
    collection = get_collection()
    if collection.count() == 0:
        return ""
    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, collection.count())
    )
    if results and results['documents']:
        chunks = results['documents'][0]
        return "\n\n".join(chunks)
    return ""