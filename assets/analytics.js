(function () {
  'use strict';

  // Requires gtag.js to be loaded on the page.
  // All events use GA4 recommended event names where applicable.

  function track(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }

  // -- CV download ----------------------------------------------------------
  document.querySelectorAll('a[href*="CV"][href$=".pdf"]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('file_download', {
        file_name: 'Reuben-Stone-CV-2026.pdf',
        file_extension: 'pdf',
        link_text: a.textContent.trim()
      });
    });
  });

  // -- Email clicks ---------------------------------------------------------
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('contact_click', {
        method: 'email',
        link_text: a.textContent.trim()
      });
    });
  });

  // -- External link clicks -------------------------------------------------
  document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;

    // Skip mailto (handled above) and non-http links
    if (!/^https?:\/\//.test(href)) return;

    // Determine a label from the URL
    var label = 'other';
    if (/github\.com/.test(href)) label = 'github';
    else if (/linkedin\.com/.test(href)) label = 'linkedin';
    else if (/lumi\.livana\.io/.test(href)) label = 'lumi';
    else if (/livana\.io/.test(href)) label = 'livana';
    else if (/universalpictures\.com/.test(href)) label = 'universal_pictures';
    else if (/focusfeatures\.com/.test(href)) label = 'focus_features';
    else if (/tsttalent\.com/.test(href)) label = 'tst_genai';
    else if (/wearetst\.com/.test(href)) label = 'tst_about';
    else if (/scopenegotiator\.com/.test(href)) label = 'scope_negotiator';
    else if (/stridestriking\.com/.test(href)) label = 'stride_striking';
    else if (/apps\.apple\.com/.test(href)) label = 'app_store';

    a.addEventListener('click', function () {
      track('outbound_click', {
        link_url: href,
        link_label: label,
        link_text: a.textContent.trim()
      });
    });
  });

  // -- Project link clicks (internal case study / work links) ---------------
  document.querySelectorAll('.project-link:not([target="_blank"])').forEach(function (a) {
    a.addEventListener('click', function () {
      track('project_click', {
        link_url: a.getAttribute('href'),
        link_text: a.textContent.trim()
      });
    });
  });

  // -- Article clicks (writing index) ---------------------------------------
  document.querySelectorAll('.writing-entry a').forEach(function (a) {
    a.addEventListener('click', function () {
      var title = a.querySelector('.writing-title');
      track('article_click', {
        link_url: a.getAttribute('href'),
        article_title: title ? title.textContent.trim() : a.textContent.trim()
      });
    });
  });

  // -- Section scroll tracking (homepage) -----------------------------------
  var sections = document.querySelectorAll('section[id]');
  if (sections.length > 0 && 'IntersectionObserver' in window) {
    var viewed = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !viewed[entry.target.id]) {
          viewed[entry.target.id] = true;
          track('section_view', {
            section_id: entry.target.id
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  // -- Article scroll depth (writing pages) ---------------------------------
  var articleBody = document.querySelector('.article-body');
  if (articleBody && 'IntersectionObserver' in window) {
    var milestones = [25, 50, 75, 100];
    var firedMilestones = {};
    var depthObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var pct = parseInt(entry.target.dataset.depth, 10);
          if (!firedMilestones[pct]) {
            firedMilestones[pct] = true;
            track('article_scroll_depth', {
              percent: pct,
              article_path: window.location.pathname
            });
          }
        }
      });
    }, { threshold: 0 });

    // Insert invisible markers at 25%, 50%, 75%, 100% of article height
    milestones.forEach(function (pct) {
      var marker = document.createElement('div');
      marker.dataset.depth = pct;
      marker.style.cssText = 'height:1px;width:1px;position:absolute;left:0;pointer-events:none;';
      marker.style.top = pct + '%';
      articleBody.style.position = 'relative';
      articleBody.appendChild(marker);
      depthObserver.observe(marker);
    });
  }
})();
