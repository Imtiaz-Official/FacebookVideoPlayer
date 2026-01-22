import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

// Use stealth plugin to avoid bot detection
puppeteer.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const YTDLP_PATH = process.env.YTDLP_PATH || '/tmp/yt-dlp';

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Cookie storage files
const COOKIES_FILE = path.join(__dirname, 'facebook-cookies.json');
const CREDENTIALS_FILE = path.join(__dirname, 'facebook-credentials.json');
const COOKIES_TXT_FILE = path.join(__dirname, 'facebook-cookies.txt'); // Netscape format for yt-dlp

// Cache for video URLs (to avoid re-scraping)
const videoCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ⚡ OPTIMIZATION: Browser pool for reusing Puppeteer instances
let browserPool = [];
const MAX_BROWSERS = 2; // Keep 2 browsers warm
let lastBrowserUse = Date.now();
const BROWSER_IDLE_TIMEOUT = 5 * 60 * 1000; // Close after 5 minutes idle

// Auth state
let isAuthenticated = false;
let savedCookies = null;

/**
 * Load cookies from file
 */
async function loadCookies() {
  try {
    const data = await fs.readFile(COOKIES_FILE, 'utf-8');
    const cookies = JSON.parse(data);
    console.log('[Auth] Cookies loaded from file');
    return cookies;
  } catch {
    return null;
  }
}

/**
 * ⚡ OPTIMIZATION: Get or create a browser instance from the pool
 */
async function getBrowser() {
  lastBrowserUse = Date.now();

  // Try to get an available browser from pool
  if (browserPool.length > 0) {
    const browser = browserPool.pop();
    // Check if browser is still connected and has pages
    if (browser && browser.isConnected()) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          console.log('[Browser Pool] Reusing browser from pool');
          return { browser, fromPool: true };
        }
      } catch (error) {
        console.log('[Browser Pool] Browser from pool is invalid, creating new one');
        try {
          await browser.close();
        } catch {}
      }
    }
  }

  // Create a new browser
  console.log('[Browser Pool] Creating new browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // Faster startup
    ]
  });

  return { browser, fromPool: false };
}

/**
 * ⚡ OPTIMIZATION: Return browser to pool or close it
 */
async function releaseBrowser(browser, fromPool = false) {
  if (!browser) return;

  try {
    // Close all pages except the default about:blank page
    const pages = await browser.pages();
    for (const page of pages) {
      try {
        if (page.url() !== 'about:blank') {
          await page.close();
        }
      } catch {}
    }

    // If pool is not full and browser is still connected, return to pool
    if (browserPool.length < MAX_BROWSERS && browser.isConnected()) {
      browserPool.push(browser);
      console.log(`[Browser Pool] Browser returned to pool (${browserPool.length}/${MAX_BROWSERS})`);
    } else {
      await browser.close();
      console.log('[Browser Pool] Browser closed (pool full or disconnected)');
    }
  } catch (error) {
    console.log('[Browser Pool] Error releasing browser:', error.message);
    try {
      await browser.close();
    } catch {}
  }
}

/**
 * ⚡ OPTIMIZATION: Cleanup idle browsers
 */
setInterval(async () => {
  const now = Date.now();
  if (browserPool.length > 0 && (now - lastBrowserUse) > BROWSER_IDLE_TIMEOUT) {
    console.log('[Browser Pool] Closing idle browsers...');
    for (const browser of browserPool) {
      try {
        await browser.close();
      } catch {}
    }
    browserPool = [];
    console.log('[Browser Pool] All idle browsers closed');
  }
}, 60000); // Check every minute

/**
 * Save cookies to file
 */
async function saveCookies(cookies) {
  await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));
  console.log('[Auth] Cookies saved to file');
}

/**
 * Save credentials to file
 */
async function saveCredentials(email, password) {
  await fs.writeFile(CREDENTIALS_FILE, JSON.stringify({ email, password }, null, 2));
  console.log('[Auth] Credentials saved to file');
}

/**
 * Export cookies to Netscape format for yt-dlp
 * Format: https://github.com/yt-dlp/yt-dlp/wiki#cookie-authorization
 */
async function exportCookiesToNetscape(cookies) {
  try {
    // Netscape cookie file header
    let netscapeCookies = '# Netscape HTTP Cookie File\n';
    netscapeCookies += '# This file is generated by facebook-video-player\n';
    netscapeCookies += '# Edit at your own risk\n\n';

    for (const cookie of cookies) {
      // Filter relevant cookies for Facebook
      if (cookie.domain && (cookie.domain.includes('facebook') || cookie.domain.includes('fb'))) {
        // Netscape format:
        // domain \t flag \t path \t secure \t expiration \t name \t value
        const domain = cookie.domain.startsWith('.') ? cookie.domain : '.' + cookie.domain;
        const flag = cookie.domain.startsWith('.') ? 'TRUE' : 'FALSE';
        const path = cookie.path || '/';
        const secure = cookie.secure ? 'TRUE' : 'FALSE';
        const expiration = cookie.expires || Math.floor(Date.now() / 1000) + 3600;
        const name = cookie.name;
        const value = cookie.value || '';

        netscapeCookies += `${domain}\t${flag}\t${path}\t${secure}\t${expiration}\t${name}\t${value}\n`;
      }
    }

    await fs.writeFile(COOKIES_TXT_FILE, netscapeCookies);
    console.log('[Auth] Cookies exported to Netscape format for yt-dlp');
    return true;
  } catch (error) {
    console.error('[Auth] Error exporting cookies to Netscape format:', error.message);
    return false;
  }
}

/**
 * Apply cookies to page
 */
async function applyCookies(page, cookies) {
  for (const cookie of cookies) {
    await page.setCookie(cookie);
  }
}

/**
 * Login to Facebook with credentials
 * Based on research from GitHub: zoutepopcorn/pup-face, JackOHara/puppeteer-login-for-facebook
 * Using puppeteer-extra-plugin-stealth to avoid bot detection
 */
async function loginToFacebook(email, password) {
  let browser = null;

  try {
    console.log('[Auth] Logging in to Facebook...');

    // Launch browser with stealth plugin (applied globally)
    // Minimal args - too many flags can trigger detection
    browser = await puppeteer.launch({
      headless: false, // Show browser for manual captcha/2FA handling
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ]
    });

    const page = await browser.newPage();

    // Go to Facebook homepage (not /login - let Facebook redirect naturally)
    console.log('[Auth] Navigating to Facebook...');
    await page.goto('https://www.facebook.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for email input (Facebook may auto-redirect to login page)
    await page.waitForSelector('#email', { timeout: 10000 });

    // Enter credentials with human-like typing
    console.log('[Auth] Entering credentials...');
    await page.type('#email', email, { delay: 50 });
    await page.type('#pass', password, { delay: 50 });

    // Wait a moment (human-like pause)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Click login button - simple approach like zoutepopcorn/pup-face
    console.log('[Auth] Clicking login button...');
    await page.click('#loginbutton');

    // Wait for navigation - Facebook may navigate to different pages
    console.log('[Auth] Waiting for navigation...');

    // Wait up to 30 seconds for navigation (allows time for captcha/2FA)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
      .catch(() => console.log('[Auth] Navigation timeout or no navigation needed'));

    // Check current state
    let currentUrl = page.url();
    console.log(`[Auth] Current URL: ${currentUrl}`);

    // If still on login page, wait for manual intervention (captcha/2FA)
    if (currentUrl.includes('login')) {
      console.log('[Auth] Still on login page. Please complete captcha or 2FA manually.');
      console.log('[Auth] Waiting for login to complete (up to 2 minutes)...');

      // Poll for successful login
      for (let i = 0; i < 24; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const cookies = await page.cookies();
        const cUser = cookies.find(c => c.name === 'c_user');

        if (cUser) {
          console.log('[Auth] Login successful! Found c_user cookie.');
          break;
        }

        // Check if URL changed
        currentUrl = page.url();
        if (!currentUrl.includes('login')) {
          console.log(`[Auth] Navigation detected to: ${currentUrl}`);
          break;
        }

        console.log(`[Auth] Waiting... (${(i + 1) * 5}s)`);
      }
    }

    // Handle 2FA specifically
    currentUrl = page.url();
    if (currentUrl.includes('two_step_verification')) {
      console.log('[Auth] 2FA page detected! Please complete the verification.');
      console.log('[Auth] Waiting for 2FA completion (up to 2 minutes)...');

      for (let i = 0; i < 24; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const cookies = await page.cookies();
        const cUser = cookies.find(c => c.name === 'c_user');

        if (cUser) {
          console.log('[Auth] 2FA completed!');
          break;
        }

        currentUrl = page.url();
        if (!currentUrl.includes('two_step_verification')) {
          console.log(`[Auth] Moved to: ${currentUrl}`);
          break;
        }

        console.log(`[Auth] Waiting for 2FA... (${(i + 1) * 5}s)`);
      }
    }

    // Handle security checkpoint
    currentUrl = page.url();
    if (currentUrl.includes('checkpoint')) {
      console.log('[Auth] Security checkpoint detected. Please complete verification.');
      console.log('[Auth] Waiting for checkpoint completion (up to 2 minutes)...');

      for (let i = 0; i < 24; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const cookies = await page.cookies();
        const cUser = cookies.find(c => c.name === 'c_user');

        if (cUser) {
          console.log('[Auth] Checkpoint completed!');
          break;
        }

        currentUrl = page.url();
        if (!currentUrl.includes('checkpoint')) {
          console.log(`[Auth] Moved to: ${currentUrl}`);
          break;
        }

        console.log(`[Auth] Waiting for checkpoint... (${(i + 1) * 5}s)`);
      }
    }

    // Final verification
    const cookies = await page.cookies();
    const cUser = cookies.find(c => c.name === 'c_user');

    if (!cUser) {
      currentUrl = page.url();
      throw new Error(`Login failed. Current page: ${currentUrl}. Please check credentials or try Manual Login.`);
    }

    await browser.close();

    // Save cookies and update state
    await saveCookies(cookies);
    isAuthenticated = true;
    savedCookies = cookies;

    // Export cookies to Netscape format for yt-dlp
    await exportCookiesToNetscape(cookies);

    // Save credentials for future auto-login
    await saveCredentials(email, password);

    console.log('[Auth] Login successful!');
    return { success: true, message: 'Login successful' };

  } catch (error) {
    console.error('[Auth] Login error:', error.message);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

/**
 * Manual login - opens browser for user to login manually
 * Uses puppeteer-extra-plugin-stealth for better compatibility
 */
async function manualLogin() {
  let browser = null;

  try {
    console.log('[Auth] Starting manual login flow...');
    console.log('[Auth] Browser will open. Please log in to Facebook manually.');

    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ]
    });

    const page = await browser.newPage();

    // Navigate to Facebook homepage
    await page.goto('https://www.facebook.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('[Auth] Waiting for you to complete login (up to 2 minutes)...');
    console.log('[Auth] The browser will close automatically after successful login.');

    // Poll for c_user cookie (indicates login)
    for (let i = 0; i < 24; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const cookies = await page.cookies();
      const cUser = cookies.find(c => c.name === 'c_user');

      if (cUser) {
        console.log('[Auth] Login detected! Saving cookies...');

        // Save cookies
        await saveCookies(cookies);
        isAuthenticated = true;
        savedCookies = cookies;

        // Export cookies to Netscape format for yt-dlp
        await exportCookiesToNetscape(cookies);

        await browser.close();
        return { success: true, message: 'Manual login successful' };
      }

      console.log(`[Auth] Waiting for login... (${(i + 1) * 5}s)`);
    }

    await browser.close();
    throw new Error('Login timeout. Please try again.');

  } catch (error) {
    console.error('[Auth] Manual login error:', error.message);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

/**
 * Clean Facebook video title - remove views, reactions, hashtags, mentions
 * @param {string} rawTitle - The raw title from yt-dlp or Puppeteer
 */
function cleanFacebookTitle(rawTitle) {
  if (!rawTitle) return 'Facebook Video';
  
  let title = rawTitle;
  
  // Remove view counts (e.g., "2.6M views", "1K views", "100 views")
  title = title.replace(/\d+(\.\d+)?[KMB]?\s+views?/gi, '').trim();
  
  // Remove reaction counts (e.g., "77K reactions", "1.2M reactions")
  title = title.replace(/\d+(\.\d+)?[KMB]?\s+reactions?/gi, '').trim();
  
  // Remove middle dot (·) separators and view/reaction counts after them
  // Pattern: "text · 123K views" -> "text"
  title = title.replace(/\s*[··]\s*\d+(\.\d+)?[KMB]?\s+views?/gi, '').trim();
  title = title.replace(/\s*[··]\s*\d+(\.\d+)?[KMB]?\s+reactions?/gi, '').trim();
  
  // Clean up whitespace
  title = title.replace(/\s+/g, ' ').trim();
  
  // If title is too short or empty after cleaning, return a default
  if (title.length < 3) {
    return 'Facebook Video';
  }
  
  return title;
}

/**
 * Extract video title using yt-dlp
 * yt-dlp is more reliable at extracting Facebook video titles than Puppeteer scraping
 * @param {string} facebookUrl - The Facebook video URL
 * @param {boolean} useAuth - Whether to use cookies for authentication
 */
async function extractTitleWithYtDlp(facebookUrl, useAuth = false) {
  return new Promise((resolve) => {
    try {
      console.log(`[Title] Using yt-dlp to extract title (auth: ${useAuth})...`);

      // Build yt-dlp arguments
      const args = [
        '--print', 'title',
        '--no-warnings',
        '--quiet',
      ];

      // Add cookies if auth is enabled
      if (useAuth) {
        args.push('--cookies', COOKIES_TXT_FILE);
      }

      args.push(facebookUrl);

      // Try yt-dlp
      const ytDlp = spawn(YTDLP_PATH, args);

      let output = '';
      let stderrOutput = '';

      ytDlp.stdout.on('data', (data) => {
        output += data.toString();
      });

      ytDlp.stderr.on('data', (data) => {
        stderrOutput += data.toString();
      });

      ytDlp.on('close', (code) => {
        const rawTitle = output.trim();

        if (code === 0 && rawTitle && rawTitle.length > 5) {
          // Clean the title before returning
          const cleanTitle = cleanFacebookTitle(rawTitle);
          console.log(`[Title] yt-dlp extracted title: ${rawTitle.substring(0, 60)}...`);
          console.log(`[Title] Cleaned title: ${cleanTitle}`);
          resolve(cleanTitle);
        } else {
          console.log(`[Title] yt-dlp failed (code ${code}), will use Puppeteer fallback`);
          if (stderrOutput.includes('cookies') || stderrOutput.includes('login')) {
            console.log(`[Title] Hint: yt-dlp reported authentication issues`);
          }
          resolve(null);
        }
      });

      // Timeout after 30 seconds (increased for network delays)
      setTimeout(() => {
        ytDlp.kill();
        console.log('[Title] yt-dlp timeout, using Puppeteer fallback');
        resolve(null);
      }, 30000);

    } catch (error) {
      console.log('[Title] yt-dlp error, using Puppeteer fallback:', error.message);
      resolve(null);
    }
  });
}

/**
 * Extract video URLs using yt-dlp directly
 * This is the most reliable method for Facebook videos, especially for private content
 * @param {string} facebookUrl - The Facebook video URL
 * @param {boolean} useAuth - Whether to use cookies for authentication
 */
async function extractVideoWithYtDlp(facebookUrl, useAuth = false) {
  return new Promise((resolve) => {
    try {
      console.log(`[YtDlp] Extracting video with yt-dlp (auth: ${useAuth})...`);

      // Build yt-dlp arguments with enhanced flags for private content
      const args = [
        '--print', 'url',
        '--no-warnings',
        '--quiet',
        '--format', 'best',
        '--no-check-certificates', // Bypass SSL certificate issues
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--extractor-args', 'facebook:player_location=feed', // Try feed location first
      ];

      // Additional args for private groups
      if (useAuth) {
        args.push('--cookies', COOKIES_TXT_FILE);
        args.push('--ignore-errors'); // Continue on download errors
        args.push('--no-abort-on-error'); // Don't abort on errors
      }

      args.push(facebookUrl);

      // Try yt-dlp
      const ytDlp = spawn(YTDLP_PATH, args);

      let output = '';
      let stderrOutput = '';

      ytDlp.stdout.on('data', (data) => {
        output += data.toString();
      });

      ytDlp.stderr.on('data', (data) => {
        stderrOutput += data.toString();
      });

      ytDlp.on('close', (code) => {
        const urls = output.trim().split('\n').filter(u => u.length > 50);

        if (code === 0 && urls.length > 0) {
          console.log(`[YtDlp] Successfully extracted ${urls.length} video URL(s)`);
          urls.forEach(url => {
            console.log(`[YtDlp] - ${url.substring(0, 80)}...`);
          });
          // Return array of video URLs
          resolve(urls);
        } else {
          console.log(`[YtDlp] Failed to extract video URL (code ${code})`);
          if (stderrOutput.includes('cookies') || stderrOutput.includes('login')) {
            console.log(`[YtDlp] Hint: Authentication may be required`);
          }
          resolve(null);
        }
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        ytDlp.kill();
        console.log('[YtDlp] Timeout');
        resolve(null);
      }, 60000);

    } catch (error) {
      console.log('[YtDlp] Error:', error.message);
      resolve(null);
    }
  });
}

/**
 * Extract video URL from Facebook page (with optional auth)
 * ⚡ OPTIMIZED: Uses browser pool and reduced wait times
 */
async function extractFacebookVideoUrl(facebookUrl, useAuth = false) {
  let browser = null;
  let fromPool = false;

  try {
    console.log(`[Scraper] Starting extraction for: ${facebookUrl}`);
    console.log(`[Scraper] Auth mode: ${useAuth ? 'ENABLED' : 'DISABLED'}`);

    // Check if this is a private group URL
    const isPrivateGroup = /facebook\.com\/groups\//.test(facebookUrl) ||
                            /facebook\.com\/watch\/\?v=/.test(facebookUrl);
    // Check if this is a reel
    const isReel = facebookUrl.includes('/reel/') || facebookUrl.includes('/reels/');
    console.log(`[Scraper] Is private group: ${isPrivateGroup}`);
    console.log(`[Scraper] Is reel: ${isReel}`);

    // IMPORTANT: Try yt-dlp FIRST (always) - it's faster and more reliable
    // yt-dlp works even without auth for public videos
    console.log('[Scraper] Trying yt-dlp extraction first (fastest method)...');
    const ytDlpUrls = await extractVideoWithYtDlp(facebookUrl, useAuth);

    if (ytDlpUrls && ytDlpUrls.length > 0) {
      // yt-dlp succeeded! Return the URLs directly
      console.log('[Scraper] yt-dlp extraction successful! Skipping Puppeteer scraping.');
      const title = await extractTitleWithYtDlp(facebookUrl, useAuth) || 'Facebook Video';
      
      return {
        success: true,
        title: title,
        thumbnails: [],
        formats: ytDlpUrls.map((url, index) => ({
          formatId: index,
          quality: index === 0 ? 'HD' : 'SD',
          label: index === 0 ? 'HD' : 'SD',
          url: url.trim(),
          type: 'video/mp4'
        }))
      };
    }
    console.log('[Scraper] yt-dlp extraction failed, falling back to Puppeteer...');

    // ⚡ OPTIMIZATION: Get browser from pool instead of creating new one
    // DISABLED: Browser pooling causing detachment issues, using fresh browser each time
    const browserInfo = { browser: null, fromPool: false };
    
    console.log('[Browser] Creating fresh browser...');
    browserInfo.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ]
    });
    
    browser = browserInfo.browser;
    fromPool = browserInfo.fromPool;

    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Hide webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // Apply cookies if using auth
    if (useAuth && savedCookies) {
      await applyCookies(page, savedCookies);
      console.log('[Scraper] Applied saved cookies');
    }

    // Collect ALL URLs from network - be very aggressive
    const allRequestUrls = new Set();

    // ⚡ OPTIMIZATION: Combined request interception (block resources + capture video URLs)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      const resourceType = req.resourceType();
      
      // Capture ALL fbcdn.net URLs that are .mp4 or video
      if (url.includes('fbcdn') && (url.includes('.mp4') || url.includes('video'))) {
        allRequestUrls.add(url);
        console.log(`[Scraper] FB video Request: ${url.substring(0, 100)}...`);
      }
      
      // Block images, fonts, and stylesheets to speed up loading
      if (['image', 'stylesheet', 'font'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Intercept responses - be VERY aggressive
    page.on('response', async (response) => {
      const url = response.url();

      // Capture fbcdn responses - especially .mp4 files
      if (url.includes('fbcdn') && (url.includes('.mp4') || url.includes('video'))) {
        const status = response.status();
        console.log(`[Scraper] FB video Response [${status}]: ${url.substring(0, 100)}...`);

        // Add to our collection - these are video URLs
        allRequestUrls.add(url);
      }

      // Also check JSON responses for video URLs (simplified)
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('json')) {
          const body = await response.text().catch(() => '');
          if (body && body.length < 500000) {
            const mp4Matches = body.match(/https?:\/\/[^"'\\\s<>]+\.mp4[^"'\\\s<>]*/gi) || [];
            mp4Matches.forEach(u => allRequestUrls.add(u.replace(/\\\/\//g, '/')));
          }
        }
      } catch {}
    });

    console.log(`[Scraper] Navigating to page...`);
    // ⚡ OPTIMIZATION: Use 'domcontentloaded' for faster initial load, then wait for network
    await page.goto(facebookUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // ⚡ OPTIMIZATION: Balanced wait times (faster than before but reliable)
    let waitTime = 3000; // Increased from 2s (more reliable)
    if (isPrivateGroup) waitTime = 10000; // Increased from 8s
    else if (isReel) waitTime = 12000; // Increased from 10s
    console.log(`[Scraper] Waiting ${waitTime}ms for content to load...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Try to interact and trigger video loading
    // Private groups need more aggressive interaction
    try {
      await page.evaluate((isPrivateGroup) => {
        // Simplified interaction - just try to play the video
        document.querySelectorAll('video').forEach(el => {
          try {
            el.muted = true;
            el.currentTime = 0.1;
            el.play().catch(() => {});
          } catch {}
        });
      }, isPrivateGroup);

      // ⚡ OPTIMIZATION: Balanced interaction wait time
      const interactionWait = isPrivateGroup ? 12000 : 8000; // Increased slightly for reliability
      console.log(`[Scraper] Waiting ${interactionWait}ms for video request after interaction...`);
      await new Promise(resolve => setTimeout(resolve, interactionWait));
    } catch (e) {
      console.log(`[Scraper] Interaction error: ${e.message}`);
    }

    // ⚡ OPTIMIZATION: Balanced additional wait times
    if (isPrivateGroup) {
      console.log(`[Scraper] Private group detected, waiting 6s more for video URL...`);
      await new Promise(resolve => setTimeout(resolve, 6000));
    } else if (isReel) {
      console.log(`[Scraper] Reel detected, waiting 5s more for video URL...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Try to extract title using yt-dlp first (more reliable)
    console.log('[Scraper] Attempting title extraction with yt-dlp...');
    let pageTitle = await extractTitleWithYtDlp(facebookUrl, useAuth);

    // If yt-dlp failed, fall back to Puppeteer scraping
    if (!pageTitle) {
      console.log('[Scraper] yt-dlp title extraction failed, using Puppeteer fallback...');
    }

    // Extract video URLs from page
    const pageContent = await page.evaluate(() => {
      // Try to get video title from various sources
      // Method 1: og:title (most reliable)
      const ogTitle = document.querySelector('meta[property="og:title"]')?.content;

      // Method 2: twitter:title
      const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.content;

      // Method 3: title tag
      const titleTag = document.title;

      // Method 4: h1 with specific classes (for reels)
      const h1Title = document.querySelector('h1 span')?.textContent ||
                      document.querySelector('h1')?.textContent ||
                      document.querySelector('[role="heading"]')?.textContent;

      // Method 5: Story title for reels - get aria-label from various elements
      const storyTitle = document.querySelector('[data-visualcompletion="root"]')?.getAttribute('aria-label') ||
                          document.querySelector('[role="article"]')?.getAttribute('aria-label') ||
                          document.querySelector('[role="main"]')?.getAttribute('aria-label');

      // Method 6: Try to find the actual video caption/text
      const videoCaption = document.querySelector('[data-visualcompletion="root"] div[dir="auto"]')?.textContent ||
                          document.querySelector('span[class*="text"]')?.textContent ||
                          document.querySelector('[data-visualcompletion="root"] span[dir="auto"]')?.textContent;

      // Method 7: Description meta tag
      const description = document.querySelector('meta[name="description"]')?.content;

      return {
        ogTitle,
        twitterTitle,
        titleTag,
        h1Title,
        storyTitle,
        videoCaption,
        description
      };
    });

    // Determine best title with better filtering
    // Only use Puppeteer fallback if yt-dlp didn't find a title
    if (!pageTitle) {
      // Improved detection for view counts and reactions
      const hasViewCount = (text) => {
        if (!text) return false;
        const t = text.trim();
        // Match patterns like:
        // "100K views", "50K views · caption", "caption · 100K views"
        // "10K reactions", "1K reactions · caption"
        // "1M views", "500K views"
        return /\d+K\s*(views|reactions|M|K)/i.test(t) ||
               /^\d+\.?\d*[KMB]\s*(views|reactions)/i.test(t) ||
               /^(watch|facebook|log in|sign up)/i.test(t);
      };

      const hasGenericText = (text) => text && /^(Watch|on Facebook|Facebook|Log in|Sign up)\s/i.test(text.trim());
      const isTooGeneric = (text) => text && text.length < 10;
      const isNumericOrSymbols = (text) => text && /^[\d\s·\-|]+$/.test(text.trim());

      // Priority order for title selection
      if (pageContent.ogTitle && !hasViewCount(pageContent.ogTitle) && !hasGenericText(pageContent.ogTitle) && !isTooGeneric(pageContent.ogTitle) && !isNumericOrSymbols(pageContent.ogTitle)) {
        pageTitle = pageContent.ogTitle;
      } else if (pageContent.twitterTitle && !hasViewCount(pageContent.twitterTitle) && !hasGenericText(pageContent.twitterTitle) && !isTooGeneric(pageContent.twitterTitle) && !isNumericOrSymbols(pageContent.twitterTitle)) {
        pageTitle = pageContent.twitterTitle;
      } else if (pageContent.h1Title && !hasViewCount(pageContent.h1Title) && !hasGenericText(pageContent.h1Title) && !isTooGeneric(pageContent.h1Title) && !isNumericOrSymbols(pageContent.h1Title)) {
        pageTitle = pageContent.h1Title;
      } else if (pageContent.videoCaption && pageContent.videoCaption.length > 15 && pageContent.videoCaption.length < 300 && !hasViewCount(pageContent.videoCaption) && !isNumericOrSymbols(pageContent.videoCaption)) {
        pageTitle = pageContent.videoCaption;
      } else if (pageContent.description && pageContent.description.length > 15 && pageContent.description.length < 300 && !hasGenericText(pageContent.description) && !isNumericOrSymbols(pageContent.description)) {
        pageTitle = pageContent.description;
      } else if (pageContent.storyTitle && !hasViewCount(pageContent.storyTitle) && !hasGenericText(pageContent.storyTitle) && !isTooGeneric(pageContent.storyTitle) && !isNumericOrSymbols(pageContent.storyTitle)) {
        pageTitle = pageContent.storyTitle;
      } else if (pageContent.titleTag && pageContent.titleTag.includes('-')) {
        const parts = pageContent.titleTag.split('-');
        const extracted = parts[0].trim();
        if (!hasViewCount(extracted) && !hasGenericText(extracted) && extracted.length > 5 && !isNumericOrSymbols(extracted)) {
          pageTitle = extracted;
        }
      }

      // Clean up title using the unified cleaning function
      if (pageTitle) {
        pageTitle = cleanFacebookTitle(pageTitle);
      }

      // If title is still too short or empty, use default
      if (!pageTitle || pageTitle.length < 5 || hasViewCount(pageTitle) || hasGenericText(pageTitle) || isNumericOrSymbols(pageTitle)) {
        pageTitle = 'Facebook Video';
      }
    } else {
      // yt-dlp found a title - it's already cleaned in extractTitleWithYtDlp
      // But apply one more pass just in case
      pageTitle = cleanFacebookTitle(pageTitle);

      // If after cleaning the title is too short, use default
      if (pageTitle.length < 5) {
        pageTitle = 'Facebook Video';
      }
    }

    console.log(`[Scraper] Extracted title: ${pageTitle}`);

    const videoData = await page.evaluate(() => {
      const results = [];

      // Check video elements
      document.querySelectorAll('video').forEach(video => {
        const src = video.getAttribute('src');
        if (src && src.length > 50) {
          results.push({ type: 'video_element', url: src, quality: 'unknown' });
        }
        video.querySelectorAll('source').forEach(source => {
          const s = source.getAttribute('src');
          if (s && s.length > 50) {
            results.push({ type: 'video_source', url: s, quality: 'unknown' });
          }
        });
      });

      // Search HTML with broad patterns
      const html = document.documentElement.outerHTML;

      // Very broad regex to catch any mp4 URLs - including those with query params
      const mp4Regex = /https?:\/\/[^"'\\\s<>]+\.mp4(?:[^"'\\\s<>]*)?/gi;
      const mp4Matches = html.match(mp4Regex) || [];
      mp4Matches.forEach(url => {
        url = url.replace(/\\\//g, '/');
        if (url.length > 50 && !results.find(r => r.url === url)) {
          let quality = 'unknown';
          if (url.includes('hd') || url.includes('720') || url.includes('1080')) quality = 'HD';
          else if (url.includes('sd') || url.includes('480')) quality = 'SD';

          results.push({ type: 'html_mp4', url, quality });
        }
      });

      // Standard Facebook patterns
      const patterns = [
        { regex: /"hd_src":"([^"]+)"/, quality: 'HD' },
        { regex: /"sd_src":"([^"]+)"/, quality: 'SD' },
        { regex: /"video_src":"([^"]+)"/, quality: 'unknown' },
        { regex: /"browser_native_hd_url":"([^"]+)"/, quality: 'HD' },
        { regex: /"browser_native_sd_url":"([^"]+)"/, quality: 'SD' },
        { regex: /"sec_video_url":"([^"]+)"/i, quality: 'unknown' },
        { regex: /"preferred_hd_quality"\s*:\s*\{\s*"url":\s*"([^"]+)"/, quality: 'HD' },
        { regex: /"video":\s*\{\s*"url":\s*"([^"]+)"/, quality: 'unknown' },
      ];

      patterns.forEach(({ regex, quality }) => {
        const match = html.match(regex);
        if (match) {
          let url = match[1].replace(/\\\//g, '/');
          if (url.length > 50 && !results.find(r => r.url === url)) {
            results.push({ type: 'pattern', url, quality });
          }
        }
      });

      // Also search all script tags specifically
      document.querySelectorAll('script:not([src])').forEach(script => {
        const text = script.textContent;
        if (text && text.length < 1000000 && text.includes('fbcdn')) {
          // Find all URLs in the script
          const urlRegex = /https?:\/\/[^"'\\\s<>]+fbcdn\.net[^"'\\\s<>]*/gi;
          const urls = text.match(urlRegex) || [];
          urls.forEach(url => {
            if (url.includes('.mp4')) {
              const cleanUrl = url.replace(/\\\//g, '/');
              if (cleanUrl.length > 50 && !results.find(r => r.url === cleanUrl)) {
                results.push({ type: 'script', url: cleanUrl, quality: 'unknown' });
              }
            }
          });
        }
      });

      return results;
    });

    console.log(`[Scraper] Page evaluation found ${videoData.length} video URLs`);
    videoData.forEach(v => {
      console.log(`[Scraper] - Page Eval [${v.type}]: ${v.url.substring(0, 100)}...`);
    });

    // Add network URLs - ONLY use collected video URLs (already filtered by content type)
    console.log(`[Scraper] Processing ${allRequestUrls.size} network video URLs...`);

    allRequestUrls.forEach(url => {
      // These URLs are already verified to be video files by content type check
      // Clean up URL - sometimes URLs are escaped
      let cleanUrl = url;
      if (cleanUrl.includes('\\')) {
        cleanUrl = cleanUrl.replace(/\\\//g, '/');
      }

      if (!videoData.find(v => v.url === cleanUrl || v.url === url)) {
        // Try to determine quality
        let quality = 'unknown';

        // Check URL for quality indicators
        if (url.includes('hd') || url.includes('720') || url.includes('1080')) quality = 'HD';
        else if (url.includes('sd') || url.includes('480')) quality = 'SD';
        else if (url.includes('dash')) quality = 'HD';

        // Check efg param for quality info (base64 encoded)
        const efgMatch = url.match(/efg=([^&]+)/);
        if (efgMatch) {
          try {
            // eslint-disable-next-line no-undef
            const decoded = Buffer.from(efgMatch[1], 'base64').toString();
            if (decoded.includes('720') || decoded.includes('1080')) quality = 'HD';
            else if (decoded.includes('480') || decoded.includes('sd')) quality = 'SD';
          } catch {
            // Ignore base64 decoding errors
          }
        }

        console.log(`[Scraper] Adding video URL: ${cleanUrl.substring(0, 80)}... (quality: ${quality})`);
        videoData.push({ type: 'network', url: cleanUrl, quality });
      }
    });

    await browser.close();

    console.log(`[Scraper] Found ${videoData.length} video URLs`);
    videoData.forEach(v => {
      console.log(`[Scraper] - ${v.type}: ${v.url.substring(0, 80)}...`);
    });

    const validUrls = videoData.filter(v => v.url && v.url.length > 50 && v.url.includes('http'));

    if (validUrls.length === 0) {
      if (useAuth) {
        if (isPrivateGroup) {
          throw new Error('No video found in private group. Make sure you are a member of this group and your cookies are fresh. Try re-authenticating.');
        }
        throw new Error('No video found even with authentication. The video may be deleted, restricted, or use a new format.');
      } else {
        if (isPrivateGroup) {
          throw new Error('Private group videos require authentication. Add ?auth=true to your request and make sure you are logged in.');
        }
        throw new Error('No video found. Try enabling authentication mode.');
      }
    }

    // Remove duplicates
    const uniqueUrls = [];
    const seen = new Set();

    validUrls.filter(v => v.quality === 'HD').forEach(v => {
      if (!seen.has(v.url)) {
        seen.add(v.url);
        uniqueUrls.push({ ...v, label: 'HD Quality' });
      }
    });

    validUrls.filter(v => v.quality === 'SD').forEach(v => {
      if (!seen.has(v.url)) {
        seen.add(v.url);
        uniqueUrls.push({ ...v, label: 'SD Quality' });
      }
    });

    validUrls.filter(v => v.quality !== 'HD' && v.quality !== 'SD').forEach(v => {
      if (!seen.has(v.url)) {
        seen.add(v.url);
        const label = v.type.includes('hd') ? 'HD' : v.type.includes('sd') ? 'SD' : 'Unknown';
        uniqueUrls.push({ ...v, label });
      }
    });

    // Close browser before returning
    // Browser pooling disabled, always close
    if (browser) {
      try {
        await browser.close();
        console.log('[Browser] Browser closed successfully');
      } catch (error) {
        console.log('[Browser] Error closing browser:', error.message);
      }
    }

    return {
      success: true,
      title: pageTitle,
      thumbnails: [],
      formats: uniqueUrls.map((v, i) => ({
        formatId: i,
        quality: v.quality,
        label: v.label,
        url: v.url,
        type: 'video/mp4'
      }))
    };

  } catch (error) {
    console.error('[Scraper] Error:', error.message);

    // Browser pooling disabled, always close
    if (browser) {
      try {
        await browser.close();
        console.log('[Browser] Browser closed after error');
      } catch (closeError) {
        console.error('[Browser] Error closing browser:', closeError.message);
      }
    }

    // Provide better error messages for common issues
    if (error.message.includes('Navigating frame was detached') ||
        error.message.includes('frame detached')) {
      throw new Error('Browser window was closed before the page loaded. Please wait for the extraction to complete.');
    }

    if (error.message.includes('Navigation timeout')) {
      throw new Error('Page loading timed out. Facebook might be slow or the video might be unavailable.');
    }

    throw error;
  }
}

// ============ API Endpoints ============

/**
 * Check authentication status
 */
app.get('/api/auth/status', (req, res) => {
  res.json({
    authenticated: isAuthenticated,
    hasSavedCookies: savedCookies !== null
  });
});

/**
 * Login with credentials endpoint
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await loginToFacebook(email, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Manual login endpoint
 */
app.post('/api/auth/manual', async (req, res) => {
  try {
    const result = await manualLogin();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Logout endpoint
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    await fs.unlink(COOKIES_FILE).catch(() => {});
    await fs.unlink(CREDENTIALS_FILE).catch(() => {});
    isAuthenticated = false;
    savedCookies = null;
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Main extraction endpoint
 */
app.get('/api/extract', async (req, res) => {
  const { url, auth = 'false' } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  const useAuth = auth === 'true' && isAuthenticated;

  // Validate Facebook URL
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');

    if (!['facebook.com', 'fb.com', 'fb.watch'].includes(hostname) && !hostname.endsWith('.facebook.com')) {
      return res.status(400).json({ error: 'Invalid Facebook URL' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check cache
  const cacheKey = `${url}_auth_${useAuth}`;
  const cached = videoCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache] Using cached result for: ${url}`);
    return res.json(cached.data);
  }

  try {
    const result = await extractFacebookVideoUrl(url, useAuth);

    videoCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    });

    res.json(result);

  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({
      error: 'Failed to extract video',
      message: error.message,
      suggestion: useAuth
        ? 'The video may be deleted or you may not have access to this private content.'
        : 'Try adding ?auth=true to enable authentication for private videos.'
    });
  }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    authenticated: isAuthenticated
  });
});

/**
 * Clear cache
 */
app.post('/api/cache/clear', (req, res) => {
  videoCache.clear();
  res.json({ message: 'Cache cleared' });
});

/**
 * Download video endpoint - proxies the video download
 */
app.get('/api/download', async (req, res) => {
  const { url, filename } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Decode URL if needed (handle unicode escape sequences)
  const decodedUrl = url.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  try {
    console.log(`[Download] Fetching video: ${decodedUrl.substring(0, 100)}...`);

    const response = await fetch(decodedUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`);
    }

    // Get content type and length
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');

    // Set headers for download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'video.mp4'}"`);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Pipe the response to the client
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (err) {
          console.error('[Download] Stream error:', err);
          controller.error(err);
        }
      }
    });

    // Convert stream to Node.js readable stream
    // eslint-disable-next-line no-undef
    const { Readable } = require('stream');
    const nodeStream = Readable.fromWeb(stream);
    nodeStream.pipe(res);

  } catch (error) {
    console.error('[Download] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Initialize: Load saved cookies and download yt-dlp on startup
(async () => {
  // Download yt-dlp if not available
  const { execSync } = await import('child_process');
  try {
    execSync('which yt-dlp', { stdio: 'ignore' });
    console.log('[Setup] yt-dlp is already installed');
  } catch {
    console.log('[Setup] yt-dlp not found, downloading...');
    try {
      execSync('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /tmp/yt-dlp && chmod a+rx /tmp/yt-dlp', { stdio: 'inherit' });
      console.log('[Setup] yt-dlp downloaded successfully');
    } catch (err) {
      console.error('[Setup] Failed to download yt-dlp:', err.message);
    }
  }

  const cookies = await loadCookies();
  if (cookies && cookies.find(c => c.name === 'c_user')) {
    savedCookies = cookies;
    isAuthenticated = true;
    console.log('[Auth] Restored session from saved cookies');
  }
})();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Facebook Video Scraper Server (WITH AUTH SUPPORT)       ║
║   ⚡ OPTIMIZED: Browser pooling & faster extraction       ║
║                                                            ║
║   Server running on: http://localhost:${PORT}              ║
║   Network access: http://0.0.0.0:${PORT}                   ║
║                                                            ║
║   API Endpoints:                                           ║
║   - GET  /api/extract?url=<url>&auth=<true|false>         ║
║   - POST /api/auth/login (body: {email, password})        ║
║   - POST /api/auth/manual                                 ║
║   - GET  /api/auth/status                                 ║
║   - POST /api/auth/logout                                 ║
║                                                            ║
║   Auth Status: ${isAuthenticated ? 'CONNECTED' : 'NOT CONNECTED'}              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// ⚡ OPTIMIZATION: Cleanup browser pool on server shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down...');
  console.log('[Browser Pool] Closing all browsers...');
  
  for (const browser of browserPool) {
    try {
      await browser.close();
    } catch {}
  }
  browserPool = [];
  
  console.log('[Server] Cleanup complete. Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Server] Received SIGTERM...');
  
  for (const browser of browserPool) {
    try {
      await browser.close();
    } catch {}
  }
  browserPool = [];
  
  process.exit(0);
});
