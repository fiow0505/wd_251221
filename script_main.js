/**
 * 파싱된 정보를 HTML 요소에 적용하는 함수
 * @param {object} info - 정보 객체

/*
  이 파일은 청첩장의 동적인 기능을 담당합니다.
  정보를 불러오고, 갤러리를 만들고, 지도를 표시하는 등의 역할을 합니다.
*/


// DOM이 완전히 로드된 후에 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    if (container) {
        // 짧은 지연(100ms)을 두어 브라우저가 초기 opacity: 0 상태를 인식하게 한 후,
        // 트랜지션을 시작하여 페이드 인이 부드럽게 작동하도록 합니다.
        setTimeout(() => {
            container.classList.remove('initial-hidden');
            container.classList.add('loaded');
        }, 100); 
    }

    // 1. info.txt 파일에서 정보 불러오기
    fetch('./info.txt')
        .then(response => response.text())
        .then(text => {
            const info = parseInfo(text);
            applyInfo(info);
            initAccordion();
            initClipboard();
            initAddressClipboard(info); // 주소 복사 기능 초기화 추
            initBgmControl();
        });


    // 3. 갤러리 초기화
    initGallery();

    
});


/**
 * info.txt 파일의 텍스트를 파싱하여 객체로 변환하는 함수
 * @param {string} text - info.txt 파일의 내용
 * @returns {object} - 파싱된 정보 객체
 */
function parseInfo(text) {
    const lines = text.split('\n');
    const info = {};
    lines.forEach(line => {
        const [key, ...value] = line.split(':');
        if (key && value) {
            info[key.trim()] = value.join(':').trim();
        }
    });
    return info;
}

/**
 * 파싱된 정보를 HTML 요소에 적용하는 함수
 * @param {object} info - 정보 객체
 */
function applyInfo(info) {
    try{
        const setText = (id,val) => {
            const el=document.getElementById(id);
            if (el) el.textContent = val || '';
        }
        // main
        setText('groom-name-main', info.groom_self_name);
        setText('bride-name-main', info.bride_self_name);
        setText('wedding-date-time-main', `${info.wedding_date} ${info.wedding_time}`)
        setText('wedding-hall-main', `${info.wedding_hall_name} ${info.wedding_hall_name2}`)

        //family-info
        setText('groom-name-family', info.groom_self_name);
        setText('groom-father-name-family', info.groom_father_name);
        setText('groom-mother-name-family', info.groom_mother_name);
        setText('bride-name-family', info.bride_self_name);
        setText('bride-father-name-family', info.bride_father_name);
        setText('bride-mother-name-family', info.bride_mother_name);
        
        //family-info pop
        setText('groom-name-pop', info.groom_self_name);
        setText('groom-father-name-pop', info.groom_father_name);
        setText('groom-mother-name-pop', info.groom_mother_name);
        document.getElementById('groom-call-pop').href = `tel:${info.groom_self_phone}`;
        document.getElementById('groom-sms-pop').href = `sms:${info.groom_self_phone}`;
        document.getElementById('groom-father-call-pop').href = `tel:${info.groom_father_phone}`;
        document.getElementById('groom-father-sms-pop').href = `sms:${info.groom_father_phone}`
        document.getElementById('groom-mother-call-pop').href = `tel:${info.groom_mother_phone}`;
        document.getElementById('groom-mother-sms-pop').href = `sms:${info.groom_mother_phone}`;

        setText('bride-name-pop', info.bride_self_name);
        setText('bride-father-name-pop', info.bride_father_name);
        setText('bride-mother-name-pop', info.bride_mother_name);
        document.getElementById('bride-call-pop').href = `tel:${info.bride_self_phone}`;
        document.getElementById('bride-sms-pop').href = `sms:${info.bride_self_phone}`;
        document.getElementById('bride-father-call-pop').href = `tel:${info.bride_father_phone}`;
        document.getElementById('bride-father-sms-pop').href = `sms:${info.bride_father_phone}`;
        document.getElementById('bride-mother-call-pop').href = `tel:${info.bride_mother_phone}`;
        document.getElementById('bride-mother-sms-pop').href = `sms:${info.bride_mother_phone}`;
            
        //location
        setText('wedding-hall-location', info.wedding_hall_name);
        setText('wedding-hall-address-location', info.wedding_hall_address);
        const hallCallEl = document.getElementById('wedding-hall-call-location');
        if (hallCallEl) hallCallEl.href = `tel:${info.wedding_hall_tel}`;

        //account
        const setAccountInfo = (person, side) => {
            // person: 'self'|'father'|'mother', side: 'groom'|'bride'
            const nameId = `${side}-${person}-name-account`;
            const numId = `${side}-${person}-account-number`;
            const nameEl = document.getElementById(nameId);
            const numEl = document.getElementById(numId);
            if (!nameEl || !numEl) return;

            const nameVal = info[`${side}_${person}_name`] || info[`${side}_name`] || '';
            const bankVal = info[`${side}_${person}_account_bank`] || info[`${side}_account_bank`] || '';
            const numVal = info[`${side}_${person}_account_number`] || info[`${side}_account_number`] || '';

            // 표시명
            let label = (side === 'groom') ? '신랑' : '신부';
            if (person === 'father') label += ' 아버지';
            else if (person === 'mother') label += ' 어머니';

            nameEl.textContent = `${label} ${nameVal}`.trim();
            numEl.textContent = `${bankVal} ${numVal}`.trim();

            // 복사 버튼에 data-clipboard-text 설정(있을 경우)
            const copyBtn = numEl.parentElement.nextElementSibling;
            if (copyBtn) copyBtn.setAttribute('data-clipboard-text', `${bankVal} ${numVal}`.trim());
        };

        // 신랑/신부 모두 세 항목 설정
        ['father','mother','self'].forEach(person => setAccountInfo(person,'groom'));
        ['father','mother','self'].forEach(person => setAccountInfo(person,'bride'));
        
    
    }catch (e) {
        console.error('applyInfo error: ', e)
    }
}



function initBgmControl() {
    const bgm = document.getElementById('bgm');
    const toggleBtn = document.getElementById('bgm-toggle-btn');
    if (!bgm || !toggleBtn) return;

    let isPlaying = false; // 현재 재생 상태 추적 (버튼 클래스 제어용)
    
    // URL에서 'playBgm=true' 쿼리 파라미터를 확인
    const urlParams = new URLSearchParams(window.location.search);
    const shouldPlayUnmuted = urlParams.get('playBgm') === 'true';
    
    // 버튼 아이콘 업데이트 함수
    const updateButtonIcon = () => {
        // Font Awesome 아이콘을 사용합니다.
        toggleBtn.innerHTML = isPlaying 
            ? '<i class="fas fa-volume-up"></i>'   // 재생 중
            : '<i class="fas fa-volume-mute"></i>'; // 일시 정지 (음소거)
            
        toggleBtn.classList.toggle('bgm-playing', isPlaying);
        toggleBtn.classList.toggle('bgm-paused', !isPlaying);
    };
    
    
    const toggleBgm = () => {
        if (isPlaying) {
            bgm.pause();
            isPlaying = false;
        } else {
            // 사용자가 클릭하면 음소거를 해제하고 재생합니다.
            bgm.muted = false;
            bgm.play().then(() => {
                isPlaying = true;
            }).catch(e => {
                // 재생 실패 시 (일반적으로 최초 사용자 상호작용이 아닐 경우)
                console.warn('BGM 재생 시도 실패 :', e);
                isPlaying = false; // 재생 안 되었으므로 false 유지
            });
        }
        updateButtonIcon();
    };

    // 1. 최초 BGM 로드 시 실행되는 함수
    const initialPlayLogic = () => {
        if (shouldPlayUnmuted) {
            // index.html에서 넘어온 경우: 음소거 해제 후 재생 시도
            bgm.muted = false;
            bgm.play().then(() => {
                isPlaying = true;
                console.log('index.html 이동 후 BGM 재생 성공 (음소거 해제)');
            }).catch(e => {
                console.warn("index.html 이동 후 BGM 재생 실패:", e);
                // 실패 시, muted 상태로 다시 시도하거나 사용자 상호작용을 기다림
                // 여기서는 muted 상태로 다시 시도하지 않고 버튼 클릭을 유도
                isPlaying = false;
            });
        } else {
            // 새로고침이나 직접 main.html 접근 시: muted 상태로 자동 재생 시도
            bgm.muted = true; 
            bgm.play().then(() => {
                isPlaying = true; 
            }).catch(e => {
                console.warn("최초 음소거 자동 재생 실패:", e);
                isPlaying = false; 
                // addInteractionListener(); // 필요하다면 이 부분을 추가
            });
        }
        updateButtonIcon();
    };

    
    toggleBtn.addEventListener('click', toggleBgm);

    // BGM 이벤트 리스너 (외부 상태 변화 반영)
    bgm.addEventListener('play', () => {
        isPlaying = true;
        updateButtonIcon();
    });
    bgm.addEventListener('pause', () => {
        isPlaying = false;
        updateButtonIcon();
    });
    
    // 함수 호출
    initialPlayLogic();
}


// --- 연락처 팝업 기능 ---
let WIN_SCR_TOP = 0

// 팝업 열기 함수 (HTML의 onclick="openContactPop()"와 연결됨)
function openContactPop() {
    // <body> 태그에 활성화 클래스를 추가하여 CSS를 통해 팝업을 보이게 함
    $("body").addClass("pop_contact_open"); 
    
    // 현재 스크롤 위치 저장 (팝업 닫을 때 원위치로 돌아가기 위함)
    const top = document.querySelector('html').scrollTop;
    WIN_SCR_TOP = top;
    
    // 팝업이 열리면 스크롤 방지
    $("html,body").css("overflow", "hidden");
}

// 팝업 닫기 기능 (ID가 tel_popup 내부의 .x_button 클릭 시)
$("#tel_popup .x_button").click(function() {
    // 활성화 클래스 제거하여 팝업을 숨김
    $("body").removeClass("pop_contact_open"); 
    
    // 스크롤 방지 해제
    $('html,body').css("overflow", ""); 
    
    // 저장된 위치로 스크롤 이동
    window.scrollTo(0, WIN_SCR_TOP); 
});


// --- 갤러리 기능 ---
let galleryImages = [];
let currentImageIndex = 0;
let isAnimating = false; // 애니메이션 중 중복 클릭 방지

function initGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    const indicatorContainer = document.querySelector('.indicator-container');
    const modal = document.getElementById('gallery-modal');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // 이미지 동적 생성
    for (let i = 1; i <= 10; i++) {
        const img = document.createElement('img');
        const index = i - 1;
        const jpg = `./photo/img${i}.jpg`;
        const jpeg = `./photo/img${i}.jpeg`;
        img.alt = `웨딩 사진 ${i}`;
        img.dataset.index = index;

        // jpg가 실패하면 jpeg로 폴백하고, 실제 소스를 galleryImages에 반영
        img.onerror = () => {
            img.onerror = null;
            img.src = jpeg;
            galleryImages[index] = jpeg;
        };
        img.onload = () => {
            galleryImages[index] = img.src;
        };

        img.src = jpg;
        galleryImages.push(jpg);
        galleryGrid.appendChild(img);

        const indicator = document.createElement('span');
        indicator.classList.add('indicator');
        indicator.dataset.index = index;
        indicatorContainer.appendChild(indicator);

        img.addEventListener('click', () => openModal(i - 1));
        indicator.addEventListener('click', () => openModal(i - 1));
    }

    const openModal = (index) => {
        currentImageIndex = index;
        modalImage.src = galleryImages[currentImageIndex];
        updateIndicators();
        modal.style.display = 'block';
        // 애니메이션 클래스 초기화
        modalImage.className = 'modal-content';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const updateIndicators = () => {
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentImageIndex);
        });
    };

    const animateSlide = (direction) => {
        if (isAnimating) return;
        isAnimating = true;

        let slideOutClass, slideInStartClass;
        
        if (direction === 'prev') {
            // 좌측 버튼: 현재 사진 오른쪽으로 아웃 (slide-right), 새 사진 왼쪽 밖에서 시작 (start-left)
            slideOutClass = 'slide-right'; 
            slideInStartClass = 'start-left';
        } else { // 'next'
            // 우측 버튼: 현재 사진 왼쪽으로 아웃 (slide-left), 새 사진 오른쪽 밖에서 시작 (start-right)
            slideOutClass = 'slide-left';
            slideInStartClass = 'start-right';
        }

        // 1. 현재 이미지를 화면 밖으로 슬라이드 아웃
        modalImage.classList.add(slideOutClass);
        
        // CSS 애니메이션 시간(300ms) 대기
        setTimeout(() => { 
            // 2. 새 이미지 인덱스 및 소스 업데이트
            if (direction === 'next') {
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            } else {
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            }
            modalImage.src = galleryImages[currentImageIndex];
            updateIndicators();

            // 3. 트랜지션을 끄고 새 이미지의 시작 위치로 순간 이동
            modalImage.classList.add(slideInStartClass);
            modalImage.classList.remove(slideOutClass);
            
            // 4. 강제 리페인트 후 트랜지션을 다시 켜고 중앙으로 이동 시작 (슬라이드 인)
            // requestAnimationFrame을 사용해 강제 리페인트를 유도하여 튕김을 방지합니다.
            requestAnimationFrame(() => {
                modalImage.offsetWidth;
                modalImage.classList.remove(slideInStartClass);
                // 'modal-content' 클래스가 트랜지션을 다시 활성화합니다.
            });
            
            // 5. 슬라이드 인 완료 대기
            setTimeout(() => {
                isAnimating = false;
            }, 300); // 300ms 대기 후 애니메이션 플래그 해제
            
        }, 300); // 300ms 대기 후 이미지 전환 시작
    };


    const showPrevImage = () => {
        animateSlide('prev');
    };

    const showNextImage = () => {
        animateSlide('next');
    };

    closeBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // 스와이프 기능 개선
    let touchstartX = 0;
    let touchendX = 0;
    let touchstartY = 0;
    let touchendY = 0;
    const minSwipeDistance = 50; // 최소 스와이프 거리

    modalImage.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
    });

    modalImage.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        touchendY = e.changedTouches[0].screenY;
        
        const deltaX = touchendX - touchstartX;
        const deltaY = touchendY - touchstartY;
        
        // 수평 스와이프가 수직 스와이프보다 클 때만 이미지 변경
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance && !isAnimating) {
            if (deltaX < 0) {
                showNextImage(); // 왼쪽으로 스와이프
            } else {
                showPrevImage(); // 오른쪽으로 스와이프
            }
        }
    });

    // 모달 배경 클릭으로 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

/**
 * 아코디언 기능을 초기화하여 계좌번호 패널을 열고 닫는 함수
 */
function initAccordion() {
    const buttons = Array.from(document.querySelectorAll(".accordion"));
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        const willOpen = !panel.style.maxHeight;

        // 다른 모든 패널 닫기
        buttons.forEach(other => {
          if (other === btn) return;
          other.classList.remove("active");
          const otherPanel = other.nextElementSibling;
          if (otherPanel && otherPanel.style) {
            otherPanel.style.maxHeight = null;
            otherPanel.style.paddingTop = "0";
            otherPanel.style.paddingBottom = "0";
          }
        });

        // 현재 버튼 토글
        if (willOpen) {
          btn.classList.add("active");
          panel.style.paddingTop = "10px";
          panel.style.paddingBottom = "10px";
          panel.style.maxHeight = (panel.scrollHeight + 20) + "px";
        } else {
          btn.classList.remove("active");
          panel.style.maxHeight = null;
          panel.style.paddingTop = "0";
          panel.style.paddingBottom = "0";
        }
      });
    });
}

/**
 * 계좌번호 복사(ClipboardJS) 기능을 초기화하는 함수
 */
function initClipboard() {
    // 누락된 data-clipboard-text를 DOM에서 보이는 계좌 텍스트로 보정
    document.querySelectorAll('.copy-btn').forEach(btn => {
        const exists = btn.getAttribute('data-clipboard-text');
        if (!exists) {
            const accountTextEl = btn.closest('.account-item')?.querySelector('.info .account');
            const text = (accountTextEl?.textContent || '').trim();
            if (text) btn.setAttribute('data-clipboard-text', text);
        }
    });

    // ClipboardJS가 로드되지 않은 경우를 대비한 폴백 처리
    if (typeof ClipboardJS === 'undefined') {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const text = btn.getAttribute('data-clipboard-text') || '';
                if (!text) {
                    alert('복사할 내용이 없습니다.');
                    return;
                }

                // 우선 Clipboard API 시도
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                        await navigator.clipboard.writeText(text);
                        alert('계좌번호가 복사되었습니다.');
                        return;
                    } catch (err) {
                        // 아래 전통적 방식으로 폴백
                    }
                }

                // execCommand 기반 폴백
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.top = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    const ok = document.execCommand('copy');
                    alert(ok ? '계좌번호가 복사되었습니다.' : '계좌번호 복사에 실패했습니다. 직접 복사해주세요.');
                } catch (err) {
                    alert('계좌번호 복사에 실패했습니다. 직접 복사해주세요.');
                } finally {
                    document.body.removeChild(textarea);
                }
            });
        });
        return;
    }

    const clipboard = new ClipboardJS('.copy-btn');
    clipboard.on('success', function(e) {
        alert('계좌번호가 복사되었습니다.');
        e.clearSelection();
    });
    clipboard.on('error', function(e) {
        alert('계좌번호 복사에 실패했습니다. 직접 복사해주세요.');
    });
}

/**
 * 웨딩홀 주소 복사 기능을 초기화하는 함수
 * @param {object} info - 정보 객체
 */
function initAddressClipboard(info) {
    const icon = document.getElementById('copy-location-icon');
    if (!icon) return;

    icon.addEventListener('click', async () => {
        const textToCopy = info.wedding_hall_address;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            alert('웨딩홀 주소가 복사되었습니다.');
        } catch (err) {
            console.error('웨딩홀 주소 복사 실패:', err);
            alert('주소 복사에 실패했습니다. 직접 복사해주세요.');
        }
    });
}

