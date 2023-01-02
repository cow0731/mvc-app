/*
요구사항
1. 로그인이 되어있지 않을 시, 선택 click -> alert 창 표시
2. 음식점 리스트에서 선택 click -> DB(해당 로그인 유저)에 저장  
*/
function getUserIdx() {
    // 토큰 유무 및 검증은 header.js에서 진행하고
    // select.js는 검증된 토큰에 저장된 user 정보를 사용함
    const jwt = localStorage.getItem("x-access-token");
    const parsed = JSON.parse(window.atob(jwt.split('.')[1]));

    return parsed.userIdx;
}

// 선택 버튼 click 시 (버블링 사용)
function setEventListner() {
    document.getElementById("storesList").addEventListener("click", selectRestaurant);
    
    // for (var i = 0; i < btnSelectRt.length; i++) {
    //     btnSelectRt[i].addEventListener("click", selectRt);
    //   }
    // 1. #select_button 클릭
    // btnSelectRt.addEventListener("click", selectRt);
}

selectRestaurant = async (event) => {
    const target = event.target;
    const classList = target.classList.value;
    
    // classList : 앞에 있는 엘리먼트의 class를 배열로 반환
    // 버튼 말고 다른 거 클릭 시 반환
    if (!classList.includes('btn-info')) {
        return;
    }
    
    const parentEl = target.parentElement;
    const title = parentEl.querySelector('h4').innerText;
    // 템플릿 리터럴: backtick(`), ${}를 통해 변수를 string에 사용 가능
    const isConfirm = window.confirm(`${title}을(를) 나만의 맛집 리스트에 저장하시겠습니까?`);

    // 클린코딩임.
    if (!isConfirm) {
        return;
    }

    // restaurantIdx값과 userIdx 값을 DB에 저장
    // element.value, element.innerText 차이 검색해봐
    // querySelector 검색해봐
    const restaurantIdx = parseInt(parentEl.querySelector("#restaurantIdx").value);
    console.log("식당 id:", restaurantIdx);
    console.log('유저 id:', getUserIdx());
    
    const addSelectedRestaurantReturn = await axios({
        method: "post", // http method
        url: url + "/selected-res",
        headers: {}, // packet header
        data: { userId: getUserIdx(), resId: restaurantIdx }, // packet body
    });

    location.replace("./myselected.html");
}

window.onload = function() {
    // console.log(document.getElementById("storesList"));
    setEventListner();
}