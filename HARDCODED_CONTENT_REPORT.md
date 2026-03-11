# Hard-Coded Content Report - Info Pages

This document identifies all hard-coded content found in informational pages that should be moved to translation files or configuration.

## 1. About Page (`src/pages/About.tsx`)

### Hard-Coded Text Strings (Lines 30-33, 49-70, 81-98, etc.)
- **SEO Title**: `"About AGROIT"` / `"AGROIT - ჩვენ შესახებ"`
- **SEO Description**: Long descriptions in English and Georgian
- **Breadcrumbs**: `"Home"` / `"მთავარი"`, `"About"` / `"ჩვენ შესახებ"`
- **Page Title**: `"About Us"` / `"ჩვენ შესახებ"`
- **Subtitle**: `"AGROIT - Leading provider of Italian quality agricultural equipment in Georgia"` / `"AGROIT - იტალიური ხარისხის აგროტექნიკის წამყვანი მომწოდებელი საქართველოში"`
- **Our Story Section**: Multiple paragraphs of hard-coded text (lines 85-98)
- **Our Team Section**: Description text (lines 116-119)
- **Our Values Section**: 
  - Quality description (lines 236-239)
  - Partnership description (lines 250-253)
  - Service description (lines 264-267)
- **Stats Section**: 
  - `"Satisfied Clients"` / `"კმაყოფილი კლიენტი"`
  - `"Years on the market"` / `"წელი ბაზარზე"`
  - `"Product Models"` / `"პროდუქტის მოდელი"`
  - `"Support"` / `"მხარდაჭერა"`
- **Stats Numbers**: `"500+"`, `"10"`, `"50+"`, `"24/7"` (hard-coded)

### Recommendation
Move all text strings to `src/data/translations.ts` under an `about` section.

---

## 2. Contact Page (`src/pages/Contact.tsx`)

### Hard-Coded Contact Information
- **Phone Numbers** (Lines 307-308):
  - `"+995 XXX XX XX XX"` (appears twice - placeholder numbers)
- **Email Addresses** (Lines 323-324):
  - `"info@agroit.ge"`
  - `"sales@agroit.ge"`
- **Address** (Line 338):
  - `"Tbilisi, Georgia"` / `"თბილისი, საქართველო"`
  - `"Showroom and Service Center"` / `"შოურუმი და სერვის ცენტრი"`
- **Business Hours** (Lines 353-355):
  - `"Monday - Saturday"` / `"ორშაბათი - შაბათი"`
  - `"9:00 - 18:00"`
  - `"24/7 Emergency Support"` / `"24/7 გადაუდებელი მხარდაჭერა"`
- **Working Hours Text** (Line 309):
  - `"Mon-Fri: 9:00-18:00"` / `"ორშ-შაბ: 9:00-18:00"`

### Hard-Coded Form Text
- **Form Labels & Placeholders**: Most use `t()` function but some hard-coded:
  - Placeholder: `"+995 XXX XX XX XX"` (line 215)
  - Placeholder: `"example@email.com"` (line 229)
- **Category Options** (Lines 246-260):
  - `"Vineyard Equipment"` / `"ვენახის ტექნიკა"`
  - `"Orchard Equipment"` / `"ხეხილის ტექნიკა"`
  - `"Nuts"` / `"კაკლოვანი"`
  - `"Service"` / `"სერვისი"`
  - `"Other"` / `"სხვა"`
- **Error Messages** (Lines 95, 123, 138):
  - `"Validation Error"` / `"ვალიდაციის შეცდომა"`
  - `"Success"` / `"წარმატება"`
  - `"Error"` / `"შეცდომა"`
- **SEO Content** (Lines 72-75):
  - Title and description strings

### Recommendation
1. Create a `contact` configuration object in `src/lib/config.ts` or similar for contact details
2. Move all text strings to `src/data/translations.ts`
3. Consider storing contact info in environment variables or Supabase config table

---

## 3. Blog Page (`src/pages/Blog.tsx`)

### Entirely Hard-Coded Content
**This entire page is hard-coded** (Lines 6-28):
- **Blog Posts Array**: Three hard-coded blog posts with:
  - Titles in Georgian only
  - Excerpts
  - Dates
  - Categories
  - Read times
- **Page Content** (Lines 36-120):
  - Breadcrumbs: `"მთავარი"`, `"ბლოგი"`
  - Page title: `"ბლოგი და სტატიები"`
  - Subtitle: Long description in Georgian
  - Newsletter section: All text in Georgian
  - Button text: `"წაიკითხეთ სრულად →"`, `"მეტის ჩატვირთვა"`

### Recommendation
**CRITICAL**: This page should be completely refactored to:
1. Use the database blog posts (like `Blogs.tsx` does)
2. Move all UI text to translations
3. Remove hard-coded blog post data

---

## 4. Success Stories Page (`src/pages/SuccessStories.tsx`)

### Hard-Coded Text Strings
- **SEO Content** (Lines 24-30, 44-46):
  - Title and description strings
  - Keywords
- **Loading/Error States** (Lines 103, 119, 128):
  - `"Loading success stories..."` / `"იტვირთება წარმატების ისტორიები..."`
  - `"Unable to Load Stories"` / `"ისტორიების ჩატვირთვა შეუძლებელია"`
  - `"Go Home"` / `"მთავარზე დაბრუნება"`
- **Breadcrumbs & Navigation** (Lines 149-150, 191-192):
  - `"Home"` / `"მთავარი"`
  - `"Success Stories"` / `"წარმატების ისტორიები"`
- **Section Headers** (Lines 161, 164, 203, 206, 224, 255, 287, 305, 364):
  - `"Customer Success"` / `"მომხმარებლების წარმატება"`
  - `"Featured"` / `"გამორჩეული"`
  - `"Read full story"` / `"წაიკითხეთ სრული ისტორია"`
  - `"All Success Stories"` / `"ყველა წარმატების ისტორია"`
- **CTA Section** (Lines 382-399):
  - `"Ready to write your success story?"` / `"მზად ხართ დაწეროთ თქვენი წარმატების ისტორია?"`
  - `"Get in touch"` / `"დაგვიკავშირდით"`
  - `"Browse equipment"` / `"დაათვალიერეთ აღჭურვილობა"`

### Recommendation
Move all text strings to `src/data/translations.ts` under a `successStories` section.

---

## 5. Footer Component (`src/components/Footer.tsx`)

### Hard-Coded Contact Info (Lines 133-147)
- Phone: `"+995 XXX XX XX XX"`
- Email: `"info@agroit.ge"`
- Address: `"Tbilisi, Georgia"` / `"თბილისი, საქართველო"`
- Hours: `"Mon-Sat: 9:00-18:00"` / `"ორშ-შაბ: 9:00-18:00"`

### Recommendation
Same as Contact page - move to shared config/translations.

---

## Summary of Issues

### Critical Issues
1. **Blog.tsx** - Entirely hard-coded, not using database
2. **Contact Info** - Duplicated across Contact page and Footer
3. **Stats Numbers** - Hard-coded in About page (should be configurable)

### High Priority
1. **About Page** - Extensive hard-coded text (should use translations)
2. **Contact Page** - Contact details should be in config
3. **Success Stories** - Many hard-coded strings

### Medium Priority
1. **SEO Metadata** - Some hard-coded in page components (already partially handled via metadata files)

---

## Recommended Actions

1. **Create contact configuration file**: `src/lib/contactConfig.ts`
   - Store phone numbers, emails, address, hours
   - Can be environment variables or config object

2. **Expand translations.ts**: Add missing sections:
   - `about` (expand existing)
   - `contact` (new)
   - `successStories` (new)
   - `blog` (new)

3. **Refactor Blog.tsx**: 
   - Remove hard-coded posts
   - Use database like `Blogs.tsx` does
   - Add proper translations

4. **Create stats config**: `src/lib/statsConfig.ts`
   - Make About page stats configurable

5. **Consolidate contact info**: 
   - Single source of truth for contact details
   - Used by both Contact page and Footer


