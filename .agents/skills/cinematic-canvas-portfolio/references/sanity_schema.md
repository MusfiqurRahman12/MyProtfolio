# Sanity.io CMS Schemas & Hydration Strategy

This reference documents the Sanity schema structures and the zero-dependency, fallback-safe client hydration pattern.

---

## 1. Sanity Document Schemas

### `siteSettings` (Singleton)
```javascript
export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'fullName', type: 'string', title: 'Full Name' },
    { name: 'greeting', type: 'string', title: 'Hero Greeting' },
    { name: 'roles', type: 'array', of: [{ type: 'string' }], title: 'Rotating Hero Roles' },
    { name: 'philosophyTitle', type: 'string', title: 'Philosophy Title' },
    { name: 'philosophyDesc', type: 'text', title: 'Philosophy Description' },
    { name: 'companiesHeading', type: 'string', title: 'Brands Section Heading' },
    {
      name: 'about',
      type: 'object',
      title: 'About Section',
      fields: [
        { name: 'tag', type: 'string' },
        { name: 'headline', type: 'string' },
        { name: 'statement', type: 'text' },
        { name: 'ctaSubtext', type: 'string' }
      ]
    },
    {
      name: 'impact',
      type: 'object',
      title: 'Leadership & Financial Scale',
      fields: [
        { name: 'roleBadge', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'text' },
        { name: 'hours', type: 'string' },
        { name: 'projectValue', type: 'string' },
        { name: 'rateSpectrum', type: 'string' },
        { name: 'accountability', type: 'string' },
        { name: 'footerNote', type: 'text' }
      ]
    },
    {
      name: 'contact',
      type: 'object',
      title: 'Contact Information',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'email', type: 'string' },
        { name: 'linkedinUrl', type: 'url' },
        { name: 'githubUrl', type: 'url' },
        { name: 'location', type: 'string' }
      ]
    }
  ]
};
```

### `project` (Portfolio Work)
```javascript
export default {
  name: 'project',
  title: 'Projects',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Project Title' },
    { name: 'category', type: 'string', title: 'Category (e.g. AI & QA Tool, WordPress)' },
    { name: 'description', type: 'text', title: 'Short Description' },
    { name: 'coverImage', type: 'image', title: 'Cover Image', options: { hotspot: true } },
    { name: 'githubUrl', type: 'url', title: 'GitHub Repository URL' },
    { name: 'liveUrl', type: 'url', title: 'Live Demo URL' },
    { name: 'highlights', type: 'array', of: [{ type: 'string' }], title: 'Bullet Highlights' },
    { name: 'order', type: 'number', title: 'Sort Order' }
  ]
};
```

### `service` (Services Provided)
```javascript
export default {
  name: 'service',
  title: 'Services',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Service Title' },
    { name: 'description', type: 'text', title: 'Description' },
    { name: 'badge', type: 'string', title: 'Badge Label' },
    { name: 'deliverables', type: 'array', of: [{ type: 'string' }], title: 'Deliverables List' },
    { name: 'order', type: 'number', title: 'Sort Order' }
  ]
};
```

---

## 2. All-in-One GROQ Query

```groq
{
  "siteSettings": *[_type == "siteSettings"][0],
  "companies": *[_type == "company"] | order(order asc),
  "services": *[_type == "service"] | order(order asc),
  "projects": *[_type == "project"] | order(order asc),
  "experience": *[_type == "experience"] | order(order asc),
  "skills": *[_type == "skillCategory"] | order(order asc),
  "certifications": *[_type == "certification"] | order(order asc),
  "education": *[_type == "education"] | order(order asc)
}
```

---

## 3. Fallback Hydration Principle

* **Rule**: The HTML must be completely written with rich default static content.
* When the client script runs, it fetches the query.
* If Sanity returns data, it selectively updates DOM innerHTML/textContent without disturbing layout structure or CSS classes.
* If the user is offline, CORS fails, or Sanity is unpopulated, `catch (err)` fires quietly: the site works 100% without flickering or empty placeholders.
