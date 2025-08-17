Write-Host "Starting Workshop Platform Email Verification Server..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Please create a .env file with your Gmail credentials:" -ForegroundColor Yellow
    Write-Host "GMAIL_USER=your-email@gmail.com" -ForegroundColor Cyan
    Write-Host "GMAIL_APP_PASSWORD=your-app-password" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "For now, the server will start with default settings." -ForegroundColor Yellow
    Write-Host ""
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
    Write-Host ""
}

# Start the server
Write-Host "🚀 Starting server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
npm start 