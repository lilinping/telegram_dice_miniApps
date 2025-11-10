# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the product requirements and development workflow for a Telegram-based Sic-Bo (骰宝) mini-program game. The project uses a structured agent-based workflow to move from product requirements through design to implementation.

**Product**: DiceTreasure (骰宝夺宝) - A real-time dice game WebApp embedded in Telegram
**Target Platform**: Telegram WebApp (mobile-first WebView)
**Core Features**: Dice betting game with animations, social features, payment/withdrawal system, and admin backend

## Workflow Architecture

This project uses a **three-stage agent workflow** defined in `.claude/agents/`:

### 1. Product Manager Agent (`product-manager.md`)
**Trigger**: User provides product idea or requirements
**Process**:
- Collects and clarifies requirements through structured questions
- Performs market research using web search
- Generates comprehensive PRD (Product Requirements Document) as `PRD.md`
**Output**: `PRD.md` with user stories, page architecture, business logic, and constraints
**Next Step**: User types `/UI` to proceed to design phase

### 2. UI Designer Agent (`ui-designer.md`)
**Trigger**: After PRD is confirmed, user types `/UI`
**Process**:
- Reads and analyzes `PRD.md`
- Collects design preferences (style, colors, references)
- Researches latest UI/UX trends using web search
- Generates detailed design specifications
**Output**: `DESIGN_SPEC.md` with visual design system, component library, interaction specs, and responsive design rules
**Key Requirements**:
- Mobile-first design (iPhone 15 Pro Max mockup framework required)
- Strict layout control to prevent overflow
- Complete coverage of all pages from PRD
**Next Step**: User types `/开发` to proceed to development phase

### 3. Web Developer Agent (`web-developer.md`)
**Trigger**: After design spec is confirmed, user types `/开发`
**Process**:
- Reads both `PRD.md` and `DESIGN_SPEC.md`
- Plans technical architecture
- Implements complete frontend code (HTML5/CSS3/JavaScript MPA)
**Output**:
- Complete, runnable frontend code for all pages
- `README.md` with technical documentation
- All code must be directly executable in browser
**Key Requirements**:
- Strict adherence to design specifications
- Mobile-first responsive implementation
- iPhone 15 Pro Max mockup framework
- Valid image sources (Unsplash/Pixabay/Pexels with link validation)
- No missing pages - all PRD pages must be implemented

## Working with Custom Agents

To use the structured workflow:

1. **Start with Requirements**: Describe your product idea to trigger the product-manager agent
2. **Review PRD**: The agent will generate `PRD.md` - review and approve
3. **Design Phase**: Type `/UI` to start the ui-designer agent
4. **Review Design**: The agent will generate `DESIGN_SPEC.md` - review and approve
5. **Development Phase**: Type `/开发` to start the web-developer agent
6. **Review Code**: The agent will generate complete frontend implementation

**Important**: Each agent expects the previous phase's output to exist. The workflow is sequential and interdependent.

## Project Structure

```
telegram_dice_prd/
├── .claude/
│   └── agents/          # Custom agent definitions
│       ├── product-manager.md
│       ├── ui-designer.md
│       ├── web-developer.md
│       ├── frontend-page-builder.md
│       ├── ui-ux-designer-pr.md
│       └── prompt-optimizer.md
├── 骰宝小程序_PRD.md     # Original PRD in Chinese
└── CLAUDE.md           # This file
```

During development, the following files will be generated:
- `PRD.md` - Product Requirements Document (Chinese)
- `DESIGN_SPEC.md` - Design Specification Document (Chinese)
- Frontend code files (HTML/CSS/JS)
- `README.md` - Development documentation

## Core Product Features (from 骰宝小程序_PRD.md)

### Game Rules
- Standard Sic-Bo using three 6-sided dice
- Betting options: Big/Small (4-17), Odd/Even, specific totals, combinations, triple matches
- Real-time betting with countdown timer
- Animated dice rolling and result reveal

### Technical Requirements
1. **Core Modules (MVP)**:
   - Lobby/Home with current game info and history
   - Betting board with odds display and bet limits
   - Bet confirmation modal
   - Dice animation (3D/Lottie/WebGL recommended)
   - Wallet page (balance, deposit/withdraw)
   - Payment integration (fiat or crypto, compliance-dependent)
   - History/leaderboard
   - Telegram authentication (using WebApp initData)

2. **Secondary Features (V2)**:
   - Leaderboards, daily tasks, VIP system
   - Referral rewards
   - In-app chat
   - Live dealer mode

### Payment Architecture
- **Demo Phase**: Simulated currency or sandbox payments
- **Production**: Stripe/Adyen or regional payments (Alipay/WeChat)
- **Crypto Option**: USDT/ERC-20 support (if compliant)
- **Flow**: Frontend request → Backend order creation → Payment gateway → Callback verification → Balance update

### UI/UX Principles
- Casino table aesthetic (dark red/gold/wood tones)
- Mobile-first design with large touch targets
- 3D dice animation (three.js/WebGL/Lottie)
- Particle effects on win
- Quick deposit access
- Collapsible betting history

## Development Guidelines

### Mobile-First Requirements
- **Primary Target**: iPhone 15 Pro Max viewport
- **Critical**: All elements must fit within mobile screen boundaries
- **Navigation**: Bottom navigation or hamburger menu recommended
- **Touch Targets**: Minimum 44×44px for all interactive elements
- **Typography**: Large enough for mobile reading (16px+ for body text)

### Code Quality Standards
- Semantic HTML5
- Modern CSS3 (Flexbox/Grid for layouts)
- Vanilla JavaScript or modern framework
- Comprehensive code comments in Chinese
- Browser compatibility: Latest Chrome, Safari, Firefox, Edge

### Image Resources
- Use: Unsplash, Pixabay, or Pexels
- **Must validate**: Check image URLs are accessible
- Replace broken links immediately
- Optimize for web (compress for mobile)

### Responsive Design
- Mobile-first approach
- Breakpoints typically: 375px (mobile), 768px (tablet), 1024px+ (desktop)
- Test on actual devices when possible

## Agent Communication Language

All agents communicate in **Chinese** (中文) with users by default. This is configured in each agent's `[总体规则]` section.

## Important Notes

1. **No Git Repository**: This directory is not currently a git repository
2. **Document Language**: PRD and design specs are in Chinese
3. **Compliance**: Payment features require careful consideration of gambling regulations
4. **Random Number Generation**: For production, must use auditable/provably-fair RNG
5. **KYC Requirements**: Large deposits/withdrawals may require identity verification

## Additional Agents

Besides the main workflow agents, there are utility agents:

- **frontend-page-builder**: Implements production-ready pages from prototypes
- **ui-ux-designer-pr**: Alternative UI/UX design agent
- **prompt-optimizer**: Optimizes unclear user requirements into structured prompts

These can be invoked as needed for specific tasks outside the main workflow.
