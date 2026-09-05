/**
 * Sanity.io Client Integration & Dynamic DOM Hydration
 * Project: Protfolio (0bb2mgpi)
 * Dataset: production
 * 
 * Preserves 100% of the CSS styling, layout, and 300-frame canvas scroll animation.
 * Features automatic fallback: if Sanity data is not yet published, the original HTML stays intact.
 */

(function () {
  'use strict';

  const SANITY_CONFIG = {
    projectId: '0bb2mgpi',
    dataset: 'production',
    apiVersion: '2023-05-03',
    useCdn: true,
  };

  /**
   * Helper to convert Sanity image objects/references into CDN URLs
   */
  function urlFor(source, options = {}) {
    if (!source) return null;
    let ref = '';

    if (typeof source === 'string') {
      ref = source;
    } else if (source.asset && source.asset._ref) {
      ref = source.asset._ref;
    } else if (source._ref) {
      ref = source._ref;
    } else if (source.url) {
      return source.url;
    }

    if (!ref || !ref.startsWith('image-')) return null;

    // Pattern: image-<assetId>-<dimensions>-<extension>
    const parts = ref.split('-');
    if (parts.length < 4) return null;

    const assetId = parts[1];
    const dimensions = parts[2];
    const format = parts[3];

    let url = `https://cdn.sanity.io/images/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${assetId}-${dimensions}.${format}`;

    const params = [];
    if (options.width) params.push(`w=${options.width}`);
    if (options.height) params.push(`h=${options.height}`);
    if (options.fit) params.push(`fit=${options.fit}`);
    params.push('auto=format');

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return url;
  }

  /**
   * Hydrates Site Settings (Hero, Rotator, Philosophy, About, Impact, Stats, Contact)
   */
  function hydrateSiteSettings(settings) {
    if (!settings) return;

    // Salutation & Greeting
    if (settings.greeting) {
      const salutationEl = document.querySelector('.hero-left-col .salutation');
      if (salutationEl) salutationEl.textContent = settings.greeting;
    }

    // Dynamic Rotator Roles
    if (Array.isArray(settings.roles) && settings.roles.length > 0) {
      const rotatorEl = document.querySelector('.title-rotator');
      if (rotatorEl) {
        rotatorEl.innerHTML = settings.roles
          .map((role, idx) => {
            const formatted = role.replace(' ', '<br>');
            return `<span class="title-item ${idx === 0 ? 'active' : ''}">${formatted}</span>`;
          })
          .join('');
      }
    }

    // Hero Philosophy
    if (settings.philosophyTitle) {
      const pTitle = document.querySelector('.hero-right-col .philosophy-title');
      if (pTitle) pTitle.textContent = settings.philosophyTitle;
    }
    if (settings.philosophyDesc || settings.heroLead) {
      const descEl = document.querySelector('.hero-right-col .philosophy-desc');
      if (descEl) descEl.textContent = settings.philosophyDesc || settings.heroLead;
    }

    // Companies Heading
    if (settings.companiesHeading) {
      const headingEl = document.getElementById('brands-heading');
      if (headingEl) headingEl.textContent = settings.companiesHeading;
    }

    // Behind the Quality (About)
    if (settings.about) {
      if (settings.about.tag) {
        const tagEl = document.querySelector('.behind-tag');
        if (tagEl) tagEl.textContent = settings.about.tag;
      }
      if (settings.about.headline) {
        const headlineEl = document.querySelector('.behind-headline');
        if (headlineEl) headlineEl.innerHTML = settings.about.headline.replace(/\n/g, '<br>');
      }
      if (settings.about.statement) {
        const stmtEl = document.querySelector('.behind-statement');
        if (stmtEl) stmtEl.textContent = settings.about.statement;
      }
      if (settings.about.ctaSubtext) {
        const ctaSubEl = document.querySelector('.behind-cta-subtext');
        if (ctaSubEl) ctaSubEl.textContent = settings.about.ctaSubtext;
      }
    }

    // Impact Spotlight Banner
    if (settings.impact) {
      if (settings.impact.roleBadge) {
        const badgeEl = document.querySelector('.impact-role-badge span:last-child');
        if (badgeEl) badgeEl.textContent = settings.impact.roleBadge;
      }
      if (settings.impact.title) {
        const titleEl = document.querySelector('.impact-title');
        if (titleEl) titleEl.textContent = settings.impact.title;
      }
      if (settings.impact.subtitle) {
        const subEl = document.querySelector('.impact-subtitle');
        if (subEl) subEl.textContent = settings.impact.subtitle;
      }
      if (settings.impact.footerNote) {
        const footerEl = document.querySelector('.impact-footer-text');
        if (footerEl) footerEl.innerHTML = `<strong>What this means for your business:</strong> ${settings.impact.footerNote.replace(/^What this means for your business:\s*/i, '')}`;
      }
    }

    // Stats
    if (settings.stats) {
      const statEls = document.querySelectorAll('.stat-number, .impact-stat-val');
      if (statEls.length >= 4) {
        if (settings.stats.experienceHours) statEls[0].textContent = settings.stats.experienceHours;
        if (settings.stats.projectsDelivered) statEls[1].textContent = settings.stats.projectsDelivered;
        if (settings.stats.successRate) statEls[2].textContent = settings.stats.successRate;
        if (settings.stats.clientSatisfaction) statEls[3].textContent = settings.stats.clientSatisfaction;
      }
    }

    // Contact
    if (settings.contact) {
      if (settings.contact.title) {
        const cTitle = document.querySelector('.contact-title');
        if (cTitle) cTitle.textContent = settings.contact.title;
      }
      if (settings.contact.description) {
        const cDesc = document.querySelector('.contact-desc');
        if (cDesc) cDesc.textContent = settings.contact.description;
      }
      if (settings.contact.email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
          el.href = `mailto:${settings.contact.email}`;
          const span = el.querySelector('span');
          if (span && span.textContent.includes('@')) {
            span.textContent = settings.contact.email;
          }
        });
      }
      if (settings.contact.linkedinUrl) {
        document.querySelectorAll('a[href*="linkedin.com"]').forEach(el => {
          el.href = settings.contact.linkedinUrl;
        });
      }
      if (settings.contact.githubUrl) {
        document.querySelectorAll('a[href*="github.com/MusfiqurRahman12"]').forEach(el => {
          el.href = settings.contact.githubUrl;
        });
      }
    }
  }

  const ICON_PRESETS = {
    circle: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
    hourglass: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12l-6 8 6 8H6l6-8-6-8z"/></svg>',
    shield: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 3v18A9 9 0 0 0 12 3z" fill="currentColor"/></svg>',
    health: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-7 17.14L19.14 5A9.95 9.95 0 0 0 12 2zm7 17.14A10 10 0 0 0 12 22a9.95 9.95 0 0 0 7.14-2.86z"/></svg>',
    star: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    building: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18M9 21V9"/></svg>',
    diamond: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'
  };

  /**
   * Hydrates Companies & Teams Marquee
   */
  function hydrateCompanies(companies) {
    if (!Array.isArray(companies) || companies.length === 0) return;
    const track = document.getElementById('brands-track');
    if (!track) return;

    function renderItem(c, isAriaHidden = false) {
      let iconHtml = '';
      if (c.iconType === 'custom-image' && c.logoImage) {
        const imgUrl = urlFor(c.logoImage, { height: 24 });
        iconHtml = `<img src="${imgUrl}" alt="${c.name}" style="height: 22px; width: auto; object-fit: contain; filter: brightness(0) invert(1);">`;
      } else if (c.iconType === 'custom-svg' && c.svgCode) {
        iconHtml = c.svgCode;
      } else {
        iconHtml = ICON_PRESETS[c.iconType] || ICON_PRESETS.circle;
      }

      return `
      <div class="brand-item" ${isAriaHidden ? 'aria-hidden="true"' : ''}>
        ${iconHtml}
        <span>${c.name}</span>
      </div>`;
    }

    // Duplicate list for seamless infinite loop
    const primaryHtml = companies.map(c => renderItem(c, false)).join('');
    const duplicateHtml = companies.map(c => renderItem(c, true)).join('');

    track.innerHTML = primaryHtml + duplicateHtml;
  }

  /**
   * Hydrates Services
   */
  function hydrateServices(services) {
    if (!Array.isArray(services) || services.length === 0) return;

    const grid = document.querySelector('.services-grid');
    if (!grid) return;

    grid.innerHTML = services
      .map((svc, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const deliverablesHtml = Array.isArray(svc.deliverables)
          ? svc.deliverables.map(d => `<li><svg class="service-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>${d}</span></li>`).join('')
          : '';

        return `
        <div class="service-card">
          <div>
            <div class="service-card-top">
              <div class="service-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                  <line x1="14" y1="4" x2="10" y2="20"/>
                </svg>
              </div>
              <span class="service-card-num">${num}</span>
            </div>
            <h3 class="service-card-title">${svc.title}</h3>
            ${svc.description ? `<p class="service-card-desc">${svc.description}</p>` : ''}
            ${deliverablesHtml ? `<ul class="service-features-list">${deliverablesHtml}</ul>` : ''}
          </div>
        </div>`;
      })
      .join('');
  }

  /**
   * Helper to categorize projects into filter slugs
   */
  function getProjectCategorySlug(category) {
    if (!category) return 'ai-qa';
    const lower = category.toLowerCase();
    if (lower.includes('ai') || lower.includes('e2e') || lower.includes('automation')) return 'ai-qa';
    if (lower.includes('wordpress') || lower.includes('plugin') || lower.includes('security') || lower.includes('cta')) return 'wordpress';
    if (lower.includes('api') || lower.includes('load') || lower.includes('performance') || lower.includes('pixel') || lower.includes('qa')) return 'enterprise-qa';
    return 'ai-qa';
  }

  /**
   * Hydrates Interactive Shuffling Projects Gallery
   */
  function hydrateProjects(projects) {
    if (!Array.isArray(projects) || projects.length === 0) return;

    const grid = document.getElementById('projects-gallery-grid');
    if (!grid) return;

    // Build project cards
    grid.innerHTML = projects
      .map(proj => {
        const imgUrl = urlFor(proj.coverImage, { width: 1000 }) || 'assets/card-ai.webp';
        const catSlug = getProjectCategorySlug(proj.category);
        const liveDemoBtn = proj.liveUrl
          ? `<a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="card-action-btn primary">Live Demo ↗</a>`
          : '';
        const githubBtn = proj.githubUrl
          ? `<a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="card-action-btn outline">GitHub →</a>`
          : '';

        return `
        <article class="gallery-card" data-category="${catSlug}">
          <div class="gallery-card-media">
            <img src="${imgUrl}" alt="${proj.title}" loading="lazy">
            <div class="gallery-card-badge-row">
              <span class="gallery-cat-badge">${proj.category || 'PROJECT'}</span>
            </div>
          </div>
          <div class="gallery-card-info">
            <div class="gallery-card-main">
              <h3 class="gallery-card-title">${proj.title}</h3>
              <p class="gallery-card-desc">${proj.description || ''}</p>
            </div>
            <div class="gallery-card-actions">
              ${liveDemoBtn}
              ${githubBtn || (!liveDemoBtn ? `<a href="https://github.com/MusfiqurRahman12" target="_blank" rel="noopener noreferrer" class="card-action-btn outline">View Project →</a>` : '')}
            </div>
          </div>
        </article>`;
      })
      .join('');

    // Update filter counts
    const cards = Array.from(grid.querySelectorAll('.gallery-card'));
    const totalCount = cards.length;
    const aiCount = cards.filter(c => c.dataset.category === 'ai-qa').length;
    const wpCount = cards.filter(c => c.dataset.category === 'wordpress').length;
    const qaCount = cards.filter(c => c.dataset.category === 'enterprise-qa').length;

    const countAllEl = document.getElementById('count-all');
    if (countAllEl) countAllEl.textContent = totalCount;
    const countAiEl = document.getElementById('count-ai');
    if (countAiEl) countAiEl.textContent = aiCount;
    const countWpEl = document.getElementById('count-wp');
    if (countWpEl) countWpEl.textContent = wpCount;
    const countQaEl = document.getElementById('count-qa');
    if (countQaEl) countQaEl.textContent = qaCount;

    // Attach interactive filter tabs
    const filterTabs = document.querySelectorAll('#project-filters .filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;

        // Shuffle micro-animation
        cards.forEach(card => card.classList.add('is-shuffling'));

        setTimeout(() => {
          cards.forEach(card => {
            const cardCat = card.dataset.category;
            if (filter === 'all' || cardCat === filter) {
              card.classList.remove('is-hidden');
            } else {
              card.classList.add('is-hidden');
            }
            card.classList.remove('is-shuffling');
          });
        }, 160);
      });
    });

    // Attach Shuffle button
    const shuffleBtn = document.getElementById('gallery-shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        cards.forEach(c => c.classList.add('is-shuffling'));

        setTimeout(() => {
          // Fisher-Yates shuffle array of cards
          const visibleCards = cards.filter(c => !c.classList.contains('is-hidden'));
          const parent = grid;
          for (let i = visibleCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            parent.appendChild(visibleCards[j]);
          }
          cards.forEach(c => c.classList.remove('is-shuffling'));
        }, 200);
      });
    }
  }

  /**
   * Hydrates Professional Experience Timeline
   */
  function hydrateExperience(experience) {
    if (!Array.isArray(experience) || experience.length === 0) return;

    const timeline = document.querySelector('.experience-timeline');
    if (!timeline) return;

    timeline.innerHTML = experience
      .map(exp => {
        const bulletsHtml = Array.isArray(exp.achievements)
          ? exp.achievements.map(a => `<li>${a}</li>`).join('')
          : '';

        const locationSuffix = exp.location ? ` · ${exp.location}` : '';

        return `
        <div class="exp-card">
          <div class="exp-header">
            <div class="exp-role-company">
              <h3 class="exp-role">${exp.role}</h3>
              <span class="exp-company">${exp.company}${locationSuffix}</span>
            </div>
            <span class="exp-period">${exp.period || ''}</span>
          </div>
          ${bulletsHtml ? `<ul class="exp-bullets">${bulletsHtml}</ul>` : ''}
        </div>`;
      })
      .join('');
  }

  const SKILL_ICONS = {
    test: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
    api: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    ui: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    workflow: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.2z"/></svg>'
  };

  /**
   * Hydrates Skills & Stack Matrix
   */
  function hydrateSkills(skills) {
    if (!Array.isArray(skills) || skills.length === 0) return;

    const grid = document.querySelector('.skills-grid');
    if (!grid) return;

    grid.innerHTML = skills
      .map(cat => {
        const iconSvg = SKILL_ICONS[cat.iconType] || SKILL_ICONS.test;
        const pillsHtml = Array.isArray(cat.skills)
          ? cat.skills.map(s => `<span class="skill-pill">${s}</span>`).join('')
          : '';

        return `
        <div class="skill-card">
          <div class="skill-icon-badge">
            ${iconSvg}
          </div>
          <h3 class="skill-cat-title">${cat.title}</h3>
          <div class="skill-pills-wrap">
            ${pillsHtml}
          </div>
        </div>`;
      })
      .join('');
  }

  /**
   * Hydrates Certifications
   */
  function hydrateCertifications(certs) {
    if (!Array.isArray(certs) || certs.length === 0) return;

    const grid = document.querySelector('.certs-grid');
    if (!grid) return;

    grid.innerHTML = certs
      .map(cert => {
        return `
        <div class="cert-card">
          <div class="cert-top">
            <span class="cert-issuer">${cert.issuer || ''}</span>
            <h3 class="cert-name">${cert.title}</h3>
            <p class="cert-desc">${cert.description || ''}</p>
          </div>
        </div>`;
      })
      .join('');
  }

  /**
   * Hydrates Education
   */
  function hydrateEducation(education) {
    if (!Array.isArray(education) || education.length === 0) return;

    const grid = document.querySelector('.education-grid');
    if (!grid) return;

    grid.innerHTML = education
      .map(edu => {
        return `
        <div class="edu-card">
          <div class="edu-left">
            <h4 class="edu-degree">${edu.degree}</h4>
            <span class="edu-inst">${edu.institution}</span>
          </div>
          <span class="edu-year">${edu.period || ''}</span>
        </div>`;
      })
      .join('');
  }

  /**
   * Main fetch and hydration flow
   */
  async function initSanity() {
    const query = `{
      "siteSettings": *[_type == "siteSettings"][0],
      "companies": *[_type == "company"] | order(order asc),
      "services": *[_type == "service"] | order(order asc),
      "projects": *[_type == "project"] | order(order asc),
      "experience": *[_type == "experience"] | order(order asc),
      "skills": *[_type == "skillCategory"] | order(order asc),
      "certifications": *[_type == "certification"] | order(order asc),
      "education": *[_type == "education"] | order(order asc)
    }`;

    const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.info('[Sanity] API responded with status', response.status, '- maintaining existing fallback content.');
        return;
      }

      const { result } = await response.json();
      if (!result) return;

      if (result.siteSettings) {
        hydrateSiteSettings(result.siteSettings);
      }
      if (Array.isArray(result.companies) && result.companies.length > 0) {
        hydrateCompanies(result.companies);
      }
      if (Array.isArray(result.services) && result.services.length > 0) {
        hydrateServices(result.services);
      }
      if (Array.isArray(result.projects) && result.projects.length > 0) {
        hydrateProjects(result.projects);
      }
      if (Array.isArray(result.experience) && result.experience.length > 0) {
        hydrateExperience(result.experience);
      }
      if (Array.isArray(result.skills) && result.skills.length > 0) {
        hydrateSkills(result.skills);
      }
      if (Array.isArray(result.certifications) && result.certifications.length > 0) {
        hydrateCertifications(result.certifications);
      }
      if (Array.isArray(result.education) && result.education.length > 0) {
        hydrateEducation(result.education);
      }

      console.log('✨ [Sanity] Content dynamically synchronized from Content Lake (Project: 0bb2mgpi)');
    } catch (err) {
      console.info('[Sanity] Offline or unconfigured dataset — maintaining fallback content.', err.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSanity);
  } else {
    initSanity();
  }
})();
