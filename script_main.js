/**
 * 파싱된 정보를 HTML 요소에 적용하는 함수
 * @param {object} info - 정보 객체

/*
  이 파일은 청첩장의 동적인 기능을 담당합니다.
  정보를 불러오고, 갤러리를 만들고, 지도를 표시하는 등의 역할을 합니다.
*/

// DOM이 완전히 로드된 후에 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', function() {

    // 1. info.txt 파일에서 정보 불러오기
    fetch('./info.txt')
        .then(response => response.text())
        .then(text => {
            const info = parseInfo(text);
            applyInfo(info);
            initAccordion();
            initClipboard();
            initAddressClipboard(info); // 주소 복사 기능 초기화 추
        });

    // 2. 배경 음악 자동 재생
    document.body.addEventListener('click', function playBgm() {
        const bgm = document.getElementById('bgm');
        bgm.play();
        document.body.removeEventListener('click', playBgm);
    }, { once: true });


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

function initGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    const indicatorContainer = document.querySelector('.indicator-container');
    const modal = document.getElementById('gallery-modal');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // 이미지 동적 생성
    for (let i = 1; i <= 29; i++) {
        const img = document.createElement('img');
        const src = `./photo/img${i}.jpg`;
        img.src = src;
        img.alt = `웨딩 사진 ${i}`;
        img.dataset.index = i - 1;
        galleryImages.push(src);
        galleryGrid.appendChild(img);

        const indicator = document.createElement('span');
        indicator.classList.add('indicator');
        indicator.dataset.index = i - 1;
        indicatorContainer.appendChild(indicator);

        img.addEventListener('click', () => openModal(i - 1));
        indicator.addEventListener('click', () => openModal(i - 1));
    }

    const openModal = (index) => {
        currentImageIndex = index;
        modalImage.src = galleryImages[currentImageIndex];
        updateIndicators();
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const updateIndicators = () => {
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentImageIndex);
        });
    };

    const showPrevImage = () => {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        modalImage.src = galleryImages[currentImageIndex];
        updateIndicators();
    };

    const showNextImage = () => {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        modalImage.src = galleryImages[currentImageIndex];
        updateIndicators();
    };

    closeBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // 스와이프 기능
    let touchstartX = 0;
    let touchendX = 0;

    modalImage.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    });

    modalImage.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        if (touchendX < touchstartX) showNextImage();
        if (touchendX > touchstartX) showPrevImage();
    });
}

/**
 * 아코디언 기능을 초기화하여 계좌번호 패널을 열고 닫는 함수
 */
function initAccordion() {
    document.querySelectorAll(".accordion").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        const panel = btn.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
          panel.style.paddingTop = "0";
          panel.style.paddingBottom = "0";
        } else {
          // CSS의 패딩을 고려하여 maxHeight를 설정
          panel.style.paddingTop = "10px"; 
          panel.style.paddingBottom = "10px";
          // maxHeight를 스크롤 높이보다 약간 크게 설정하여 패딩 포함
          panel.style.maxHeight = (panel.scrollHeight + 20) + "px"; 
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