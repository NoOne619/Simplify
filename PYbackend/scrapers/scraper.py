from abc import ABC, abstractmethod
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Chrome options
options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")


class WebScraper(webdriver.Chrome, ABC):
    """Abstract parent class for web scraping with Selenium."""
    def __init__(self):
        super().__init__(service=Service(ChromeDriverManager().install()), options=options)
        self.data = []

    @abstractmethod
    def get_links(self, keyword):
        """Abstract method to get blog links for a given keyword."""
        pass

    @abstractmethod
    def get_data(self, keyword):
        """Abstract method to collect data for a given keyword."""
        pass