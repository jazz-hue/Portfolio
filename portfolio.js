/* Category navigation preserves the complete embedded archive, not a curated replacement. */
function initWorkExplorer(sections) {
  const work = document.getElementById('work');
  const coverVideos = {
    posters: 'videos/covers/posters.mp4',
    banners: 'videos/covers/banners.mp4',
    album: 'videos/covers/album.mp4',
    illustration: 'videos/covers/illustration.mp4',
    ai: 'videos/covers/ai.mp4'
  };
  // A curated view of existing work, not another duplicate page section.
  const picks = [
    ['webdesign',null,0],['posters',null,14],['banners',null,16],
    ['ai','ai-product',0],['photography','osuga-product',0],['illustration',null,0],
    ['products',null,0],['album',null,0]
  ];
  const selected = {slug:'selected',title_cn:'精选作品',title_en:'Selected',groups:[],items:picks.map(([slug,group,index])=>{
    const section=sections.find(s=>s.slug===slug);
    const item=(group?section.groups.find(g=>g.slug===group).items:section.items)[index];
    return {...item,_section:section.title_cn,_category:slug,_coverVideo:coverVideos[slug]||''};
  })};
  const archiveCount=sections.reduce((n,s)=>n+s.items.length+s.groups.reduce((m,g)=>m+g.items.length,0),0);
  sections=[selected,...sections];
  const notes = {
    selected: ['Selected work', '从网页、海报到产品影像，先看几个不同方向。', 'selected'],
    posters: ['Typography / Campaign', '海报中的字体、画面与视觉叙事。', 'poster'],
    aplus: ['E-commerce / A+', '产品信息、卖点层级与长页视觉。悬停浏览，点击查看完整长图。', 'long'],
    products: ['E-commerce / Product', '围绕产品特征组织信息与视觉表达。', 'poster'],
    h5: ['Digital / H5', '移动端页面与活动视觉。悬停浏览，点击查看完整长图。', 'long'],
    banners: ['Campaign / Banner', '横幅画面中的构图、产品与信息层级。', 'landscape'],
    webdesign: ['Digital / Web', '从首屏到内容结构的页面设计。悬停浏览，点击查看完整页面。', 'long'],
    album: ['Editorial / Print', '版式、留白与跨页之间的阅读节奏。', 'landscape'],
    illustration: ['Illustration / Visual', '关于形象、色彩与表达的视觉练习。', 'poster'],
    ai: ['AI / Exploration', '产品、人物与不同主题下的 AI 视觉探索。', 'photo'],
    photography: ['Photography / Still & Life', '用镜头观察产品、人物与日常。', 'photo']
  };
  const count = section => section.items.length || section.groups.reduce((n, group) => n + group.items.length, 0);
  work.className = 'work-explorer';
  work.innerHTML = `
    <div class="editorial-topline"><span>02 / Work</span><span>2025 — 2026</span></div>
    <div class="work-head"><h2>作品选集<span class="section-translation">Selected work</span></h2><p>平面设计 / 数字页面 / AI 视觉 / 摄影<br>选择分类深入浏览，点击图片查看细节。</p></div>
    <div class="work-layout">
      <div class="work-index" role="tablist" aria-label="作品分类" aria-orientation="horizontal">
        <p class="work-index-label" aria-hidden="true">浏览分类 / ${archiveCount} IMAGES</p>
        ${sections.map((s, i) => `<button class="category-tab" role="tab" id="tab-${s.slug}" aria-controls="galleryPanel" aria-selected="false" tabindex="-1" data-category="${s.slug}"><span class="cat-no">${i===0?'—':String(i).padStart(2, '0')}</span><span><strong>${s.title_cn}</strong><small>${s.title_en}</small></span><span class="cat-count">${String(count(s)).padStart(2, '0')}</span></button>`).join('')}
      </div>
      <div class="gallery-panel" id="galleryPanel" role="tabpanel" tabindex="0"></div>
    </div>`;
  const panel = document.getElementById('galleryPanel');
  const categoryTabs = [...work.querySelectorAll('.category-tab')];
  const desktopGallery = matchMedia('(min-width:1101px)');
  const tabletGallery = matchMedia('(min-width:781px)');
  const getPageSize = () => desktopGallery.matches ? 8 : tabletGallery.matches ? 6 : 4;
  let activeSection, activeGroup, pageIndex = 0, pageSize = getPageSize();
  let galleryItems = [];
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coverVideoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !reduceMotion.matches) entry.target.play().catch(() => {});
      else entry.target.pause();
    });
  }, {rootMargin:'160px 0px',threshold:.12}) : null;

  const renderProjectMedia = (item, format, label) => {
    const image = `<img src="${format==='selected'||format==='long'?item.full:item.thumb}" alt="${escape(item._section||label)}" width="${item.w}" height="${item.h}" loading="lazy" decoding="async">`;
    if (format !== 'selected' || !item._coverVideo) return image;
    return `<video class="project-cover-video" src="${item._coverVideo}" poster="${item.full}" muted loop playsinline preload="metadata" aria-hidden="true"></video>`;
  };

  const prepareCoverVideos = () => {
    coverVideoObserver?.disconnect();
    panel.querySelectorAll('.project-cover-video').forEach(video => {
      video.muted = true;
      if (reduceMotion.matches) return;
      if (coverVideoObserver) coverVideoObserver.observe(video);
      else video.play().catch(() => {});
    });
  };

  function renderGallery() {
    const section = activeSection;
    const items = activeGroup ? activeGroup.items : section.items;
    const label = section.title_cn + (activeGroup ? ' / ' + activeGroup.title_cn : '');
    const [en, description, format] = notes[section.slug] || [section.title_en, '', 'poster'];
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    pageIndex = Math.min(pageIndex, pageCount - 1);
    const start = pageIndex * pageSize;
    galleryItems = items.map(item => ({...item, _section:item._section||label}));
    panel.setAttribute('aria-labelledby', `tab-${section.slug}`);
    panel.innerHTML = `<div class="gallery-heading"><div><h3>${section.title_cn}</h3><p>${description}</p></div><span class="gallery-total">${String(items.length).padStart(2, '0')} WORKS</span></div>
      ${section.groups.length ? `<div class="group-tabs" aria-label="${section.title_cn}子分类">${section.groups.map(g => `<button class="group-tab" data-group="${g.slug}" aria-pressed="${g === activeGroup}" ${g.items.length ? '' : 'disabled'}>${g.title_cn} <span>(${g.items.length})</span></button>`).join('')}</div>` : ''}
      <div class="project-grid" data-format="${format}">${items.slice(start, start + pageSize).map((it, offset) => {const i = start + offset; return `<button class="project-card" data-image="${i}" data-art-category="${it._category||section.slug}" aria-label="查看${escape(it._section||label)}作品 ${i + 1} 大图"><span class="project-media">${renderProjectMedia(it,format,label)}<span class="project-open" aria-hidden="true">↗</span></span><span class="project-caption"><b>${escape(it._section||(activeGroup ? activeGroup.title_cn : section.title_cn))}</b><span>${String(i + 1).padStart(2, '0')} / ${format==='selected'?'SELECTED':en}</span></span></button>`;}).join('')}</div>
      <div class="archive-footer"><p>点击作品查看大图 · ${start + 1}–${Math.min(start + pageSize, items.length)} / ${items.length} 件作品</p><nav class="archive-pagination" aria-label="作品翻页"><button class="archive-prev" aria-label="上一页作品" ${pageIndex === 0 ? 'disabled' : ''}>←</button><span role="status" aria-live="polite">${String(pageIndex + 1).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}</span><button class="archive-next" aria-label="下一页作品" ${pageIndex === pageCount - 1 ? 'disabled' : ''}>→</button></nav></div>`;
    prepareCoverVideos();
    panel.querySelectorAll('[data-image]').forEach(button => button.onclick = () => openLb(galleryItems, +button.dataset.image));
    panel.querySelectorAll('[data-group]').forEach(button => button.onclick = () => {
      activeGroup = section.groups.find(g => g.slug === button.dataset.group);
      pageIndex = 0;
      renderGallery();
      panel.querySelector(`[data-group="${activeGroup.slug}"]`).focus({preventScroll:true});
    });
    ['prev','next'].forEach(direction => {
      panel.querySelector(`.archive-${direction}`).onclick = () => {
        pageIndex += direction === 'next' ? 1 : -1;
        renderGallery();
        const button = panel.querySelector(`.archive-${direction}`);
        (button.disabled ? panel.querySelector(`.archive-${direction === 'next' ? 'prev' : 'next'}`) : button).focus({preventScroll:true});
      };
    });
  }

  function selectCategory(slug, updateHash = false) {
    const section = sections.find(s => s.slug === slug) || sections[0];
    activeSection = section;
    activeGroup = section.groups.find(g => g.slug === 'ai-product' && g.items.length) || section.groups.find(g => g.items.length) || null;
    pageIndex = 0;
    categoryTabs.forEach(tab => {
      const selected = tab.dataset.category === section.slug;
      tab.setAttribute('aria-selected', selected);
      tab.tabIndex = selected ? 0 : -1;
    });
    renderGallery();
    if (updateHash && location.hash !== `#${section.slug}`) history.replaceState(null, '', `#${section.slug}`);
  }
  categoryTabs.forEach((tab, i) => {
    tab.onclick = () => {
      selectCategory(tab.dataset.category, true);
    };
    tab.onkeydown = event => {
      const keys = ['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const delta = ['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? categoryTabs.length - 1 : (i + delta + categoryTabs.length) % categoryTabs.length;
      categoryTabs[next].click();
      categoryTabs[next].focus({preventScroll:true});
    };
  });
  document.querySelectorAll('[data-open-category]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    selectCategory(link.dataset.openCategory, true);
    work.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    panel.focus({preventScroll:true});
  }));
  const syncHash = () => {
    const slug = location.hash.slice(1);
    if (sections.some(s => s.slug === slug)) {
      selectCategory(slug);
      work.scrollIntoView({behavior:'instant'});
    }
  };
  selectCategory(sections.some(s => s.slug === location.hash.slice(1)) ? location.hash.slice(1) : 'selected');
  if (sections.some(s => s.slug === location.hash.slice(1))) requestAnimationFrame(syncHash);
  addEventListener('hashchange', syncHash);
  const resizeGallery = () => {
    const firstItem = pageIndex * pageSize;
    pageSize = getPageSize();
    pageIndex = Math.floor(firstItem / pageSize);
    renderGallery();
  };
  desktopGallery.addEventListener('change', resizeGallery);
  tabletGallery.addEventListener('change', resizeGallery);
}

function initEditorialPage() {
  const nav = document.querySelector('.nav');
  const cover = document.querySelector('.hero--cover');
  const updateNav = () => {
    const scrolled = window.scrollY >= cover.offsetHeight - 110;
    nav.classList.toggle('scrolled', scrolled);
    if (!scrolled) nav.querySelectorAll('[aria-current]').forEach(link=>link.removeAttribute('aria-current'));
  };
  addEventListener('scroll', updateNav, {passive:true}); updateNav();
  const navObserver = new IntersectionObserver(entries => {
    const current = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (!current) return;
    document.querySelectorAll('.nav .links a').forEach(link => {
      const active = link.hash === `#${current.target.id}`;
      if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
  }, {rootMargin:'-20% 0px -50% 0px',threshold:0});
  ['about','work','reel','contact'].forEach(id => navObserver.observe(document.getElementById(id)));

  // Long artwork can be read at full width without leaving the site.
  const lightbox = document.getElementById('lb');
  const zoomButton = document.getElementById('lbZoom');
  const zoom = () => {
    const expanded = lightbox.classList.toggle('zoomed');
    zoomButton.textContent = expanded ? '适应屏幕 −' : '查看细节 +';
    zoomButton.setAttribute('aria-pressed', expanded);
    lightbox.scrollTop = 0;
  };
  zoomButton.onclick = zoom;
  document.getElementById('lbImg').onclick = zoom;
}
