import time
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from scraper import WebScraper

class WixScraper(WebScraper):
    """Scraper for Wix Blog."""
    
    def get_links(self, keyword):
        self.get(f"https://www.wix.com/blog/search-results?q={keyword}")
        self.maximize_window()
        time.sleep(5)

        blogs = []

        try:
            link_elements = self.find_elements(By.CSS_SELECTOR, "a[data-hook='item-title']")
            for link in link_elements:
                href = link.get_attribute("href")
                if href and href not in blogs:
                    blogs.append(href)
                if len(blogs) >= 10:
                    break
        except Exception as e:
            print("❌ Failed to get Wix links:", str(e))

        return blogs[:1]  # return only first blog like MediumScraper

    def get_data(self, keyword):
        self.data = []

        try:
            blogs = self.get_links(keyword)
        except Exception as e:
            self.data = [{"error": f"Failed to get links: {str(e)}"}]
            return

        for blog in blogs:
            article = {"url": blog, "content": ""}
            try:
                self.get(blog)
                time.sleep(5)

                paragraphs = self.find_elements(By.CSS_SELECTOR, "div.blog-post-content p")
                for p in paragraphs:
                    article["content"] += p.text + " "

                if not article["content"].strip():
                    article["content"] = "No content found in blog-post-content"

                self.data.append(article)
            except Exception as e:
                self.data.append({"url": blog, "content": f"Error: {str(e)}"})

        if not self.data:
            self.data = [{"message": "No data found for this keyword"}]
