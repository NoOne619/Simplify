from scraper import WebScraper
from medium_scraper import MediumScraper
from wix_scraper import WixScraper
from devto_scraper import DevtoScraper

class ScraperFactory:
    """Factory class to create scraper instances based on site name."""
    _scrapers = {
        "medium": MediumScraper,
        "wix": WixScraper,
        "devto": DevtoScraper,
    }

    @staticmethod
    def create_scraper(site: str) -> WebScraper:
        """Create a scraper instance for the given site."""
        site = site.lower()
        scraper_class = ScraperFactory._scrapers.get(site)
        if scraper_class is None:
            raise ValueError(f"Unsupported site: {site}. Supported sites: {list(ScraperFactory._scrapers.keys())}")
        return scraper_class()  # No path argument