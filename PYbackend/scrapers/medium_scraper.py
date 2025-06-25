import time
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from scraper import WebScraper

class MediumScraper(WebScraper):
    """Scraper for Medium.com."""
    def get_links(self, keyword):
        self.get(f"https://medium.com/search?q={keyword}")
        self.maximize_window()
        time.sleep(5)

        blogs = []
        previous_count = 0

        while len(blogs) < 10:
            self.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)

            try:
                show_more_button = self.find_element(By.XPATH, "//button[text()='Show more']")
                self.execute_script("arguments[0].scrollIntoView(true);", show_more_button)
                show_more_button.click()
                time.sleep(10)
            except NoSuchElementException:
                break

            links = self.find_elements(by=By.CSS_SELECTOR, value="div[data-href^='https://medium.com/']")
            for link in links:
                try:
                    link.find_element(by=By.CSS_SELECTOR, value="button[aria-label='Member-only story']")
                except NoSuchElementException:
                    blog_url = link.get_attribute("data-href")
                    if blog_url and blog_url not in blogs:
                        blogs.append(blog_url)

            if len(blogs) == previous_count:
                break
            previous_count = len(blogs)

        return blogs[:1]

    def get_data(self, keyword):
        # Reset self.data to ensure fresh results
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
                paragraphs = self.find_elements(By.CSS_SELECTOR, "[data-selectable-paragraph]")
                for paragraph in paragraphs:
                    article["content"] += paragraph.text + " "
                self.data.append(article)
            except Exception as e:
                self.data.append({"url": blog, "content": f"Error: {str(e)}"})

        # If no data was collected, indicate that
        if not self.data:
            self.data = [{"message": "No data found for this keyword"}]