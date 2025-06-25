import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

import logging
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "*"],  # Allow frontend and wildcard for debugging
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Explicitly allow OPTIONS
    allow_headers=["*"],
)
# Load environment variables
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    logger.error("GROQ_API_KEY not found in .env file")
    raise RuntimeError("GROQ_API_KEY not found")

# Define request models
class SummariesRequest(BaseModel):
    summaries: List[str]

class QueryRequest(BaseModel):
    query: str

# Define response model
class QueryResponse(BaseModel):
    answer: str
    context: List[dict]  # Simplified context with summary content

# Global variables for RAG pipeline
embeddings = None
vector_store = None
retrieval_chain = None

@app.on_event("startup")
async def startup_event():
    global embeddings
    try:
        logger.info("Initializing embeddings...")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            encode_kwargs={'normalize_embeddings': True}
        )
        logger.info("Embeddings initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize embeddings: {e}")
        raise RuntimeError(f"Initialization failed: {e}")

@app.post("/summaries")
async def store_summaries(request: SummariesRequest):
    global vector_store, retrieval_chain
    try:
        logger.info(f"Received {len(request.summaries)} summaries")
        # Convert summaries to LangChain Documents
        documents = [
            Document(
                page_content=summary,
                metadata={"index": i}  # Minimal metadata to identify chunks
            )
            for i, summary in enumerate(request.summaries)
        ]
        
        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        final_docs = text_splitter.split_documents(documents)
        
        # Create or update FAISS vector store
        vector_store = FAISS.from_documents(final_docs, embeddings)
        
        # Initialize LLM
        llm = ChatGroq(model="gemma2-9b-it", api_key=groq_api_key, temperature=0.1, max_tokens=1000)
        
        # Define prompt template
        prompt = ChatPromptTemplate.from_template(
            """
            Answer the question based on the provided context only, which consists of user-generated summaries.
            Provide the most accurate response based on the question.
            Context: {context}
            Question: {input}
            Answer:
            """
        )
        
        # Create chains
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = vector_store.as_retriever()
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        
        logger.info("Summaries processed and vector store updated")
        return {"message": f"Successfully stored {len(request.summaries)} summaries"}
    except Exception as e:
        logger.error(f"Error processing summaries: {e}")
        if "Invalid token" in str(e) or "Invalid signature" in str(e):
            raise HTTPException(status_code=401, detail="Session expired, please log in again")
        raise HTTPException(status_code=500, detail=f"Error processing summaries: {e}")

@app.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    if not retrieval_chain:
        logger.error("RAG pipeline not initialized. Please store summaries first.")
        raise HTTPException(status_code=400, detail="No summaries stored. Please use /summaries endpoint first.")
    
    try:
        logger.info(f"Processing query: {request.query}")
        response = retrieval_chain.invoke({"input": request.query})
        # Simplify context for API response
        context = [
            {
                "content": doc.page_content[:600],
                "metadata": {"index": doc.metadata.get("index")}
            }
            for doc in response["context"]
        ]
        logger.info(f"Query processed successfully")
        return QueryResponse(answer=response["answer"], context=context)
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        if "Invalid token" in str(e) or "Invalid signature" in str(e):
            raise HTTPException(status_code=401, detail="Session expired, please log in again")
        raise HTTPException(status_code=500, detail=f"Error processing query: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)