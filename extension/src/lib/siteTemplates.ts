import type { SiteTemplate } from './types';

export const defaultSiteTemplates: SiteTemplate[] = [
  { id: 'wikipedia', site: 'Wikipedia', urlTemplate: 'https://en.wikipedia.org/w/index.php?search={q}' },
  { id: 'youtube', site: 'YouTube', urlTemplate: 'https://www.youtube.com/results?search_query={q}' },
  { id: 'github', site: 'GitHub', urlTemplate: 'https://github.com/search?q={q}' },
  { id: 'google', site: 'Google', urlTemplate: 'https://www.google.com/search?q={q}' },
  { id: 'amazon', site: 'Amazon', urlTemplate: 'https://www.amazon.com/s?k={q}' },
  { id: 'reddit', site: 'Reddit', urlTemplate: 'https://www.reddit.com/search/?q={q}' },
  { id: 'stack-overflow', site: 'Stack Overflow', urlTemplate: 'https://stackoverflow.com/search?q={q}' },
  { id: 'imdb', site: 'IMDb', urlTemplate: 'https://www.imdb.com/find/?q={q}' },
  { id: 'x', site: 'X', urlTemplate: 'https://x.com/search?q={q}' },
  { id: 'npm', site: 'npm', urlTemplate: 'https://www.npmjs.com/search?q={q}' }
];

export const COMMON_SITES: Record<string, { label: string; url: string }> = {
  // Google & Office Productivity
  'chrome web store': { label: 'Chrome Web Store', url: 'https://chromewebstore.google.com' },
  'google drive': { label: 'Google Drive', url: 'https://drive.google.com' },
  'drive': { label: 'Google Drive', url: 'https://drive.google.com' },
  'gmail': { label: 'Gmail', url: 'https://mail.google.com' },
  'google mail': { label: 'Gmail', url: 'https://mail.google.com' },
  'google': { label: 'Google Search', url: 'https://www.google.com' },
  'google search': { label: 'Google Search', url: 'https://www.google.com' },
  'google maps': { label: 'Google Maps', url: 'https://maps.google.com' },
  'maps': { label: 'Google Maps', url: 'https://maps.google.com' },
  'google docs': { label: 'Google Docs', url: 'https://docs.google.com' },
  'docs': { label: 'Google Docs', url: 'https://docs.google.com' },
  'word': { label: 'Google Docs', url: 'https://docs.google.com' },
  'google sheets': { label: 'Google Sheets', url: 'https://sheets.google.com' },
  'sheets': { label: 'Google Sheets', url: 'https://sheets.google.com' },
  'excel': { label: 'Google Sheets', url: 'https://sheets.google.com' },
  'excel sheet': { label: 'Google Sheets', url: 'https://sheets.google.com' },
  'google slides': { label: 'Google Slides', url: 'https://slides.google.com' },
  'slides': { label: 'Google Slides', url: 'https://slides.google.com' },
  'powerpoint': { label: 'Google Slides', url: 'https://slides.google.com' },
  'google calendar': { label: 'Google Calendar', url: 'https://calendar.google.com' },
  'calendar': { label: 'Google Calendar', url: 'https://calendar.google.com' },
  'google keep': { label: 'Google Keep', url: 'https://keep.google.com' },
  'keep': { label: 'Google Keep', url: 'https://keep.google.com' },
  'google meet': { label: 'Google Meet', url: 'https://meet.google.com' },
  'meet': { label: 'Google Meet', url: 'https://meet.google.com' },
  'google fonts': { label: 'Google Fonts', url: 'https://fonts.google.com' },
  'google cloud': { label: 'Google Cloud Console', url: 'https://console.cloud.google.com' },
  'gcp': { label: 'Google Cloud Console', url: 'https://console.cloud.google.com' },
  'google translate': { label: 'Google Translate', url: 'https://translate.google.com' },
  'translator': { label: 'Google Translate', url: 'https://translate.google.com' },

  // Government & Essential Public Services (India & Global)
  'my aadhar': { label: 'My Aadhaar Portal', url: 'https://myaadhaar.uidai.gov.in' },
  'aadhar': { label: 'My Aadhaar Portal', url: 'https://myaadhaar.uidai.gov.in' },
  'aadhaar': { label: 'My Aadhaar Portal', url: 'https://myaadhaar.uidai.gov.in' },
  'uidai': { label: 'UIDAI Aadhaar', url: 'https://uidai.gov.in' },
  'pan india': { label: 'Income Tax PAN Portal', url: 'https://eportal.incometax.gov.in' },
  'pan card': { label: 'PAN Card Portal', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html' },
  'income tax': { label: 'Income Tax e-Filing', url: 'https://www.incometax.gov.in' },
  'income tax india': { label: 'Income Tax e-Filing', url: 'https://www.incometax.gov.in' },
  'itr': { label: 'Income Tax e-Filing', url: 'https://www.incometax.gov.in' },
  'epfo': { label: 'EPFO India', url: 'https://www.epfindia.gov.in' },
  'pf portal': { label: 'EPFO Member Portal', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface' },
  'digilocker': { label: 'DigiLocker', url: 'https://www.digilocker.gov.in' },
  'parivahan': { label: 'Parivahan Sewa', url: 'https://parivahan.gov.in' },
  'driving license': { label: 'Parivahan Sarathi', url: 'https://sarathi.parivahan.gov.in' },
  'passport': { label: 'Passport Seva', url: 'https://www.passportindia.gov.in' },
  'passport seva': { label: 'Passport Seva', url: 'https://www.passportindia.gov.in' },
  'irctc': { label: 'IRCTC Train Booking', url: 'https://www.irctc.co.in' },
  'train booking': { label: 'IRCTC Train Booking', url: 'https://www.irctc.co.in' },

  // Finance, Banking & Crypto
  'binance': { label: 'Binance', url: 'https://www.binance.com' },
  'coinbase': { label: 'Coinbase', url: 'https://www.coinbase.com' },
  'wazirx': { label: 'WazirX', url: 'https://wazirx.com' },
  'coinswitch': { label: 'CoinSwitch', url: 'https://coinswitch.co' },
  'zerodha': { label: 'Zerodha Kite', url: 'https://kite.zerodha.com' },
  'kite': { label: 'Zerodha Kite', url: 'https://kite.zerodha.com' },
  'groww': { label: 'Groww', url: 'https://groww.in' },
  'upstox': { label: 'Upstox', url: 'https://upstox.com' },
  'paytm': { label: 'Paytm', url: 'https://paytm.com' },
  'phonepe': { label: 'PhonePe', url: 'https://www.phonepe.com' },
  'google pay': { label: 'Google Pay', url: 'https://pay.google.com' },
  'gpay': { label: 'Google Pay', url: 'https://pay.google.com' },
  'paypal': { label: 'PayPal', url: 'https://www.paypal.com' },
  'tradingview': { label: 'TradingView', url: 'https://www.tradingview.com' },
  'yahoo finance': { label: 'Yahoo Finance', url: 'https://finance.yahoo.com' },
  'moneycontrol': { label: 'Moneycontrol', url: 'https://www.moneycontrol.com' },
  'livemint': { label: 'Livemint', url: 'https://www.livemint.com' },
  'mint': { label: 'Livemint', url: 'https://www.livemint.com' },

  // Social Media & Messaging
  'telegram': { label: 'Telegram Web', url: 'https://web.telegram.org' },
  'telegram web': { label: 'Telegram Web', url: 'https://web.telegram.org' },
  'whatsapp': { label: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
  'whatsapp web': { label: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
  'discord': { label: 'Discord', url: 'https://discord.com/app' },
  'pinterest': { label: 'Pinterest', url: 'https://www.pinterest.com' },
  'snapchat': { label: 'Snapchat Web', url: 'https://web.snapchat.com' },
  'tiktok': { label: 'TikTok', url: 'https://www.tiktok.com' },
  'reddit': { label: 'Reddit', url: 'https://www.reddit.com' },
  'instagram': { label: 'Instagram', url: 'https://www.instagram.com' },
  'facebook': { label: 'Facebook', url: 'https://www.facebook.com' },
  'twitter': { label: 'X (Twitter)', url: 'https://x.com' },
  'x': { label: 'X', url: 'https://x.com' },
  'linkedin': { label: 'LinkedIn', url: 'https://www.linkedin.com' },
  'threads': { label: 'Threads', url: 'https://www.threads.net' },
  'quora': { label: 'Quora', url: 'https://www.quora.com' },
  'tumblr': { label: 'Tumblr', url: 'https://www.tumblr.com' },
  'medium': { label: 'Medium', url: 'https://medium.com' },
  'dev.to': { label: 'DEV Community', url: 'https://dev.to' },
  'hashnode': { label: 'Hashnode', url: 'https://hashnode.com' },
  'producthunt': { label: 'Product Hunt', url: 'https://www.producthunt.com' },

  // Streaming, Music & Gaming
  'youtube': { label: 'YouTube', url: 'https://www.youtube.com' },
  'youtube music': { label: 'YouTube Music', url: 'https://music.youtube.com' },
  'spotify': { label: 'Spotify', url: 'https://open.spotify.com' },
  'netflix': { label: 'Netflix', url: 'https://www.netflix.com' },
  'prime video': { label: 'Prime Video', url: 'https://www.primevideo.com' },
  'hotstar': { label: 'JioHotstar', url: 'https://www.hotstar.com' },
  'jiohotstar': { label: 'JioHotstar', url: 'https://www.hotstar.com' },
  'disney hotstar': { label: 'JioHotstar', url: 'https://www.hotstar.com' },
  'jiosaavn': { label: 'JioSaavn', url: 'https://www.jiosaavn.com' },
  'gaana': { label: 'Gaana', url: 'https://gaana.com' },
  'apple music': { label: 'Apple Music', url: 'https://music.apple.com' },
  'twitch': { label: 'Twitch', url: 'https://www.twitch.tv' },
  'steam': { label: 'Steam Store', url: 'https://store.steampowered.com' },
  'epic games': { label: 'Epic Games', url: 'https://store.epicgames.com' },
  'roblox': { label: 'Roblox', url: 'https://www.roblox.com' },
  'coc': { label: 'Clash of Clans', url: 'https://supercell.com/en/games/clashofclans' },
  'clash of clans': { label: 'Clash of Clans', url: 'https://supercell.com/en/games/clashofclans' },
  'chess': { label: 'Chess.com', url: 'https://www.chess.com' },
  'chess.com': { label: 'Chess.com', url: 'https://www.chess.com' },
  'lichess': { label: 'Lichess', url: 'https://lichess.org' },
  'crunchyroll': { label: 'Crunchyroll', url: 'https://www.crunchyroll.com' },
  'hulu': { label: 'Hulu', url: 'https://www.hulu.com' },
  'max': { label: 'Max (HBO)', url: 'https://www.max.com' },
  'hbo max': { label: 'Max (HBO)', url: 'https://www.max.com' },

  // E-Commerce, Food & Quick Commerce
  'amazon': { label: 'Amazon', url: 'https://www.amazon.com' },
  'flipkart': { label: 'Flipkart', url: 'https://www.flipkart.com' },
  'myntra': { label: 'Myntra', url: 'https://www.myntra.com' },
  'meesho': { label: 'Meesho', url: 'https://www.meesho.com' },
  'nykaa': { label: 'Nykaa', url: 'https://www.nykaa.com' },
  'ajio': { label: 'Ajio', url: 'https://www.ajio.com' },
  'blinkit': { label: 'Blinkit', url: 'https://blinkit.com' },
  'zepto': { label: 'Zepto', url: 'https://zepto.com' },
  'swiggy': { label: 'Swiggy', url: 'https://www.swiggy.com' },
  'zomato': { label: 'Zomato', url: 'https://www.zomato.com' },
  'ebay': { label: 'eBay', url: 'https://www.ebay.com' },
  'aliexpress': { label: 'AliExpress', url: 'https://www.aliexpress.com' },
  'etsy': { label: 'Etsy', url: 'https://www.etsy.com' },
  'walmart': { label: 'Walmart', url: 'https://www.walmart.com' },
  'target': { label: 'Target', url: 'https://www.target.com' },
  'bookmyshow': { label: 'BookMyShow', url: 'https://in.bookmyshow.com' },
  'make my trip': { label: 'MakeMyTrip', url: 'https://www.makemytrip.com' },
  'makemytrip': { label: 'MakeMyTrip', url: 'https://www.makemytrip.com' },
  'booking.com': { label: 'Booking.com', url: 'https://www.booking.com' },
  'airbnb': { label: 'Airbnb', url: 'https://www.airbnb.com' },

  // Online Editing, PDF & Utilities
  'canva': { label: 'Canva', url: 'https://www.canva.com' },
  'capcut': { label: 'CapCut', url: 'https://www.capcut.com' },
  'photopea': { label: 'Photopea Online Editor', url: 'https://www.photopea.com' },
  'remove bg': { label: 'remove.bg', url: 'https://www.remove.bg' },
  'removebg': { label: 'remove.bg', url: 'https://www.remove.bg' },
  'tinywow': { label: 'TinyWow Tools', url: 'https://tinywow.com' },
  'tiny wow': { label: 'TinyWow Tools', url: 'https://tinywow.com' },
  'ilovepdf': { label: 'iLovePDF', url: 'https://www.ilovepdf.com' },
  'i love pdf': { label: 'iLovePDF', url: 'https://www.ilovepdf.com' },
  'smallpdf': { label: 'Smallpdf', url: 'https://smallpdf.com' },
  'pixlr': { label: 'Pixlr Editor', url: 'https://pixlr.com' },
  'grammarly': { label: 'Grammarly', url: 'https://www.grammarly.com' },
  'quillbot': { label: 'QuillBot', url: 'https://quillbot.com' },
  'speedtest': { label: 'Ookla Speedtest', url: 'https://www.speedtest.net' },
  'internet speed': { label: 'Ookla Speedtest', url: 'https://www.speedtest.net' },
  'accuweather': { label: 'AccuWeather', url: 'https://www.accuweather.com' },
  'weather': { label: 'AccuWeather', url: 'https://www.accuweather.com' },

  // News, Knowledge & Media
  'bbc': { label: 'BBC News', url: 'https://www.bbc.com/news' },
  'bbc news': { label: 'BBC News', url: 'https://www.bbc.com/news' },
  'cnn': { label: 'CNN', url: 'https://www.cnn.com' },
  'ndtv': { label: 'NDTV News', url: 'https://www.ndtv.com' },
  'times of india': { label: 'Times of India', url: 'https://timesofindia.indiatimes.com' },
  'toi': { label: 'Times of India', url: 'https://timesofindia.indiatimes.com' },
  'the hindu': { label: 'The Hindu', url: 'https://www.thehindu.com' },
  'reuters': { label: 'Reuters', url: 'https://www.reuters.com' },
  'nytimes': { label: 'New York Times', url: 'https://www.nytimes.com' },
  'new york times': { label: 'New York Times', url: 'https://www.nytimes.com' },
  'al jazeera': { label: 'Al Jazeera', url: 'https://www.aljazeera.com' },
  'forbes': { label: 'Forbes', url: 'https://www.forbes.com' },
  'bloomberg': { label: 'Bloomberg', url: 'https://www.bloomberg.com' },
  'wikipedia': { label: 'Wikipedia', url: 'https://www.wikipedia.org' },
  'imdb': { label: 'IMDb', url: 'https://www.imdb.com' },
  'stack overflow': { label: 'Stack Overflow', url: 'https://stackoverflow.com' },

  // Cloud & Web Dev Tools
  'vercel': { label: 'Vercel', url: 'https://vercel.com' },
  'render': { label: 'Render', url: 'https://render.com' },
  'netlify': { label: 'Netlify', url: 'https://www.netlify.com' },
  'railway': { label: 'Railway', url: 'https://railway.app' },
  'supabase': { label: 'Supabase', url: 'https://supabase.com' },
  'firebase': { label: 'Firebase Console', url: 'https://console.firebase.google.com' },
  'aws': { label: 'AWS Console', url: 'https://aws.amazon.com' },
  'azure': { label: 'Azure Portal', url: 'https://portal.azure.com' },
  'fly io': { label: 'Fly.io', url: 'https://fly.io' },
  'fly.io': { label: 'Fly.io', url: 'https://fly.io' },
  'cloudflare': { label: 'Cloudflare', url: 'https://dash.cloudflare.com' },
  'digitalocean': { label: 'DigitalOcean', url: 'https://cloud.digitalocean.com' },
  'heroku': { label: 'Heroku', url: 'https://dashboard.heroku.com' },
  'clerk': { label: 'Clerk Auth', url: 'https://clerk.com' },
  'auth0': { label: 'Auth0', url: 'https://auth0.com' },
  'stripe': { label: 'Stripe Dashboard', url: 'https://dashboard.stripe.com' },
  'resend': { label: 'Resend', url: 'https://resend.com' },
  'sentry': { label: 'Sentry', url: 'https://sentry.io' },
  'posthog': { label: 'PostHog', url: 'https://posthog.com' },
  'datadog': { label: 'DataDog', url: 'https://www.datadoghq.com' },
  'neon': { label: 'Neon Postgres', url: 'https://neon.tech' },
  'planetscale': { label: 'PlanetScale', url: 'https://planetscale.com' },
  'upstash': { label: 'Upstash', url: 'https://upstash.com' },
  'pinecone': { label: 'Pinecone DB', url: 'https://www.pinecone.io' },

  // Design, Components & UI Assets
  'dribbble': { label: 'Dribbble', url: 'https://dribbble.com' },
  '21st.dev': { label: '21st.dev', url: 'https://21st.dev' },
  '21st dev': { label: '21st.dev', url: 'https://21st.dev' },
  'motion.dev': { label: 'Motion.dev', url: 'https://motion.dev' },
  'motion dev': { label: 'Motion.dev', url: 'https://motion.dev' },
  'shadcn': { label: 'shadcn/ui', url: 'https://ui.shadcn.com' },
  'shadcn ui': { label: 'shadcn/ui', url: 'https://ui.shadcn.com' },
  'tailwindcss': { label: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  'behance': { label: 'Behance', url: 'https://www.behance.net' },
  'framer': { label: 'Framer', url: 'https://www.framer.com' },
  'figma': { label: 'Figma', url: 'https://www.figma.com' },
  'webflow': { label: 'Webflow', url: 'https://webflow.com' },
  'excalidraw': { label: 'Excalidraw', url: 'https://excalidraw.com' },
  'lucide': { label: 'Lucide Icons', url: 'https://lucide.dev' },
  'font awesome': { label: 'Font Awesome', url: 'https://fontawesome.com' },
  'uiverse': { label: 'UIverse', url: 'https://uiverse.io' },
  'v0': { label: 'v0.dev', url: 'https://v0.dev' },
  'v0.dev': { label: 'v0.dev', url: 'https://v0.dev' },
  'magic ui': { label: 'Magic UI', url: 'https://magicui.design' },
  'aceternity': { label: 'Aceternity UI', url: 'https://ui.aceternity.com' },
  'spline': { label: 'Spline 3D', url: 'https://spline.design' },
  'iconify': { label: 'Iconify', url: 'https://iconify.design' },
  'unsplash': { label: 'Unsplash', url: 'https://unsplash.com' },
  'freepik': { label: 'Freepik', url: 'https://www.freepik.com' },

  // AI Tools & Platforms
  'chatgpt': { label: 'ChatGPT', url: 'https://chatgpt.com' },
  'openai': { label: 'ChatGPT', url: 'https://chatgpt.com' },
  'claude': { label: 'Claude AI', url: 'https://claude.ai' },
  'anthropic': { label: 'Claude AI', url: 'https://claude.ai' },
  'gemini': { label: 'Google Gemini', url: 'https://gemini.google.com' },
  'perplexity': { label: 'Perplexity AI', url: 'https://www.perplexity.ai' },
  'huggingface': { label: 'Hugging Face', url: 'https://huggingface.co' },
  'hugging face': { label: 'Hugging Face', url: 'https://huggingface.co' },
  'replicate': { label: 'Replicate', url: 'https://replicate.com' },
  'groq': { label: 'Groq Cloud', url: 'https://groq.com' },
  'ollama': { label: 'Ollama', url: 'https://ollama.com' },
  'midjourney': { label: 'Midjourney', url: 'https://www.midjourney.com' },
  'runway': { label: 'Runway ML', url: 'https://runwayml.com' },
  'elevenlabs': { label: 'ElevenLabs', url: 'https://elevenlabs.io' },
  'mistral': { label: 'Mistral AI', url: 'https://mistral.ai' },
  'deepseek': { label: 'DeepSeek AI', url: 'https://chat.deepseek.com' },
  'cohere': { label: 'Cohere', url: 'https://cohere.com' },
  'fal ai': { label: 'fal.ai', url: 'https://fal.ai' },
  'fal.ai': { label: 'fal.ai', url: 'https://fal.ai' },
  'langchain': { label: 'LangChain', url: 'https://www.langchain.com' },
  'llamaindex': { label: 'LlamaIndex', url: 'https://www.llamaindex.ai' },

  // Code Hosts & Dev Ecosystem
  'github': { label: 'GitHub', url: 'https://github.com' },
  'gitlab': { label: 'GitLab', url: 'https://gitlab.com' },
  'bitbucket': { label: 'Bitbucket', url: 'https://bitbucket.org' },
  'npm': { label: 'npm', url: 'https://www.npmjs.com' },
  'pypi': { label: 'PyPI', url: 'https://pypi.org' },
  'crates io': { label: 'Crates.io', url: 'https://crates.io' },
  'crates.io': { label: 'Crates.io', url: 'https://crates.io' },
  'docker hub': { label: 'Docker Hub', url: 'https://hub.docker.com' },
  'docker': { label: 'Docker Hub', url: 'https://hub.docker.com' },
  'replit': { label: 'Replit', url: 'https://replit.com' },
  'codesandbox': { label: 'CodeSandbox', url: 'https://codesandbox.io' },
  'stackblitz': { label: 'StackBlitz', url: 'https://stackblitz.com' },
  'codepen': { label: 'CodePen', url: 'https://codepen.io' },
  'leetcode': { label: 'LeetCode', url: 'https://leetcode.com' },
  'hackerrank': { label: 'HackerRank', url: 'https://www.hackerrank.com' },
  'codeforces': { label: 'Codeforces', url: 'https://codeforces.com' },
  'geeksforgeeks': { label: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org' },

  // Frameworks & Docs
  'nextjs': { label: 'Next.js Docs', url: 'https://nextjs.org' },
  'next.js': { label: 'Next.js Docs', url: 'https://nextjs.org' },
  'react': { label: 'React Docs', url: 'https://react.dev' },
  'vue': { label: 'Vue.js Docs', url: 'https://vuejs.org' },
  'svelte': { label: 'Svelte Docs', url: 'https://svelte.dev' },
  'vite': { label: 'Vite', url: 'https://vite.dev' },
  'astro': { label: 'Astro Docs', url: 'https://astro.build' },
  'hono': { label: 'Hono', url: 'https://hono.dev' },
  'bun': { label: 'Bun', url: 'https://bun.sh' },
  'deno': { label: 'Deno', url: 'https://deno.com' },
  'express': { label: 'Express.js Docs', url: 'https://expressjs.com' },
  'fastapi': { label: 'FastAPI Docs', url: 'https://fastapi.tiangolo.com' },
  'python': { label: 'Python Docs', url: 'https://www.python.org' },
  'mdn': { label: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  'w3schools': { label: 'W3Schools', url: 'https://www.w3schools.com' },
  'prisma': { label: 'Prisma ORM', url: 'https://www.prisma.io' },
  'drizzle': { label: 'Drizzle ORM', url: 'https://orm.drizzle.team' },
  'graphql': { label: 'GraphQL', url: 'https://graphql.org' },

  // Productivity & Project Management
  'notion': { label: 'Notion', url: 'https://www.notion.so' },
  'linear': { label: 'Linear', url: 'https://linear.app' },
  'jira': { label: 'Jira', url: 'https://www.atlassian.com/software/jira' },
  'trello': { label: 'Trello', url: 'https://trello.com' },
  'asana': { label: 'Asana', url: 'https://asana.com' },
  'slack': { label: 'Slack', url: 'https://app.slack.com' },
  'overleaf': { label: 'Overleaf', url: 'https://www.overleaf.com' },
  'miro': { label: 'Miro', url: 'https://miro.com' }
};

export const ALIASES: Record<string, string> = {
  'webstore': 'chrome web store',
  'extension store': 'chrome web store',
  'extensions store': 'chrome web store',
  'extensions page': 'chrome web store',
  'chrome store': 'chrome web store',
  'crow web store': 'chrome web store',
  'g drive': 'google drive',
  'g mail': 'gmail',
  'yt': 'youtube',
  'git hub': 'github',
  'the gift': 'github',
  'gitter': 'github',
  'get hub': 'github',
  'dribble': 'dribbble',
  '21st': '21st.dev',
  '21stdev': '21st.dev',
  'motion': 'motion.dev',
  'framer motion': 'motion.dev',
  'shadcn': 'shadcn ui',
  'tailwind': 'tailwindcss',
  'next': 'nextjs',
  'next js': 'nextjs',
  'vue js': 'vue',
  'gfg': 'geeksforgeeks',
  'geeks for geeks': 'geeksforgeeks',
  'y combinator': 'hacker news',
  'yc': 'hacker news',
  'v0 dev': 'v0',
  'v0.dev': 'v0',
  'fal': 'fal ai',
  'claude ai': 'claude',
  'gemini ai': 'gemini',
  'chat gpt': 'chatgpt',
  'gpt': 'chatgpt',
  'open ai': 'openai',
  'adhar': 'my aadhar',
  'adhaar': 'my aadhar',
  'aadar': 'my aadhar',
  'income tax dept': 'income tax',
  'it department': 'income tax',
  'binance crypto': 'binance',
  'telegram app': 'telegram',
  'tg': 'telegram',
  'clash of clan': 'coc',
  'clash of clans game': 'coc',
  'bms': 'bookmyshow',
  'book my show': 'bookmyshow',
  'pdf editor': 'ilovepdf',
  'pdf merger': 'ilovepdf',
  'bg remover': 'remove bg',
  'background remover': 'remove bg',
  'i love pdf tool': 'ilovepdf',
  'hotstar tv': 'hotstar',
  'disney hotstar india': 'hotstar'
};

export function findTemplate(templates: SiteTemplate[], spokenSite: string) {
  const normalized = normalizeSite(spokenSite);
  return templates.find((template) => normalizeSite(template.site) === normalized);
}

export function buildSiteSearchUrl(template: SiteTemplate, query: string) {
  return template.urlTemplate.replace('{q}', encodeURIComponent(query));
}

function normalizeSite(site: string) {
  return site.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function resolveSite(spoken: string): { label: string; url: string } | null {
  const normalized = spoken.toLowerCase().trim().replace(/^(the|a|an)\s+/, '');
  if (!normalized) return null;

  // 1. Direct COMMON_SITES match
  if (COMMON_SITES[normalized]) {
    return COMMON_SITES[normalized];
  }

  // 2. Alias match
  if (ALIASES[normalized] && COMMON_SITES[ALIASES[normalized]]) {
    return COMMON_SITES[ALIASES[normalized]];
  }

  // 3. Fuzzy match against COMMON_SITES and ALIASES keys (only for strings with length >= 4)
  if (normalized.length >= 4) {
    const candidates = [...Object.keys(COMMON_SITES), ...Object.keys(ALIASES)];
    let bestCandidate = '';
    let bestDist = Infinity;

    for (const cand of candidates) {
      const dist = levenshtein(normalized, cand);
      // Max allowed edit distance: 2 for lengths >= 6, 1 for lengths 4-5
      const maxAllowed = cand.length >= 6 && normalized.length >= 6 ? 2 : 1;
      if (dist <= maxAllowed && dist < bestDist) {
        bestDist = dist;
        bestCandidate = cand;
      }
    }

    if (bestCandidate) {
      const resolvedKey = ALIASES[bestCandidate] || bestCandidate;
      if (COMMON_SITES[resolvedKey]) {
        return COMMON_SITES[resolvedKey];
      }
    }
  }

  return null;
}
