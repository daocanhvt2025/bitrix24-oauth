# Bitrix24 OAuth Implementation

A Node.js backend application implementing OAuth authentication for Bitrix24, including token management and API calls.

## Features
- Handles Bitrix24 app installation event (`Install App`).
- Stores access token and refresh token in a file (can be extended to a database).
- Automatically renews tokens when they expire.
- Provides a generic endpoint to call any Bitrix24 API with the current token.
- Error handling for common issues (timeout, token expired, network errors).
- Supports local testing with ngrok.

## Tech Stack
- Node.js
- Express.js
- Axios
- fs-extra (for file-based token storage)

## Prerequisites
- Node.js (v14 or higher recommended)
- npm (v6 or higher recommended)
- A Bitrix24 account with admin access to create a local application
- [ngrok](https://ngrok.com/) for local testing
- Bitrix24 application credentials (Client ID and Client Secret)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bitrix24-oauth