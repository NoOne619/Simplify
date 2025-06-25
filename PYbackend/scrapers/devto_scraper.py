import time
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from scraper import WebScraper

class DevtoScraper(WebScraper):
    """Scraper for dev.to."""
    
    def get_links(self, keyword):
        """Get the first 5 article URLs from dev.to search results."""
        self.get(f"https://dev.to/search?q={keyword}")
        time.sleep(5)  # Wait for page to load

        blogs = []
        try:
            # Find all <h3> elements with class "crayons-story__title"
            h3_elements = self.find_elements(By.CLASS_NAME, "crayons-story__title")
            for h3 in h3_elements[:5]:  # Limit to first 5
                try:
                    link = h3.find_element(By.TAG_NAME, "a").get_attribute("href")
                    if link and link not in blogs:
                        blogs.append(link)
                except NoSuchElementException:
                    continue  # Skip if no <a> tag found
        except Exception as e:
            return [{"error": f"Failed to get links: {str(e)}"}]

        return blogs[:1]  # Return up to 5 links

    def get_data(self, keyword):
        """Collect data from the first 5 articles for a given keyword."""
        self.data = []  # Reset self.data
        
        try:
            blogs = self.get_links(keyword)
            if not blogs:
                self.data = [{"url": "", "content": "No links found for this keyword"}]
                return
        except Exception as e:
            self.data = [{"url": "", "content": f"Failed to get links: {str(e)}"}]
            return

        for blog in blogs:
            article = {"url": blog, "content": ""}
            try:
                self.get(blog)
                time.sleep(5)  # Wait for article to load
                
                # Extract content from #article-body
                article_body = self.find_element(By.ID, "article-body")
                tags_to_extract = ["p", "h1", "h2", "h3", "a"]
                combined_text = []

                for tag_name in tags_to_extract:
                    elements = article_body.find_elements(By.TAG_NAME, tag_name)
                    for element in elements:
                        text = element.text.strip()
                        if text:
                            if tag_name == "a":
                                href = element.get_attribute("href")
                                combined_text.append(f"{text} ({href})")
                            else:
                                combined_text.append(text)

                if combined_text:
                    article["content"] = " ".join(combined_text)
                else:
                    article["content"] = "No content found in article-body"

                self.data.append(article)
            except NoSuchElementException:
                self.data.append({"url": blog, "content": "No div with id='article-body' found"})
            except Exception as e:
                self.data.append({"url": blog, "content": f"Error: {str(e)}"})

        # If no data collected, add a placeholder
        if not self.data:
            self.data = [{"url": "", "content": "No data found for this keyword"}]