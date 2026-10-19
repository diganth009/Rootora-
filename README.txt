ROOTORA AI — CORRECTED INTEGRATION

WHAT THIS DOES
- Serves the Rootora website and the AI chat from the same Node.js server.
- Sends chat messages to the OpenAI Responses API from the server (never from browser code).
- Includes a health check at /api/health.
- Includes a Windows one-click starter: double-click Start-Rootora.bat.

REQUIREMENTS
- Node.js 20 or newer installed on Windows.
- For REAL AI replies: an OpenAI API key and API billing/credits. ChatGPT subscriptions do not automatically include API usage.

WINDOWS QUICK START
1. Extract this ZIP fully using File Explorer's Extract all button.
2. Open the extracted rootora-ai-integration folder.
3. Double-click Start-Rootora.bat.
4. A terminal asks for your OpenAI API key using hidden input. Paste the key and press Enter. The key is not written into the project files. If you do not have a key yet, press Enter to run the site without AI.
5. When the terminal says Rootora is running, open http://localhost:3000 in your browser.
6. Test the chat. To check the server status, open http://localhost:3000/api/health.
7. Keep the terminal open while using the local website. Press Ctrl+C in that window to stop it.

IMPORTANT
- Do not put the API key into index.html, upload it to a public repository, or send it in chat.
- API use may incur charges. Check your OpenAI API billing and usage limits before testing.
- If you see an error about model access, create a model-enabled API key/account or set OPENAI_MODEL to a model available to your API account before starting.

PUBLISHING ONLINE
Upload the entire folder to a Node.js hosting service, not static-only hosting. Configure OPENAI_API_KEY in the host's private environment-variable settings, and use `npm start` as the start command. Set OPENAI_MODEL only if needed. Then use the host's public website URL. Do not use the local starter for a public production site.

SCOPE
Rootora AI can answer conversationally. Live business listings, maps, accounts, payments, and other actions need separate integrations; this package does not pretend those are connected.
