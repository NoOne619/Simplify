import logging
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from scraper_factory import ScraperFactory
from transformers import pipeline
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:8081", "*"],  # Wildcard for debugging
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize summarizer
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def chunk_text(text: str, max_chunk_size: int = 3000) -> List[str]:
    return [text[i:i + max_chunk_size] for i in range(0, len(text), max_chunk_size)]

def summarize_chunk(text: str, max_length: int = 100, min_length: int = 30) -> str:
    try:
        if not text.strip():
            return "No valid content."
        if len(text.split()) < 5:
            return "Too short to summarize."
        result = summarizer(text, max_length=max_length, min_length=min_length, do_sample=False)
        return result[0]["summary_text"]
    except Exception as e:
        return f"Error: {str(e)}"

def summarize_content(text: str, max_length: int = 100, min_length: int = 30) -> str:
    if not text or not text.strip():
        return "No valid content provided."
    if len(text) < 200:
        return summarize_chunk(text, max_length, min_length)
    chunks = chunk_text(text)
    with ThreadPoolExecutor(max_workers=min(6, len(chunks))) as executor:
        summaries = list(executor.map(lambda chunk: summarize_chunk(chunk, max_length, min_length), chunks))
    return " ".join(summaries)

def scrape_site(site: str, keyword: str, output: Dict):
    bot = None
    try:
        logger.info(f"Scraping {site} for keyword: {keyword} in thread: {threading.current_thread().name}")
        bot = ScraperFactory.create_scraper(site)
        bot.get_data(keyword)
        data = bot.data
        if isinstance(data, list):
            combined_text = " ".join(item.get("content", "") for item in data if isinstance(item, dict) and item.get("content"))
            sources = [
                {"url": item.get("url", ""), "title": item.get("title", item.get("content", "")[:50] + "..."), "website": site}
                for item in data if isinstance(item, dict) and item.get("url")
            ]
        else:
            combined_text = str(data)
            sources = []
        output[site] = {"content": combined_text, "sources": sources}
    except Exception as e:
        logger.error(f"Error scraping {site}: {str(e)}")
        output[site] = {"error": str(e), "sources": []}
    finally:
        if bot:
            bot.quit()

@app.get("/scrape-and-summarize")
async def scrape_and_summarize(
    keyword: str,
    sites: str = Query("medium", description="Comma-separated list of sites")
):
    logger.info(f"Received request for keyword: {keyword}, sites: {sites}")
    site_list = [s.strip().lower() for s in sites.split(",")]
    supported_sites = ["medium", "wix", "devto"]
    invalid_sites = [s for s in site_list if s not in supported_sites]
    if invalid_sites:
        logger.warning(f"Invalid sites requested: {invalid_sites}")
        return {
            "keyword": keyword,
            "results": {site: {"error": "Unsupported site", "sources": []} for site in invalid_sites}
        }

    scraped_data = {}
    # Scrape sites in parallel
    with ThreadPoolExecutor(max_workers=len(site_list)) as executor:
        futures = [executor.submit(scrape_site, site, keyword, scraped_data) for site in site_list]
        for future in futures:
            future.result()  # Wait for all threads to complete
    logger.info(f"Scraping completed for sites: {site_list}")

    summary_results = {}
    with ThreadPoolExecutor(max_workers=len(site_list)) as executor:
        futures = []
        for site, data in scraped_data.items():
            if "content" in data and data["content"].strip():
                summary_results[site] = {
                    "summary": summarize_content(data["content"]),
                    "sources": data.get("sources", [])
                }
            else:
                summary_results[site] = {
                    "error": data.get("error", "No valid content scraped"),
                    "sources": []
                }

    logger.info(f"Returning summary results for keyword: {keyword}")
    return {
        "keyword": keyword,
        "results": summary_results
    }