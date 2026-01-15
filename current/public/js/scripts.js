window.addEventListener('DOMContentLoaded', () => {
  // Bootstrap lg 브레이크포인트 기준으로 뷰포트 감지 (UA 대신)
  const mq = window.matchMedia('(max-width: 991.98px)');
  const nav = document.getElementById('mainNav');
  const logoWrap = document.getElementById('logoChange');

  const isMobile = () => mq.matches;

  const setLogo = (useWhite) => {
    if (!logoWrap) return;
    logoWrap.innerHTML = `<img src="assets/${useWhite ? 'gsc_logo.png' : 'gsc_logo_contact.png'}" alt="GSC Lab Logo" />`;
  };

  const applyState = () => {
    if (!nav) return;
    const atTop = window.scrollY === 0;

    if (isMobile()) {
      // 모바일/태블릿: 로고는 항상 흰색
      setLogo(true);
      if (atTop) {
        // 상단: 투명 배경 + 흰 텍스트
        nav.classList.add('navbar-dark');
        nav.classList.remove('navbar-light', 'navbar-shrink');
      } else {
        setLogo(false);
        // 스크롤 후: 흰 배경 + 검정 텍스트
        nav.classList.add('navbar-light', 'navbar-shrink');
        nav.classList.remove('navbar-dark');
      }
    } else {
      // 데스크톱
      if (atTop) {
        // 상단: 투명 배경 + 검정 텍스트 + 검정 로고
        setLogo(false);
        nav.classList.add('navbar-light');
        nav.classList.remove('navbar-dark', 'navbar-shrink');
      } else {
        // 스크롤 후: 흰 배경 + 검정 텍스트 + 검정 로고
        setLogo(false);
        nav.classList.add('navbar-light', 'navbar-shrink');
        nav.classList.remove('navbar-dark');
      }
      
    }
  };

  // 초기 적용 + 이벤트
  applyState();
  document.addEventListener('scroll', applyState, { passive: true });
  // 브레이크포인트 변경 시에도 재적용 (Safari 구버전 대응)
  if (mq.addEventListener) mq.addEventListener('change', applyState);
  else mq.addListener(applyState);

  // 모바일 메뉴에서 링크 클릭 시 자동 닫기
  const navToggler = document.querySelector('.navbar-toggler');
  if (navToggler) {
    document.querySelectorAll('#navbarResponsive .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        const display = window.getComputedStyle(navToggler).display;
        if (display !== 'none') navToggler.click();
      });
    });
  }

  // ScrollSpy (있을 때만)
  if (nav && window.bootstrap && window.bootstrap.ScrollSpy) {
    new bootstrap.ScrollSpy(document.body, {
      target: '#mainNav',
      rootMargin: '0px 0px -40%',
    });
  }
});

// === News Gallery ===
(function initNewsGallery(){
  const viewer   = document.getElementById('news-viewer');
  const imgEl    = document.getElementById('news-viewer-img');
  const titleEl  = document.getElementById('news-viewer-title');
  const descEl   = document.getElementById('news-viewer-desc');
  const list     = document.getElementById('news-list');
  const dateEl   = document.getElementById('news-viewer-date');
  if (!viewer || !imgEl || !titleEl || !descEl || !list) return;

  const items = Array.from(list.querySelectorAll('.news-item'));
  if (!items.length) return;

  let idx = Math.max(0, items.findIndex(b => b.classList.contains('is-active')));
  let autoTimer = null;
  let pausedUntil = 0;

  const setActiveByIndex = (i, {scrollList=false} = {}) => {
    idx = (i + items.length) % items.length;
    const btn = items[idx];
    items.forEach(b => b.classList.toggle('is-active', b === btn));
    const { src, title, desc, date } = btn.dataset;
    if (src)   { imgEl.src = src; imgEl.alt = title || ''; }
    if (title) { titleEl.textContent = title; }
    if (desc)  { descEl.textContent  = desc; }
    if (dateEl) {
      if (date) { dateEl.textContent = date; dateEl.style.display = ''; }
      else { dateEl.textContent = ''; dateEl.style.display = 'none'; }
    }
    // 왼쪽 이미지 바뀐 뒤 높이에 맞춰 오른쪽 리스트 높이를 동기화(데스크톱에서만)
    const scheduleSync = () => requestAnimationFrame(() => requestAnimationFrame(syncListHeight));
    if (imgEl.complete) scheduleSync();
    else imgEl.addEventListener('load', scheduleSync, { once: true });

    if (scrollList) ensureVisible(btn);   // ★ 문서가 아니라 리스트만 스크롤
  };
  
  const bumpPause = (ms=6000) => { pausedUntil = Date.now() + ms; };

  const startAuto = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (Date.now() < pausedUntil) return;
      setActiveByIndex(idx + 1, {scrollList:true});
    }, 4000); // 자동 전환 주기
  };

  // === 리스트 스크롤 어포던스: 페이드/힌트 표시 ===
  // 힌트 배지 없으면 생성
  if (!list.querySelector('.scroll-hint')) {
    const hint = document.createElement('div');
    hint.className = 'scroll-hint';
    hint.textContent = 'Scroll';
    list.appendChild(hint);
  }

  // 상/하단 그라데이션 노출 상태 갱신
  const updateListShadows = () => {
    const atTop = list.scrollTop <= 0;
    const atBottom = Math.ceil(list.scrollTop + list.clientHeight) >= list.scrollHeight;
    list.classList.toggle('has-top-shadow', !atTop);
    list.classList.toggle('has-bottom-shadow', !atBottom);
  };

  // 힌트 배지 숨기기
  const hideHint = () => list.classList.add('hint-hidden');

  // 초기 상태
  updateListShadows();
  // 초기 1.5초 뒤 힌트 자동 숨김 (사용자가 스크롤/클릭하면 즉시 숨김)
  setTimeout(hideHint, 1500);

  // 리스트 스크롤/인터랙션 시 처리
  ['scroll','wheel','touchstart','pointerdown','keydown'].forEach(ev=>{
    list.addEventListener(ev, () => { updateListShadows(); hideHint(); }, { passive:true });
  });

  // 리스트 컨테이너만 스크롤해서 대상 항목이 보이도록 (문서 스크롤 건드리지 않음)
  // const ensureVisible = (btn) => {
  //   const cTop = list.scrollTop;
  //   const cH   = list.clientHeight;
  //   const bTop = btn.offsetTop;
  //   const bH   = btn.offsetHeight;

  //   if (bTop < cTop) {
  //     list.scrollTop = Math.max(0, bTop - 8);
  //   } else if (bTop + bH > cTop + cH) {
  //     list.scrollTop = bTop + bH - cH + 8;
  //   }
  // };

  const ensureVisible = (btn) => {
    if (mqLgUp.matches) {
      // 데스크톱: 세로 리스트
      const cTop = list.scrollTop, cH = list.clientHeight;
      const bTop = btn.offsetTop,  bH = btn.offsetHeight;
      if (bTop < cTop) list.scrollTop = Math.max(0, bTop - 8);
      else if (bTop + bH > cTop + cH) list.scrollTop = bTop + bH - cH + 8;
    } else {
      // 모바일: 가로 리스트
      const cLeft = list.scrollLeft, cW = list.clientWidth;
      const bLeft = btn.offsetLeft,  bW = btn.offsetWidth;
      if (bLeft < cLeft) list.scrollLeft = Math.max(0, bLeft - 8);
      else if (bLeft + bW > cLeft + cW) list.scrollLeft = bLeft + bW - cW + 8;
    }
  };

  // === 왼쪽 "전체 뷰(사진 + 캡션)" 높이에 맞춰 오른쪽 리스트 높이 동기화 ===
  const mqLgUp = window.matchMedia('(min-width: 992px)');
  const syncListHeight = () => {
    if (!list || !viewer) return;
    if (mqLgUp.matches) {
      const h = Math.round(viewer.getBoundingClientRect().height);
      list.style.maxHeight = `${Math.max(200, h)}px`;
      list.style.overflow  = 'auto';
    } else {
      list.style.maxHeight = '';
      list.style.overflow  = '';
    }
  };

  // 초기 표시 + 오토플레이 시작
  setActiveByIndex(idx);
  startAuto();
  syncListHeight();

  // 클릭으로만 전환 (스크롤해도 바뀌지 않음)
  list.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
    const btn = e.target.closest('.news-item');
    if (!btn) return;
    bumpPause();
    setActiveByIndex(items.indexOf(btn));
  });

  // 사용자가 스크롤/터치/호버 중에는 자동재생 잠깐 멈춤(뷰어 변경은 안 함)
  ['wheel','touchstart','pointerdown','mouseenter'].forEach(ev=>{
    list.addEventListener(ev, ()=>bumpPause(), {passive:true});
  });

  // 반응형/리사이즈 시 높이 재계산
  window.addEventListener('resize', syncListHeight, { passive: true });
  if (mqLgUp.addEventListener) mqLgUp.addEventListener('change', syncListHeight);
  else mqLgUp.addListener(syncListHeight); // Safari fallback

  // 탭 비활성화 시 자동재생 중지, 복귀 시 재개
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (autoTimer) clearInterval(autoTimer); }
    else startAuto();
  });


});

window.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll(".custom-video");

  videos.forEach(video => {
    const wrapper = video.closest(".video-wrap");
    const overlay = wrapper.querySelector(".video-overlay-play");

    // 초기: 컨트롤 숨김 + 오버레이 표시
    video.controls = false;
    overlay.style.display = "flex";

    // ▶ 클릭 → 재생 시작 + 컨트롤 표시
    overlay.addEventListener("click", () => {
      video.controls = true;
      video.play();
      overlay.style.display = "none";
    });

    // 영상 끝 → 썸네일로 초기화
    video.addEventListener("ended", () => {
      video.pause();
      video.controls = false;
      video.currentTime = 0;
      video.load(); // 썸네일 다시 불러오기
      overlay.style.display = "flex"; // ▶ 버튼 복귀
    });
  });
});

// news-carousel.js
// news-carousel.js
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!track || !prevBtn || !nextBtn) return;

  const card = track.querySelector(".news-card");
  if (!card) return;

  const cardWidth = card.offsetWidth + 20; // 카드 + gap
  let scrollPosition = 0;

  nextBtn.addEventListener("click", () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    scrollPosition = Math.min(scrollPosition + cardWidth, maxScroll);
    track.scrollTo({ left: scrollPosition, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    scrollPosition = Math.max(scrollPosition - cardWidth, 0);
    track.scrollTo({ left: scrollPosition, behavior: "smooth" });
  });
});
