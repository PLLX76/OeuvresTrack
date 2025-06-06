# OeuvresTrack

**OeuvresTrack - Never Miss a Release Again!**

OeuvresTrack is your ultimate companion for keeping up with the latest releases of your favorite movies, TV series, books, and more. Designed to simplify your media tracking, this intuitive web application allows you to easily monitor your progress, receive notifications for new content, and manage your personal library all in one place.

## Overview

Tired of manually checking for new episodes, seasons, or book installments? OeuvresTrack automates this process. Add items to your list, track what you've watched or read, and get alerted when new content drops. The application fetches data from sources like The Movie Database (TMDB) for movies and TV shows, and Booknode for books, ensuring you have access to a wide range of media.

## Known Issues

- **Concurrency Issues:** The application may experience unexpected behavior or data inconsistencies when multiple users access and modify the same resources concurrently. This needs to be addressed with appropriate locking mechanisms or database transaction management.

## Key Features

- **Personalized Media Lists:** Create and manage lists of movies, TV shows, and books you're interested in, currently watching/reading, or have completed.
- **Progress Tracking:**
  - Mark movies as watched.
  - Track watched episodes and seasons for TV series.
  - Keep a record of read tomes for book series.
- **Release Notifications:** (Requires setup) Receive web push notifications for new episodes, seasons, or books in your tracked series.
- **Comprehensive Search:** Easily find new movies, TV shows, and books to add to your lists.
- **Detailed Information:** Access overviews, release dates, and cover art for your media.
- **Ranking System & Tier Lists:** Assign ranks (S, A, B, etc.) to your media and view them organized in a personal tier list.
- **Customizable Display:** Tailor how list items are displayed using a flexible lexicon system.
- **User Accounts:** Secure registration and login system to keep your lists private.
- **User Settings:**
  - Toggle inclusion of adult content in search results.
  - Customize list display preferences.
- **API Endpoints:** A robust API for managing user data, lists, and media information.
- **Security & Performance:**
  - Content Security Policy (CSP) and other security headers via Flask-Talisman.
  - Rate limiting to prevent abuse.
  - Caching for improved performance.
  - Code minification and compression.
- **Error Reporting:** (Optional) Integration with Discord webhooks for 500 error notifications.

## Tech Stack

- **Backend:** Python 3, Flask
- **Database:** MongoDB
- **Frontend:** HTML5, CSS3, JavaScript
- **Data Sources & APIs:**
  - The Movie Database (TMDB) API
  - Booknode (via web scraping using `cloudscraper`)
- **Key Python Libraries & Flask Extensions:**
  - `pymongo` (MongoDB driver)
  - `requests`, `cloudscraper` (HTTP requests and scraping)
  - `passlib` (Password hashing)
  - `Flask-Minify` (HTML, JS, CSS minification)
  - `Flask-Compress` (Response compression)
  - `Flask-Caching` (Server-side caching)
  - `Flask-Talisman` (HTTP security headers)
  - `Flask-Limiter` (Rate limiting)
  - `pywebpush` (Web push notifications)
  - `python-dotenv` (Environment variable management)

## Setup and Installation

### Prerequisites

- Python 3.7+
- MongoDB instance (local or cloud-hosted)
- Git (optional, for cloning)

### Installation

1.  **Clone the repository (optional):**

    ```bash
    git clone https://github.com/PLLX76/OeuvresTrack/
    cd OeuvresTrack
    ```

2.  **Create a virtual environment (recommended):**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    (You'll need to create a `requirements.txt` file first by running `pip freeze > requirements.txt` in your project environment)

    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up Environment Variables:**
    Create a `.env` file in the root directory of the project and add the following variables:
    ```env
    SECRET_KEY=your_very_secret_flask_key
    MONGODB_URI=your_mongodb_connection_string
    TMDB_TOKEN=your_tmdb_api_v4_auth_token_or_v3_api_key # For TMDB API v4, prefix with "Bearer "
    VAPID_PUBLIC_KEY=your_vapid_public_key_for_webpush
    VAPID_PRIVATE_KEY=your_vapid_private_key_for_webpush
    DISCORD_WEBHOOK_URL=your_discord_webhook_url_for_errors # Optional
    ENV=development # or production
    ```
    - `SECRET_KEY`: A strong, random string for Flask session security.
    - `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/OeuvresTrack`).
    - `TMDB_TOKEN`: Your TMDB API access token (v4 Bearer Token recommended) or API Key (v3).
    - `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY`: Generate these for web push notifications (e.g., using an online VAPID key generator).
    - `DISCORD_WEBHOOK_URL`: (Optional) If you want to receive 500 error notifications on a Discord channel.
    - `ENV`: Set to `development` for debugging features or `production` for deployment.

### Running the Application

```bash
python main.py
```
