import pathlib
from vector_store import get_collection

def chunk_text(text: str, chunk_size: int = 200) -> list:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def ingest_file(filepath: str, source: str):
    with open(filepath, "r") as f:
        text = f.read()
    chunks = chunk_text(text)
    collection = get_collection()
    existing = collection.get()
    existing_ids = set(existing['ids'])
    new_chunks = []
    new_ids = []
    new_metas = []
    for i, chunk in enumerate(chunks):
        chunk_id = f"{source}_{i}"
        if chunk_id not in existing_ids:
            new_chunks.append(chunk)
            new_ids.append(chunk_id)
            new_metas.append({"source": source})
    if new_chunks:
        collection.add(
            documents=new_chunks,
            ids=new_ids,
            metadatas=new_metas
        )
        print(f"Added {len(new_chunks)} chunks from {source}")
    else:
        print(f"No new chunks from {source}")

if __name__ == "__main__":
    base = pathlib.Path(__file__).parent.parent / "data"
    ingest_file(str(base / "hr_policy.txt"),   "hr_policy")
    ingest_file(str(base / "support_kb.txt"),  "support_kb")
    print("Knowledge base loaded successfully!")