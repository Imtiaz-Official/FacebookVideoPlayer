#!/data/data/com.termux/files/usr/bin/bash

# Facebook Video Player - Termux Setup & Runner
# One-stop script for setting up and running the app on Termux

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        Facebook Video Player - Termux Setup              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running in Termux
if [[ ! -d "/data/data/com.termux" ]]; then
    print_error "This script must be run in Termux!"
    exit 1
fi

print_success "Running in Termux environment"

# Step 1: Check and install required packages
print_info "Checking required packages..."

if ! command_exists node; then
    print_warning "Node.js not found. Installing..."
    pkg update -y
    pkg install nodejs-lts -y
    print_success "Node.js installed"
else
    NODE_VERSION=$(node --version)
    print_success "Node.js already installed: $NODE_VERSION"
fi

if ! command_exists git; then
    print_warning "Git not found. Installing..."
    pkg install git -y
    print_success "Git installed"
else
    print_success "Git already installed"
fi

# Step 2: Check for Chromium (optional for Puppeteer)
if ! command_exists chromium-browser; then
    print_warning "Chromium not found. Puppeteer may not work properly."
    echo -e "${YELLOW}Install Chromium? (y/n)${NC}"
    read -r install_chromium
    if [[ "$install_chromium" == "y" ]]; then
        pkg install chromium -y
        print_success "Chromium installed"
    else
        print_warning "Skipping Chromium. Some features may not work."
    fi
else
    print_success "Chromium already installed"
fi

# Step 3: Get Termux IP address
print_info "Getting network information..."
TERMUX_IP=$(ifconfig 2>/dev/null | grep -A 1 'wlan0' | grep 'inet ' | awk '{print $2}' | cut -d: -f2)
if [[ -z "$TERMUX_IP" ]]; then
    TERMUX_IP=$(ip addr show wlan0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
fi

if [[ -n "$TERMUX_IP" ]]; then
    print_success "Device IP: $TERMUX_IP"
else
    print_warning "Could not detect IP address"
    TERMUX_IP="localhost"
fi

# Step 4: Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    print_info "Installing npm dependencies..."
    echo -e "${YELLOW}This may take 5-10 minutes...${NC}"
    
    # Try normal install first
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_warning "Normal install failed, trying with --legacy-peer-deps..."
        if npm install --legacy-peer-deps; then
            print_success "Dependencies installed with legacy mode"
        else
            print_error "Failed to install dependencies!"
            exit 1
        fi
    fi
else
    print_success "Dependencies already installed"
fi

# Step 5: Check Puppeteer configuration
print_info "Configuring Puppeteer for Termux..."

# Create or update Puppeteer config
if [[ -f "server.js" ]]; then
    if grep -q "executablePath" server.js; then
        print_success "Puppeteer already configured"
    else
        print_warning "Puppeteer may need manual configuration"
        print_info "Add this to puppeteer.launch() in server.js:"
        echo -e "${CYAN}executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser'${NC}"
    fi
fi

# Step 6: Grant storage permissions (if needed)
if [[ ! -d "$HOME/storage" ]]; then
    print_warning "Storage access not granted"
    print_info "Granting storage permissions..."
    termux-setup-storage
    sleep 2
fi

# Step 7: Display startup options
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              Choose how to run the app:                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}1)${NC} Run both Frontend + Backend (Recommended)"
echo -e "${GREEN}2)${NC} Run Frontend only (Vite dev server)"
echo -e "${GREEN}3)${NC} Run Backend only (Express server)"
echo -e "${GREEN}4)${NC} Build for production"
echo -e "${GREEN}5)${NC} Exit"
echo ""
echo -n "Select option [1-5]: "
read -r option

case $option in
    1)
        print_info "Starting Frontend + Backend..."
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ Frontend:${NC} http://localhost:5173"
        echo -e "${GREEN}✓ Backend:${NC}  http://localhost:3001"
        if [[ "$TERMUX_IP" != "localhost" ]]; then
            echo -e "${CYAN}Network Access:${NC}"
            echo -e "${GREEN}✓ Frontend:${NC} http://$TERMUX_IP:5173"
            echo -e "${GREEN}✓ Backend:${NC}  http://$TERMUX_IP:3001"
        fi
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        print_info "Press Ctrl+C to stop servers"
        echo ""
        
        # Check if concurrently is available
        if npm run dev:all 2>/dev/null; then
            :
        else
            print_warning "Concurrently not working, running servers separately..."
            # Run in background
            npm run server &
            SERVER_PID=$!
            sleep 2
            npm run dev
            # Cleanup on exit
            kill $SERVER_PID 2>/dev/null
        fi
        ;;
    
    2)
        print_info "Starting Frontend only..."
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ Frontend:${NC} http://localhost:5173"
        if [[ "$TERMUX_IP" != "localhost" ]]; then
            echo -e "${GREEN}✓ Network:${NC}  http://$TERMUX_IP:5173"
        fi
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        npm run dev
        ;;
    
    3)
        print_info "Starting Backend only..."
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ Backend:${NC} http://localhost:3001"
        if [[ "$TERMUX_IP" != "localhost" ]]; then
            echo -e "${GREEN}✓ Network:${NC} http://$TERMUX_IP:3001"
        fi
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        npm run server
        ;;
    
    4)
        print_info "Building for production..."
        npm run build
        print_success "Build complete! Files in 'dist' folder"
        echo ""
        echo -e "${YELLOW}To preview:${NC} npm run preview"
        ;;
    
    5)
        print_info "Exiting..."
        exit 0
        ;;
    
    *)
        print_error "Invalid option!"
        exit 1
        ;;
esac
