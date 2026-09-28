/**
 * V MARK CORPORATION - Website Content Management (CMS) Controller
 */
import { initAdminLayout, showToast } from './admin-ui.js';
import { getSiteContent, saveSiteContent } from './admin-db.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminLayout('content', 'Website Content', ['Admin', 'CMS']);

  setupTabs();
  await loadContentData();
  setupFormSubmissions();
});

function setupTabs() {
  const tabs = document.querySelectorAll('#contentTabs .tab-btn');
  const panes = {
    homepage: document.getElementById('paneHomepage'),
    about: document.getElementById('paneAbout'),
    contact: document.getElementById('paneContact'),
    footer: document.getElementById('paneFooter')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      Object.keys(panes).forEach(k => {
        if (panes[k]) {
          panes[k].style.display = (k === target) ? 'block' : 'none';
        }
      });
    });
  });
}

async function loadContentData() {
  try {
    const fullContent = await getSiteContent();

    // 1. Homepage
    const hp = fullContent.homepage || {};
    setVal('heroHeading', hp.heroHeading);
    setVal('heroSubheading', hp.heroSubheading);
    setVal('badgeText', hp.badgeText);
    setVal('ctaPrimaryText', hp.ctaPrimaryText);
    setVal('ctaSecondaryText', hp.ctaSecondaryText);
    setVal('statsYears', hp.statsYears);
    setVal('statsCountries', hp.statsCountries);
    setVal('statsMachines', hp.statsMachines);
    setVal('statsClients', hp.statsClients);

    // 2. About
    const ab = fullContent.about || {};
    setVal('aboutHeading', ab.heading);
    setVal('aboutSubheading', ab.subheading);
    setVal('aboutMission', ab.mission);
    setVal('aboutVision', ab.vision);
    setVal('addressFactory', ab.addressFactory);
    setVal('addressOffice', ab.addressOffice);

    // 3. Contact
    const ct = fullContent.contact || {};
    setVal('phonePrimary', ct.phonePrimary);
    setVal('phoneSecondary', ct.phoneSecondary);
    setVal('emailSales', ct.emailSales);
    setVal('emailSupport', ct.emailSupport);
    setVal('whatsappNumber', ct.whatsappNumber);
    setVal('workingHours', ct.workingHours);

    // 4. Footer
    const ft = fullContent.footer || {};
    setVal('footerBio', ft.bio);
    setVal('footerCopyright', ft.copyright);

  } catch (err) {
    console.error('Error loading site content:', err);
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

function setupFormSubmissions() {
  // Homepage form
  document.getElementById('formHomepage')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      heroHeading: document.getElementById('heroHeading').value.trim(),
      heroSubheading: document.getElementById('heroSubheading').value.trim(),
      badgeText: document.getElementById('badgeText').value.trim(),
      ctaPrimaryText: document.getElementById('ctaPrimaryText').value.trim(),
      ctaSecondaryText: document.getElementById('ctaSecondaryText').value.trim(),
      statsYears: document.getElementById('statsYears').value.trim(),
      statsCountries: document.getElementById('statsCountries').value.trim(),
      statsMachines: document.getElementById('statsMachines').value.trim(),
      statsClients: document.getElementById('statsClients').value.trim()
    };
    await saveSiteContent('homepage', payload);
    showToast('Homepage hero content updated successfully!', 'success');
  });

  // About form
  document.getElementById('formAbout')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      heading: document.getElementById('aboutHeading').value.trim(),
      subheading: document.getElementById('aboutSubheading').value.trim(),
      mission: document.getElementById('aboutMission').value.trim(),
      vision: document.getElementById('aboutVision').value.trim(),
      addressFactory: document.getElementById('addressFactory').value.trim(),
      addressOffice: document.getElementById('addressOffice').value.trim()
    };
    await saveSiteContent('about', payload);
    showToast('About & facility content updated!', 'success');
  });

  // Contact form
  document.getElementById('formContact')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      phonePrimary: document.getElementById('phonePrimary').value.trim(),
      phoneSecondary: document.getElementById('phoneSecondary').value.trim(),
      emailSales: document.getElementById('emailSales').value.trim(),
      emailSupport: document.getElementById('emailSupport').value.trim(),
      whatsappNumber: document.getElementById('whatsappNumber').value.trim(),
      workingHours: document.getElementById('workingHours').value.trim()
    };
    await saveSiteContent('contact', payload);
    showToast('Corporate contact details updated!', 'success');
  });

  // Footer form
  document.getElementById('formFooter')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      bio: document.getElementById('footerBio').value.trim(),
      copyright: document.getElementById('footerCopyright').value.trim()
    };
    await saveSiteContent('footer', payload);
    showToast('Footer text and copyright saved!', 'success');
  });
}
