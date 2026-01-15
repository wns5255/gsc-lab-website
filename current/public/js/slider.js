const slidewrap = document.querySelector(".slidewrap");
const slidescnt = document.querySelectorAll(".slide").length;
const slideContainer = document.getElementsByClassName("slides");
const slideWidth = slidewrap.offsetWidth;
let currentSlide = 0;

/*  공통으로 이용할 함수
        슬라이드 이동 함수
            해당 기능에는 페이지네이션 HTML에 class를 이동하여 현 위치를 마크해야함
        CSS 삽입 함수
*/

//슬라이드 이동 함수
function goToSlide(index){
    currentSlide = index;
    slideContainer[0].style.transition = 'transform 0.5s ease';
    slideContainer[0].style.transform = `translateX(-${slideWidth * currentSlide}px)`;

    //페이지네이션 Class 부여하기
    const pagination = document.querySelectorAll(".pagination li");
    for (let i = 0 ; i < pagination.length ; i++){
        if(i === index){
            pagination[i].classList.add("act");
            continue;
        }
        pagination[i].classList.remove("act");
    }
}

//CSS 삽입 함수
function AddStyle(style){
    const styleTag = document.createElement('style');
    styleTag.innerHTML = style;
    document.head.appendChild(styleTag);
}

/*  페이지네이션 생성 함수
        HTML 삽입
        CSS 삽입 (공통함수 사용)
        페이지네이션 이벤트 등록 (공통함수 이벤트 함수)
*/

// 페이지네이션 생성
function Createpagination(){
    //HTML Tag 생성
    slidewrap.innerHTML += `<div class="pagination"></div>`;
    const pagination = document.querySelector(".pagination");
    for (let i = 1 ; i < slidescnt; i++){
        if(i===1){pagination.innerHTML += `<li class="act"><a>•</a></li>`;}
        pagination.innerHTML += `<li><a>•</a></li>`;
    }

    //CSS 생성
    const paginationStyle = `
        .pagination {
            display : flex;
            position : absolute;
            left : 50%;
            transform: translateX(-50%);
            bottom : 0;
        }
        .pagination li{
            font-size : 50px;
            list-style: none;
            color:  white;
            opacity: 0.5;
        }
        .pagination .act{
            opacity: 1;
        }
    `
    AddStyle(paginationStyle);

    //페이지네이션 이벤트 생성
    const paginationlink = document.querySelectorAll(".pagination li a");
    paginationlink.forEach((link, index) => {
        link.addEventListener('click', (event) => {
          event.preventDefault(); // 기본 앵커 링크 동작을 막습니다.
          goToSlide(index);
        });       
    });
}




/*  버튼 생성 함수
        HTML 삽입
        CSS 삽입 (공통함수 사용)
        버튼 이벤트 등록 (공통함수 이벤트 함수)
*/
// 버튼생성
function Createbtn(){
    //HTML Tag 생성
    slidewrap.innerHTML += `<div class="leftbtn slide_bnt">‹</div>`;
    slidewrap.innerHTML += `<div class="rightbtn slide_bnt">›</div>`;
    //CSS 생성
    const BtnStyle = `
        .slide_bnt {
            display : flex;
            position : absolute;
            bottom : calc(50% - 60px);
            width: 100px;
            font:var(--bs-font-monospace);
            height : 120px;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 120px;
            font-weight:bold;
            // border: 1px solid white;
            // border-radius: 20px;
        }
        .leftbtn{
            left : 20px;
        }
        .rightbtn{
            right : 20px;
        }
    `
    AddStyle(BtnStyle);
    
    //버튼 이벤트 생성
    const BtnL = document.querySelector(".leftbtn");
    BtnL.addEventListener('click',(event)=>{
        event.preventDefault(); // 기본 앵커 링크 동작을 막습니다.
        const index = (currentSlide-1) >=0 ? currentSlide-1 : slidescnt-1; // 삼항 연산을 통해 페이지 이동 최소 값 제한
        goToSlide(index);
    })
    const BtnR = document.querySelector(".rightbtn");
    BtnR.addEventListener('click',(event)=>{
        event.preventDefault(); // 기본 앵커 링크 동작을 막습니다.
        const index = (currentSlide+1) < slidescnt ? currentSlide+1 : 0; //삼항 연산을 통해 페이지 이동 최대 값 제한
        goToSlide(index);
    })    
}
/* 슬라이드 터치 또는 스와이프 생성 함수

*/
// 사용할 변수 
let startpos = 0;
let endpos = 0;
function Createdrag(){
    //마우스를 클릭 시작
    slideContainer[0].addEventListener("mousedown",(event)=>{
        startpos = event.pageX;
    })
    //마우스를 클릭 해제
    slideContainer[0].addEventListener("mouseup",(event)=>{
        endpos = event.pageX;

        //시작과 종료 지점의 포지션 값 비교 후 슬라이드 이동 실행 및 초기화
        if (startpos < endpos){
            const index = (currentSlide-1) >=0 ? currentSlide-1 : slidescnt-1; // 삼항 연산을 통해 페이지 이동 최소 값 제한
            goToSlide(index);
        }
        else{
            const index = (currentSlide+1) < slidescnt ? currentSlide+1 : 0; //삼항 연산을 통해 페이지 이동 최대 값 제한
            goToSlide(index);
        }
        //pos 값 초기화
        startpos = 0;
        endpos = 0;

    })
    //터치 시작
    slideContainer[0].addEventListener("touchstart",(event)=>{
        startpos = event.touches[0].pageX;
    })
    //터치 해제
    slideContainer[0].addEventListener("touchend",(event)=>{
        endpos = event.touches[0].pageX;

        //시작과 종료 지점의 포지션 값 비교 후 슬라이드 이동 실행 및 초기화
        if (startpos < endpos){
            const index = (currentSlide-1) >=0 ? currentSlide-1 : slidescnt-1; // 삼항 연산을 통해 페이지 이동 최소 값 제한
            goToSlide(index);
        }
        else{
            const index = (currentSlide+1) < slidescnt ? currentSlide+1 : 0; //삼항 연산을 통해 페이지 이동 최대 값 제한
            goToSlide(index);
        }
                //pos 값 초기화
                startpos = 0;
                endpos = 0;
    })
}
/*  무한 루프 자동 슬라이드 구현 (사실 next slide일 뿐)

*/
let Autoslideactive = null ; // 슬라이드 자동 이동 호출을 변수 화
function autoslide(){
    const index = (currentSlide+1) < slidescnt ? currentSlide+1 : 0;
    goToSlide(index);
}

/*  마우스 감지 시 슬라이드 자동 멈추기

*/
function Createmousedetector(){
    //마우스가 슬라이드에 올라왔을 때
    slideContainer[0].addEventListener("mouseover",(event)=>{
        clearInterval(Autoslideactive);
    })
    //마우스가 슬라이드에서 나온 경우 다시 실행
    slideContainer[0].addEventListener("mouseout",(event)=>{
        Autoslideactive = setInterval(autoslide,3000);
    })
}
//웹 브라우저 시작
Createpagination();
Createbtn();
Createdrag();
Autoslideactive = setInterval(autoslide,3000); //일정 시간마다 호출
Createmousedetector();