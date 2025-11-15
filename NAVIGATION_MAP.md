# 🗺️ Learning Center Navigation Map

## Site Structure

```
Lien Professor App
│
├── 🏠 Home (/)
├── 📋 Assessment (/assessment)
├── 📦 Lien Kits (/kits)
├── 👤 Dashboard (/dashboard)
│
└── 📚 LEARN (/learn) ← NEW!
    │
    ├── 🏛️ Index/Hub Page
    │   └── Displays all articles organized by category
    │
    ├── 📖 Getting Started
    │   ├── What is a Mechanics Lien? ✅
    │   ├── Who Can File a Lien? ✅
    │   └── What is a Pre-Lien Notice? ✅ (MUST READ)
    │
    ├── 🏘️ Property Types
    │   └── Residential vs. Commercial ✅ (MUST READ)
    │
    ├── ⏰ Process & Deadlines
    │   ├── Critical Deadlines ⏳
    │   ├── Filing Process Overview ⏳
    │   └── Enforcement & Foreclosure ⏳
    │
    └── 💰 Special Topics
        └── Payment Bond Claims ⏳
```

---

## Navigation Access Points

### 1. **Header Dropdown Menu**
```
Top Navigation Bar
└── "Learn" ▼
    ├── What is a Mechanics Lien?
    ├── Who Can File a Lien?
    ├── Pre-Lien Notice
    └── Residential vs Commercial
```

**Location:** Always visible at top of screen  
**Accessibility:** Click or hover on "Learn"

---

### 2. **Sidebar Navigation** (On Article Pages)
```
Left Sidebar
├── 📚 Learning Center
│
├── GETTING STARTED
│   ├── 📖 What is a Mechanics Lien?
│   ├── 📄 Who Can File a Lien?
│   └── 🔔 Pre-Lien Notice ★
│
├── PROPERTY TYPES
│   └── 🏘️ Residential vs Commercial ★
│
├── PROCESS & DEADLINES
│   ├── ⏰ Critical Deadlines (coming soon)
│   ├── ✅ Filing Process (coming soon)
│   └── ⚖️ Enforcement (coming soon)
│
├── SPECIAL TOPICS
│   └── 💵 Payment Bonds (coming soon)
│
└── [CTA: Start Assessment]
```

**Location:** Left side on all `/learn/*` pages  
**Behavior:** Sticky, scrolls with page  
**Active Indicator:** Highlighted when on that page

---

### 3. **Index Page Cards** (/learn)
```
Hero Section
└── [Start Assessment] [Start Learning] buttons

Category Sections (Grid Layout)
├── Getting Started (3 article cards)
├── Property Types (1 article card)
├── Process & Deadlines (3 article cards - coming soon)
└── Special Topics (1 article card - coming soon)

Each Card Shows:
├── Icon
├── Title
├── Description
├── Read time
├── Badges (Must Read / Coming Soon)
└── [Read More →] or "Coming Soon"
```

---

### 4. **Related Articles** (Bottom of Each Article)
```
End of Article Content
└── Related Articles
    ├── Article Card 1 → [Link]
    ├── Article Card 2 → [Link]
    └── Article Card 3 → [Link]
```

---

## User Journey Example

### Scenario: New user wants to learn about liens

```
1. User visits homepage (/)
   ↓
2. Sees "Learn" in header
   ↓
3. Clicks "Learn" dropdown
   ↓
4. Sees 4 featured articles
   ↓
5. Clicks "What is a Mechanics Lien?"
   ↓
6. Reads article with sidebar visible
   ↓
7. Clicks "Who Can File?" in sidebar
   ↓
8. Reads article, sees CTA
   ↓
9. Clicks "Start Your Assessment"
   ↓
10. Begins assessment flow (/assessment)
```

---

## Mobile Navigation

### Header (Mobile)
```
☰ Menu
└── Learn ▼
    ├── What is a Mechanics Lien?
    ├── Who Can File?
    └── [more items...]
```

### Sidebar (Mobile)
- Collapses to top on small screens
- Can be toggled open/closed
- Maintains same structure

---

## Visual Indicators

### Active States:
- **Active Page:** Blue/brand background in sidebar
- **Hover State:** Light gray background
- **Featured Articles:** "Must Read" badge
- **Coming Soon:** Gray badge, disabled link

### Icons Used:
- 📖 BookOpen - What is a Lien
- 📄 FileText - Who Can File
- 🔔 Bell - Pre-Lien Notice
- 🏘️ Home/Building2 - Residential vs Commercial
- ⏰ Clock - Deadlines
- ✅ CheckCircle - Process
- ⚖️ Scale - Enforcement
- 💵 DollarSign - Payment Bonds

---

## URLs Reference

```
/learn                              → Index/Hub
/learn/what-is-a-lien              → Article 1 ✅
/learn/who-can-file                → Article 2 ✅
/learn/preliminary-notice          → Article 3 ✅
/learn/residential-vs-commercial   → Article 4 ✅
/learn/deadlines                   → Coming Soon
/learn/filing-process              → Coming Soon
/learn/enforcement                 → Coming Soon
/learn/payment-bonds               → Coming Soon
```

---

## Integration Points

### From Learning Center TO:
- `/assessment` - Primary CTA throughout
- `/kits` - Secondary CTA on index
- `/` - Logo/home link
- Other articles - Related links

### FROM Other Pages TO Learning Center:
- **Header:** "Learn" dropdown (all pages)
- **Landing Page:** Could add "Learn More" section
- **Assessment:** Could link to articles for context
- **Dashboard:** Could suggest relevant articles

---

## Best Practices for Users

### Reading Path (Recommended):
1. Start at `/learn` (index)
2. Read "What is a Mechanics Lien?" first
3. Then "Who Can File a Lien?"
4. Then "Pre-Lien Notice" (critical)
5. Then "Residential vs Commercial"
6. Complete assessment when ready

### Quick Access:
- Bookmark `/learn` for quick access
- Use sidebar to jump between articles
- Related articles at bottom of each page

---

## Future Enhancements

### Planned:
- [ ] Search within learn section
- [ ] Breadcrumb navigation
- [ ] Progress indicator (articles read)
- [ ] Bookmark favorite articles
- [ ] Print-friendly view
- [ ] Share buttons (social media)
- [ ] Comments/feedback system

### Navigation Improvements:
- [ ] "Next Article" button at bottom
- [ ] "Previous Article" button
- [ ] Keyboard shortcuts (← → arrows)
- [ ] Table of contents within articles
- [ ] Jump-to-section links

---

## 🎯 Navigation Goals Achieved

✅ **Discoverable:** Easy to find from header  
✅ **Organized:** Clear categories and hierarchy  
✅ **Accessible:** Multiple access points  
✅ **Intuitive:** Clear labels and icons  
✅ **Persistent:** Sidebar always available  
✅ **Responsive:** Works on all screen sizes  
✅ **Branded:** Consistent design language  

---

This navigation structure ensures users can easily find, read, and navigate between educational articles while maintaining clear paths to conversion points (assessment and lien kits).
