import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and display total page numbers.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header
        self.drawString(54, 11 * inch - 36, "SocialPilot | Enterprise Social Media Scheduler & Campaign Management Platform")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
        
        # Footer
        self.line(54, 45, 8.5 * inch - 54, 45)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 32, page_text)
        self.drawString(54, 32, "Infosys Springboard 7.0 Internship Project Presentation")
        self.restoreState()

def build_pdf(filename="SocialPilot_Enterprise_Project_Presentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    PRIMARY = colors.HexColor("#3B82F6")   # Brand Blue
    DARK_TEXT = colors.HexColor("#0F172A") # Slate 900
    MUTED_TEXT = colors.HexColor("#475569")# Slate 600
    LIGHT_BG = colors.HexColor("#F8FAFC")  # Slate 50
    CARD_BORDER = colors.HexColor("#E2E8F0")

    # Typography Styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=DARK_TEXT,
        alignment=0
    )
    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=PRIMARY,
        alignment=0
    )
    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=DARK_TEXT,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        "BulletCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=13.5,
        textColor=DARK_TEXT,
        leftIndent=14,
        spaceAfter=4
    )
    badge_style = ParagraphStyle(
        "RoleBadge",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=10,
        textColor=colors.white
    )
    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=DARK_TEXT
    )
    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11.5,
        textColor=colors.white
    )

    story = []

    # ==========================================
    # 1. COVER PAGE
    # ==========================================
    story.append(Spacer(1, 30))
    story.append(Paragraph("INFOSYS SPRINGBOARD 7.0 INTERNSHIP PROJECT", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("SocialPilot: Enterprise Social Media Scheduler & Campaign Platform", title_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Comprehensive End-to-End Architectural Walkthrough & Presentation Master Guide", ParagraphStyle("SubDesc", fontName="Helvetica", fontSize=11, leading=15, textColor=MUTED_TEXT)))
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=20))

    meta_data = [
        [Paragraph("<b>Project Domain:</b> Full-Stack Web Development & SaaS Cloud Architecture", table_cell), Paragraph("<b>Internship Track:</b> Infosys Springboard 7.0 (Team-B)", table_cell)],
        [Paragraph("<b>Primary Frameworks:</b> Next.js 16 (React 19) + FastAPI + Python 3.11", table_cell), Paragraph("<b>Database Architecture:</b> SQLite (Relational) + MongoDB Motor", table_cell)],
        [Paragraph("<b>Security & Access:</b> JWT Bearer Tokens, Role-Based Access Control (RBAC)", table_cell), Paragraph("<b>Presentation Role:</b> Senior Technical Project Presenter", table_cell)]
    ]
    t_meta = Table(meta_data, colWidths=[250, 250])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 25))

    # Executive Summary Card
    story.append(Paragraph("<b>Executive Project Summary:</b>", h2_style))
    story.append(Paragraph(
        "SocialPilot is an enterprise-grade social media management, automated content scheduling, and cross-channel marketing campaign orchestration platform. Built with high-efficiency modern technologies, it offers dedicated workspace experiences for <b>four distinct user roles</b>: <i>Administrator, Business Organization Owner, Marketing Lead, and Content Creator</i>. The application incorporates real-time AI generation, drag-and-drop calendars, live timeline auto-syncing, subscription quotas, and multi-network publishing simulations across Twitter, Facebook, Instagram, LinkedIn, YouTube, and Pinterest.",
        body_style
    ))
    story.append(Spacer(1, 15))

    # Table of Contents
    story.append(Paragraph("<b>Table of Contents:</b>", h2_style))
    toc_data = [
        [Paragraph("<b>Section</b>", table_header), Paragraph("<b>Title & Core Focus Area</b>", table_header)],
        [Paragraph("<b>Section 1</b>", table_cell), Paragraph("Role 1: Administrator (Governance, Security, System Health & Moderation)", table_cell)],
        [Paragraph("<b>Section 2</b>", table_cell), Paragraph("Role 2: Business User (Channels, Subscription Tiers, Invoices & Quotas)", table_cell)],
        [Paragraph("<b>Section 3</b>", table_cell), Paragraph("Role 3: Marketing Team (Campaign Hub, Auto-Timelines, Heatmaps & Reports)", table_cell)],
        [Paragraph("<b>Section 4</b>", table_cell), Paragraph("Role 4: Content Creator (AI Studio, Graphic Engine, Previews, Queue & Calendar)", table_cell)],
        [Paragraph("<b>Section 5</b>", table_cell), Paragraph("End-to-End Application Lifecycle & Workflow Architecture", table_cell)],
        [Paragraph("<b>Section 6</b>", table_cell), Paragraph("Technical Stack & Engineering Concepts (Frontend, Backend & DB Deep Dive)", table_cell)],
        [Paragraph("<b>Section 7</b>", table_cell), Paragraph("Live Demonstration Playbook & Evaluator Q&A Defenses", table_cell)]
    ]
    t_toc = Table(toc_data, colWidths=[80, 420])
    t_toc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BACKGROUND', (0,1), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # ==========================================
    # 2. ROLE 1: ADMINISTRATOR
    # ==========================================
    story.append(Paragraph("1. Administrator (Admin) Role", h1_style))
    story.append(Paragraph("<b>Role Purpose:</b> Full platform administration, organizational security, user account provisioning, content moderation compliance, and infrastructure telemetry monitoring.", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=CARD_BORDER, spaceAfter=10))

    admin_features = [
        ("1. User Governance & Provisioning (/admin/users)",
         "<b>Why it exists:</b> Administrators must manage all registered tenant accounts, assign role permissions, and handle credential resets or account deactivations.<br/>"
         "<b>How it works:</b> Fetches real accounts via <code>GET /api/v1/admin/users</code>. Admins can filter by role, search by name/email, change role privileges on the fly, and toggle user active/suspended states with instant backend sync."),
        
        ("2. Content Moderation & Compliance Console (/admin/content)",
         "<b>Why it exists:</b> Prevents policy violations, offensive content, or unauthorized social media dispatches before they hit live connected channels.<br/>"
         "<b>How it works:</b> Lists all drafted and scheduled posts across the entire platform. Admins can review post contents, platform targets, and attached media assets. Provides 1-click <b>Approve Post</b> or <b>Reject / Flag Post</b> with instant reason logging."),
        
        ("3. System Health & Infrastructure Telemetry (/admin/system-health)",
         "<b>Why it exists:</b> Ensures high availability, low API latency, and real-time visibility into database health and background worker execution.<br/>"
         "<b>How it works:</b> Queries <code>/api/v1/admin/system-health</code> to display live CPU uptime, memory consumption, active worker status, and database response latencies. Includes an immutable <b>Audit Logs Stream</b> tracking administrative actions."),
        
        ("4. System Security & Audit Trails (/admin/logs)",
         "<b>Why it exists:</b> Required for security governance and traceability of all high-privilege operations.<br/>"
         "<b>How it works:</b> Queries <code>/api/v1/logs</code> to render an immutable audit table capturing actor IDs, timestamps, client IPs, endpoints accessed, and HTTP response codes."),
        
        ("5. Global Platform Settings (/settings)",
         "<b>Why it exists:</b> Allows configuration of system-wide operating parameters, default themes, and notification preferences.<br/>"
         "<b>How it works:</b> Provides forms for security passwords, default posting intervals, and interface theme overrides.")
    ]

    for title, desc in admin_features:
        story.append(Paragraph(title, h2_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ==========================================
    # 3. ROLE 2: BUSINESS USER
    # ==========================================
    story.append(Paragraph("2. Business User (Business) Role", h1_style))
    story.append(Paragraph("<b>Role Purpose:</b> Dedicated corporate management for brand owners and agencies to manage social channel connections, subscription tiers, seat limits, and official invoice records.", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=CARD_BORDER, spaceAfter=10))

    biz_features = [
        ("1. Connected Social Channels & OAuth Integrations (/social-accounts)",
         "<b>Why it exists:</b> Businesses manage multiple external social brand accounts and need a unified dashboard to connect, verify, and refresh API tokens.<br/>"
         "<b>How it works:</b> Queries <code>/api/v1/social-accounts</code>. Supports linking Twitter/X, LinkedIn, Facebook, Instagram, YouTube, and Pinterest accounts with live connection badges, follower statistics, and instant disconnect/re-auth actions."),

        ("2. Enterprise Billing, Subscription & Quotas Hub (/billing)",
         "<b>Why it exists:</b> Restricted strictly to the Business role to manage enterprise SaaS plans, capacity boosters, billing cycles, and legal receipts without exposing billing controls to creators or admins.<br/>"
         "<b>How it works:</b><br/>"
         "• <b>Live Quota Meters:</b> Integrates with <code>/api/v1/social-accounts</code> and <code>/api/v1/posts</code> to render live progress gauges for channels used, monthly posts scheduled, team seats, and AI credits.<br/>"
         "• <b>Tier Switcher Modal:</b> Compare Starter ($29/mo), Growth ($59/mo), Business Scale ($99/mo), and Enterprise ($249/mo) with prorated billing.<br/>"
         "• <b>Billing Cycle Toggle:</b> Monthly vs Annual with real-time 20% discount recalculation.<br/>"
         "• <b>Modular Add-ons:</b> Toggle Extra Channels (+5 for $15/mo), AI Caption Booster (+1k for $20/mo), and Dedicated Support.<br/>"
         "• <b>Payment Wallet:</b> Manage stored credit cards with brand icons (Visa, Mastercard, Amex), default selectors, and secure CVV/ZIP forms.<br/>"
         "• <b>Invoices & Printable Receipts:</b> View itemized billing history, download CSVs, or open the corporate printable receipt modal with tax calculations."),

        ("3. Executive ROI & Performance Reports (/reports)",
         "<b>Why it exists:</b> Stakeholders and clients need high-level summaries of marketing campaign return-on-investment.<br/>"
         "<b>How it works:</b> Aggregates post performance data into executive audit summaries with dynamic metric charts and 1-click CSV/PDF downloads."),

        ("4. Strategic Campaigns & ROI Oversight (/campaigns)",
         "<b>Why it exists:</b> Allows business leaders to track high-level marketing spend versus engagement and reach targets.<br/>"
         "<b>How it works:</b> Visualizes campaign budget allocations, timeline progress bars, and audience targets.")
    ]

    for title, desc in biz_features:
        story.append(Paragraph(title, h2_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ==========================================
    # 4. ROLE 3: MARKETING TEAM
    # ==========================================
    story.append(Paragraph("3. Marketing Team (Marketing) Role", h1_style))
    story.append(Paragraph("<b>Role Purpose:</b> Planning and executing cross-channel campaigns, analyzing demographic reach, reviewing engagement heatmaps, and scheduling marketing distributions.", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=CARD_BORDER, spaceAfter=10))

    mktg_features = [
        ("1. Campaign Strategy & Auto-Timeline Hub (/campaigns)",
         "<b>Why it exists:</b> Marketing managers need to organize thematic content campaigns (e.g. 'Summer Product Launch') with start/end dates and budget allocations.<br/>"
         "<b>How it works:</b> Built with an automated timeline engine. Automatically evaluates dates against current time to categorize campaigns into <b>Active</b> (running now), <b>Upcoming</b> (future), or <b>Completed</b> (concluded). Features filter tabs with live item counters, quick Pause/Resume controls, and live timeline preview cards during creation."),

        ("2. Marketing Post Studio & Campaign Linking (/posts/create)",
         "<b>Why it exists:</b> Enables marketers to create multi-channel post drafts and tie them directly to ongoing campaign milestones.<br/>"
         "<b>How it works:</b> Allows selecting campaign tags, setting scheduled distribution times, and previewing layouts across social networks."),

        ("3. BI Analytics & Engagement Heatmaps (/analytics)",
         "<b>Why it exists:</b> Marketing teams need actionable insights into when their target audience is most active and which channels yield the highest ROI.<br/>"
         "<b>How it works:</b> Queries <code>/api/v1/analytics</code> to render interactive Recharts graphs, impressions vs reach trends, follower growth charts, and a 24x7 Best-Time-To-Post Heatmap."),

        ("4. Executive Reports & Performance Audits (/reports)",
         "<b>Why it exists:</b> Generates client-ready performance audits comparing multiple campaigns.<br/>"
         "<b>How it works:</b> Calculates campaign ROI scores, total impressions, cost-per-engagement, and exports clean CSV datasets."),

        ("5. Cross-Channel Content Calendar (/calendar)",
         "<b>Why it exists:</b> Visual calendar pipeline to identify scheduling gaps across weeks and months.<br/>"
         "<b>How it works:</b> Monthly/weekly interactive grid displaying scheduled posts with platform icons and quick preview flyouts.")
    ]

    for title, desc in mktg_features:
        story.append(Paragraph(title, h2_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ==========================================
    # 5. ROLE 4: CONTENT CREATOR
    # ==========================================
    story.append(Paragraph("4. Content Creator (Creator) Role", h1_style))
    story.append(Paragraph("<b>Role Purpose:</b> Creative studio workspace for drafting high-converting posts, generating AI captions and visuals, previewing live multi-network cards, and managing publishing queues.", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=CARD_BORDER, spaceAfter=10))

    creator_features = [
        ("1. Omnichannel Composer & Live Mockup Cards (/posts/create)",
         "<b>Why it exists:</b> Creators need to see exactly how their post will appear natively on Instagram, Facebook, X/Twitter, LinkedIn, YouTube, and Pinterest before scheduling.<br/>"
         "<b>How it works:</b> Live interactive mockups render platform-specific UI headers, verified badges, character count limiters, hashtag counters, and media attachments in real time."),

        ("2. Free AI Content Assistant (Pollinations Text AI)",
         "<b>Why it exists:</b> Eliminates writer's block by automatically drafting compelling copy, generating viral hooks, and writing optimized hashtags without requiring paid API keys.<br/>"
         "<b>How it works:</b> Integrated into the studio. Offers 1-click actions: <b>Generate Captions</b>, <b>Fix Grammar</b>, <b>Shorten/Expand</b>, <b>Professional/Casual Tone Shifter</b>, and <b>Hashtag Generator</b>."),

        ("3. Free AI Graphic Studio & Visual Generator (Pollinations Image Engine)",
         "<b>Why it exists:</b> Creators can generate high-resolution marketing visuals directly within the post composer.<br/>"
         "<b>How it works:</b> Enter an image prompt and select aspect ratios (Square 1:1, Landscape 16:9, Portrait 4:5, Story 9:16). The generated visual attaches instantly to the post mockup."),

        ("4. Live Trending News & Viral Quote Feeds",
         "<b>Why it exists:</b> Gives creators instant access to trending real-world industry topics.<br/>"
         "<b>How it works:</b> Connects to real HTTP endpoints to load top tech headlines (HackerNews) and inspiring quotes that can be inserted into the post with 1 click."),

        ("5. Post Drafts Vault (/drafts)",
         "<b>Why it exists:</b> Safe staging area for unfinished creative ideas.<br/>"
         "<b>How it works:</b> Saves drafts locally and in database. Easily promote drafts to scheduled publishing queues."),

        ("6. Publishing Queue & Interactive Timetable (/queue)",
         "<b>Why it exists:</b> Monitor the chronological queue of scheduled posts.<br/>"
         "<b>How it works:</b> Categorizes queue items by status (Scheduled, Published, Failed, Paused) with 1-click reschedule and delete actions."),

        ("7. Drag-and-Drop Editorial Calendar (/calendar)",
         "<b>Why it exists:</b> Visual calendar schedule planner.<br/>"
         "<b>How it works:</b> Monthly interactive grid allowing creators to visualize scheduled content and drag posts to new dates.")
    ]

    for title, desc in creator_features:
        story.append(Paragraph(title, h2_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ==========================================
    # 6. APPLICATION WORKFLOW & LIFECYCLE
    # ==========================================
    story.append(Paragraph("5. End-to-End Application Workflow & Lifecycle", h1_style))
    story.append(Paragraph("How data and user requests move through the SocialPilot ecosystem:", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=CARD_BORDER, spaceAfter=12))

    workflow_steps = [
        ("Step 1: Role Selection & Secure Registration",
         "Users register choosing their core persona (Creator, Marketing, Business, Admin). Passwords are encrypted using bcrypt hashing, and authenticated sessions issue signed JWT Bearer tokens."),
        ("Step 2: Social Account OAuth Connection",
         "Users/Businesses link target channels (Twitter, LinkedIn, Facebook, Instagram). Secure access tokens and profile handles are stored in the database."),
        ("Step 3: Studio Post Authoring & AI Generation",
         "Creators draft multi-channel posts, generate AI captions/graphics, inspect live mockup preview cards, and select target publishing dates/times."),
        ("Step 4: Scheduling & Automated Queue Pipeline",
         "Posts transition into the <code>Scheduled</code> state and are added to the publishing queue and editorial calendar matrix."),
        ("Step 5: Background Asynchronous Dispatch Engine",
         "A resilient background worker continuously polls for due posts, validates channel access tokens, dispatches content via platform APIs, and marks posts as <code>Published</code> with retry mechanisms."),
        ("Step 6: Real-Time BI Telemetry & Executive Audits",
         "Dispatched posts feed the analytics engine. Impressions, likes, comments, and reach are aggregated into interactive charts and downloadable executive reports.")
    ]

    for title, desc in workflow_steps:
        story.append(Paragraph(title, h2_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 10))

    # ==========================================
    # 7. TECHNICAL ARCHITECTURE & STACK
    # ==========================================
    story.append(Paragraph("6. Technology Stack & Engineering Concepts", h1_style))
    story.append(Paragraph("A breakdown of modern technologies and architectural patterns utilized across the platform:", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=CARD_BORDER, spaceAfter=10))

    tech_table_data = [
        [Paragraph("<b>Layer / Component</b>", table_header), Paragraph("<b>Technology Used</b>", table_header), Paragraph("<b>Key Architectural Purpose</b>", table_header)],
        [Paragraph("<b>Frontend Framework</b>", table_cell), Paragraph("Next.js 16 + React 19", table_cell), Paragraph("App Router, Server/Client components, dynamic routing, Turbopack builds.", table_cell)],
        [Paragraph("<b>Styling & UX</b>", table_cell), Paragraph("TailwindCSS + CSS Tokens", table_cell), Paragraph("Multi-theme palette (Dark, System, Peach, Cream), responsive glassmorphism, skeletons.", table_cell)],
        [Paragraph("<b>Data Visualization</b>", table_cell), Paragraph("Recharts Library", table_cell), Paragraph("Interactive area charts, bar graphs, and 24x7 engagement heatmaps.", table_cell)],
        [Paragraph("<b>API Communication</b>", table_cell), Paragraph("Axios Interceptors", table_cell), Paragraph("Automatic JWT Bearer injection, 401 redirect handling, and clean error messages.", table_cell)],
        [Paragraph("<b>Backend Engine</b>", table_cell), Paragraph("FastAPI (Python 3.11+)", table_cell), Paragraph("High-performance asynchronous REST endpoints, Swagger/OpenAPI documentation.", table_cell)],
        [Paragraph("<b>Relational Database</b>", table_cell), Paragraph("SQLite + SQLAlchemy ORM", table_cell), Paragraph("ACID transactions for users, posts, schedules, campaigns, and billing models.", table_cell)],
        [Paragraph("<b>NoSQL Data Store</b>", table_cell), Paragraph("Motor / PyMongo (MongoDB)", table_cell), Paragraph("Flexible document storage for media metadata and engagement logs.", table_cell)],
        [Paragraph("<b>Authentication & RBAC</b>", table_cell), Paragraph("JWT + Passlib Bcrypt", table_cell), Paragraph("Cryptographic token signing, password hashing, and strict role guards.", table_cell)],
        [Paragraph("<b>Background Dispatcher</b>", table_cell), Paragraph("Asyncio Background Worker", table_cell), Paragraph("Continuous polling worker with exponential backoff and dispatch simulator.", table_cell)]
    ]
    t_tech = Table(tech_table_data, colWidths=[110, 130, 260])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BACKGROUND', (0,1), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_tech)
    story.append(PageBreak())

    # ==========================================
    # 8. PRESENTATION PLAYBOOK & Q&A DEFENSES
    # ==========================================
    story.append(Paragraph("7. Presentation Delivery Playbook & Evaluator Q&A", h1_style))
    story.append(Paragraph("Key talking points and defense strategies to ace the project presentation:", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=CARD_BORDER, spaceAfter=10))

    tips = [
        ("1. How to Introduce the Project (30-second Elevator Pitch):",
         "<i>'Good morning/afternoon evaluators. SocialPilot is an enterprise multi-channel social media scheduler and campaign platform built for Infosys Springboard 7.0. Unlike basic schedulers, our system features complete Role-Based Access Control across four personas, free embedded AI caption and image generation, dynamic timeline campaign synchronization, and an enterprise billing and invoice suite.'</i>"),
        
        ("2. Demonstrating the 1-Click Role Switcher:",
         "Use the floating <b>Account Switcher</b> in the bottom-left corner to seamlessly authenticate as each real seeded persona (Admin, Business, Marketing, Creator) without manually logging in and out."),
        
        ("3. Key Features to Highlight During Live Demo:",
         "• <b>Admin:</b> Show User Governance and System Health uptime monitoring.<br/>"
         "• <b>Business:</b> Show the Billing Page with live resource quota gauges, monthly/annual tier toggle, and the printable corporate receipt.<br/>"
         "• <b>Marketing:</b> Show the Campaign Strategy Hub with auto-evaluating timeline badges (Active/Upcoming/Completed).<br/>"
         "• <b>Creator:</b> Open the Post Creator studio, trigger the AI Caption assistant, generate an AI visual, and show the live Instagram/Twitter preview card."),
        
        ("4. Anticipated Evaluator Questions & Winning Answers:",
         "• <b>Q: How is data security and role permission enforced?</b><br/>"
         "  <i>A: We enforce security at both layers: the backend verifies JWT token role claims on every endpoint, while the frontend DashboardShell and page-level guards prevent unauthorized route access.</i><br/>"
         "• <b>Q: How does the background scheduler handle failed dispatches?</b><br/>"
         "  <i>A: Our background publishing worker uses an automated publishing cycle with status updates and state tracking. Failed dispatches are flagged with error reasons for immediate creator inspection.</i><br/>"
         "• <b>Q: Why is billing restricted only to the Business role?</b><br/>"
         "  <i>A: In real-world enterprise architectures, content creators and system operators do not manage corporate payment cards or subscriptions. Separating billing to the Business Owner role guarantees financial privacy and organizational governance.</i>")
    ]

    for title, desc in tips:
        story.append(Paragraph(title, h2_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 4))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "SocialPilot_Enterprise_Project_Presentation.pdf"
    build_pdf(out_file)
