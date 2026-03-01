import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

/**
 * Extract readable text from an article or blog URL
 * @param {string} url - The URL of the blog or article
 * @returns {Promise<{text: string, title: string}>} - The extracted text and title
 */
export async function extractBlogText(url) {
  try {
    // Fetch the raw HTML of the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Parse the HTML using jsdom so Readability can use it
    const doc = new JSDOM(html, {
      url: url
    });

    // Use Readability to strip out ads, navigation, sidebars, etc.
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      // Fallback to basic cheerio extraction if Readability fails
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, noscript, iframe, nav, footer, header, aside').remove();

      const basicText = $('body').text().replace(/\s+/g, ' ').trim();
      const basicTitle = $('title').text() || 'Blog Post Notes';

      if (!basicText || basicText.length < 100) {
        throw new Error('Could not find enough readable content on this page.');
      }

      return {
        text: basicText,
        title: basicTitle
      };
    }

    // Clean up whitespace in the extracted text
    const cleanText = article.textContent.replace(/\s+/g, ' ').trim();

    return {
      text: cleanText,
      title: article.title || 'Blog Post Notes'
    };
  } catch (error) {
    console.error('Error extracting blog text:', error);
    throw new Error('Failed to extract readable content from this URL. The site might be blocking automatic access.');
  }
}
