/* 
1. 지도 생성 & 확대 축소 컨트롤러
2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
3. 여러개 마커 찍기
  * 주소 - 좌표 변환 (지도 라이브러리)
4. 마커에 인포윈도우 붙이기
  * 마커에 클릭 이벤트로 인포윈도우
  * url에서 섬네일 따기
  * 클릭한 마커로 지도 센터 이동
5. 카테고리 분류
*/

/*
**********************************************************
1. 지도 생성 & 확대 축소 컨트롤러
https://apis.map.kakao.com/web/sample/addMapControl/
*/

var container = document.getElementById("map"); //지도를 담을 영역의 DOM 레퍼런스
var options = {
  //지도를 생성할 때 필요한 기본 옵션
  center: new kakao.maps.LatLng(37.54, 126.96), //지도의 중심좌표. 서울 한가운데
  level: 8, //지도의 레벨(확대, 축소 정도) 3에서 8레벨로 확대
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

/*
**********************************************************
2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
*/
async function getDataTotalCnt(category = "") {
 
  let qs = category;

  const dataSet = await axios({
    method: "get", // http method
    url: 'http://localhost:3000/total-count',
    params: {category: qs},
    headers: {}, // packet header
    data: {}, // packet body
  });

  return dataSet.data.result;
}

async function getDataSet(category = "", offset = 1) {
  let qs = category;
  let ofs = (offset - 1) * 5;
  
  const dataSet = await axios({
    method: "get", // http method
    // url: 'http://localhost:3000' + `/restaurants?category=${qs}`,
    url: 'http://localhost:3000/restaurants',
    params: {category: qs, offset: ofs},
    headers: {}, // packet header
    data: {}, // packet body
  });

  return dataSet.data.result;
}

var selectedMarker = null;

// 마커 변수
var MARKER_WIDTH = 33,					// 기본_길이
MARKER_HEIGHT = 36,				// 기본_높이
OFFSET_X = 12,						// 기본_x좌표
OFFSET_Y = MARKER_HEIGHT,			// 기본_y좌표

OVER_MARKER_WIDTH = 40,				// 오버_길이
OVER_MARKER_HEIGHT = 42,				// 오버_높이
OVER_OFFSET_X = 13,					// 오버_x좌표
OVER_OFFSET_Y = OVER_MARKER_HEIGHT,	// 오버_y좌표

// SPRITE_MARKER_URL = document.querySelector('img').src,
SPRITE_MARKER_URL = "https://github.com/cow0731/img/blob/main/markers_sprites.png?raw=true",
SPRITE_WIDTH = 126,			// 전체 이미지_길이
SPRITE_HEIGHT = 510,			// 전체 이미지_높이
SPRITE_GAP = 10;

 // 사이즈 설정
 var markerSize = new kakao.maps.Size(MARKER_WIDTH, MARKER_HEIGHT),
 	 markerOffset = new kakao.maps.Point(OFFSET_X, OFFSET_Y),
 	 overMarkerSize = new kakao.maps.Size(OVER_MARKER_WIDTH, OVER_MARKER_HEIGHT),
 	 overMarkerOffset = new kakao.maps.Point(OVER_OFFSET_X, OVER_OFFSET_Y),
 	 spriteImageSize = new kakao.maps.Size(SPRITE_WIDTH, SPRITE_HEIGHT);

/*
**********************************************************
3. 여러개 마커 찍기
  * 주소 - 좌표 변환
https://apis.map.kakao.com/web/sample/multipleMarkerImage/ (여러개 마커)
https://apis.map.kakao.com/web/sample/addr2coord/ (주소로 장소 표시하기)
*/

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

// 주소-좌표 변환 함수
function getCoordsByAddress(address) {
  return new Promise((resolve, reject) => {
    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(address, function (result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === kakao.maps.services.Status.OK) {
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        resolve(coords);
        return;
      }
      reject(new Error("getCoordsByAddress Error: not Vaild Address"));
    });
  });
}

/* 
*************************************************************
4. 마커에 인포윈도우 붙이기
  * 마커에 클릭 이벤트로 인포윈도우 https://apis.map.kakao.com/web/sample/multipleMarkerEvent/
  * url에서 섬네일 따기
  * 클릭한 마커로 지도 센터 이동 https://apis.map.kakao.com/web/sample/moveMap/
*/

function getContent(data) {
  // 유튜브 섬네일 id 가져오기

  let replaceUrl = data.videoUrl;
  let finUrl = "";
  replaceUrl = replaceUrl.replace("https://youtu.be/", "");
  replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
  replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
  finUrl = replaceUrl.split("&")[0];

  // 인포윈도우 가공하기
  return `
  <div class="infowindow">
      <div class="infowindow-img-container">
        <img
          src="https://img.youtube.com/vi/${finUrl}/mqdefault.jpg"
          class="infowindow-img"
        />
      </div>
      <div class="infowindow-body">
        <h5 class="infowindow-title">${data.title}</h5>
        <p class="infowindow-address">${data.address}</p>
        <a href="${data.videoUrl}" class="infowindow-btn" target="_blank">영상이동</a>
      </div>
    </div>
  `;
}

var isFirstExcute = true;

async function setMap(dataSet, offset) {
  // markerArray = [];
  infowindowArray = [];

  var listEl = document.getElementById('storesList'),
  fragment = document.createDocumentFragment(),
  bounds = new kakao.maps.LatLngBounds();

  // console.log(fragment);

  var markerImage = [],
    markerOverImage = [],
    markerClickImage = [];
    
  closeMarker();
  
  for (var i = 0; i < dataSet.length; i++) {
    var gapX = (MARKER_WIDTH + SPRITE_GAP),
      originY = (MARKER_HEIGHT + SPRITE_GAP) * i,
      overOriginY = (OVER_MARKER_HEIGHT + SPRITE_GAP) * i,
      normalOrigin = new kakao.maps.Point(0, originY),
      overOrigin = new kakao.maps.Point(gapX * 2, overOriginY),
      clickOrigin = new kakao.maps.Point(gapX, originY);
    
      var itemEl = getListItem(i, dataSet[i].restaurantIdx, dataSet[i].title);
      markerImage[i] = createMarkerImage(markerSize, markerOffset, normalOrigin);
      markerOverImage[i] = createMarkerImage(overMarkerSize, overMarkerOffset, overOrigin);
      markerClickImage[i] = createMarkerImage(markerSize, markerOffset, clickOrigin);

    // 마커를 생성합니다
    let coords = await getCoordsByAddress(dataSet[i].address);
    var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: coords, // 마커를 표시할 위치
      clickable: true,
      image: markerImage[i]
    });

    marker.setZIndex(i);
    marker.setMap ( map );
    markerArray.push(marker);
    bounds.extend(coords);

    (function( marker, store ) {
      // 기본 마커이미지, 오버 마커이미지, 클릭 마커이미지를 생성합니다
        
        //marker.normalImage = normalImage;
        
        kakao.maps.event.addListener(marker, 'mouseover', function() {
          //  displayInfowindow(marker, store.storeName);
          if(!selectedMarker || selectedMarker !== marker) {
            marker.setImage(markerOverImage[marker.getZIndex()]);
          }
        });
        
        kakao.maps.event.addListener(marker, 'mouseout', function() {
          infowindow.close();
          if(!selectedMarker || selectedMarker !== marker) {
            marker.setImage(markerImage[marker.getZIndex()]);
          }
        });
        
        kakao.maps.event.addListener(marker, 'click', function() {
            //  displayInfowindow(marker, store.storeName);
              if (!selectedMarker || selectedMarker !== marker) {
                !!selectedMarker && selectedMarker.setImage(markerImage[selectedMarker.getZIndex()]);
                marker.setImage(markerClickImage[marker.getZIndex()]);
              }
              selectedMarker = marker;
        });
        
        itemEl.onmouseover = function() {
          // displayInfowindow(marker, store.storeName);
          if(!selectedMarker || selectedMarker !== marker) {
            marker.setImage(markerOverImage[marker.getZIndex()]);
          }
        };
        itemEl.onmouseout =  function () {
                infowindow.close();
                if(!selectedMarker || selectedMarker !== marker) {
            marker.setImage(markerImage[marker.getZIndex()]);
          }
        };
      
        $('#storesList').on("click touchend", "#item"+i, function() {
              
          $('#storesList li').removeClass('active');
          $(this).addClass('active');
          // renderStore ( store );
          // displayInfowindow(marker, store.title);
          if (!selectedMarker || selectedMarker !== marker) {
                !!selectedMarker && selectedMarker.setImage(markerImage[selectedMarker.getZIndex()]);
                marker.setImage(markerClickImage[marker.getZIndex()]);
            }
            selectedMarker = marker;
        });
      }) (marker, dataSet[i])

      fragment.appendChild(itemEl);

    // 마커에 표시할 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
      content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
    });

    infowindowArray.push(infowindow);

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    // 이벤트 리스너로는 클로저를 만들어 등록합니다
    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
    kakao.maps.event.addListener(
      marker,
      "click",
      makeOverListener(map, marker, infowindow, coords)
    );
    kakao.maps.event.addListener(map, "click", makeOutListener(infowindow));
  }
  
  // displayPagination(dataSet, dataSet.length);
  // 검색결과 항목들을 검색결과 목록 Elemnet에 추가합니다
  listEl.innerHTML = '';
  listEl.appendChild(fragment);
  map.setBounds(bounds);
}

function createMarkerImage(markerSize, offset, spriteOrigin) {
  var markerImage = new kakao.maps.MarkerImage(
      SPRITE_MARKER_URL, // 스프라이트 마커 이미지 URL
      markerSize, // 마커의 크기
      {
          offset: offset, // 마커 이미지에서의 기준 좌표
          spriteOrigin: spriteOrigin, // 스트라이프 이미지 중 사용할 영역의 좌상단 좌표
          spriteSize: spriteImageSize // 스프라이트 이미지의 크기
      }
  );
  
  return markerImage;
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
// 1. 클릭시 다른 인포윈도우 닫기
// 2. 클릭한 곳으로 지도 중심 옮기기
function makeOverListener(map, marker, infowindow, coords) {
  return function () {
    // 1. 클릭시 다른 인포윈도우 닫기
    closeInfoWindow();
    infowindow.open(map, marker);
    // 2. 클릭한 곳으로 지도 중심 옮기기
    map.panTo(coords);
  };
}

let infowindowArray = [];
function closeInfoWindow() {
  for (let infowindow of infowindowArray) {
    infowindow.close();
  }
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다
function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}

/*
**********************************************
5. 카테고리 분류
*/

var category = "";

// 카테고리
const categoryMap = {
  korea: "한식",
  china: "중식",
  japan: "일식",
  america: "양식",
  wheat: "분식",
  meat: "구이",
  sushi: "회/초밥",
  etc: "기타",
};

const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

async function categoryHandler(event) {
  const categoryId = event.target.id;
  category = categoryMap[categoryId];

  try {
    // 데이터 분류
    let categorizedDataSet = await getDataSet(category);
    const dataTotalCnt = await getDataTotalCnt(category);
    // 기존 마커 삭제
    closeMarker();

    // 기존 인포윈도우 닫기
    closeInfoWindow();

    setMap(categorizedDataSet, 1);
    displayPagination(categorizedDataSet, dataTotalCnt[0].totalCnt);
    // if (dataTotalCnt[0].totalCnt != 0) {
    //   render(page, dataTotalCnt[0].totalCnt);
    // }
  } catch (error) {
    console.error(error);
  }
}

// 리스트에 넣을 음식점 목록을 Element로 반환하는 함수입니다
function getListItem(index, resIdx, places) {
  var el = document.createElement('li'),
  itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
              '<div class="info">' +
              '   <h4>' + places + '</h4>' + 
             /*  '<div id="button">'+ */
             '<input type="hidden" id="restaurantIdx" value='+ resIdx +'></input>'+
      '<button id="select_button" type="submit" class="btn btn-info">선택</button>'+
      '</div>';

  el.innerHTML = itemStr;
  el.className = 'item';
  el.id = 'item'+index;
  return el;
}

//검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
//인포윈도우에 장소명을 표시합니다
function displayInfowindow(marker, title) {
  var content = '<div style="padding:5px;z-index:1;color:#333;">' + title + '</div>';
  infowindow.setContent(content);
  infowindow.open(map, marker);
 }

// 페이지네이션
/*
const contents = document.querySelector(".pagination");
const buttons = document.querySelector(".page-buttons");

// const numOfContent = 178;
const maxContent = 5;
const maxButton = 3;
// const maxPage = Math.ceil(numOfContent / maxContent);
let page = 1;

const makeButton = (id) => {
  const button = document.createElement("button");
  button.classList.add("button");
  button.dataset.num = id;
  button.innerText = id;
  button.addEventListener("click", async (e) => {
    Array.prototype.forEach.call(buttons.children, (button) => {
      if (button.dataset.num) button.classList.remove("active");
    });
    e.target.classList.add("active");
    const dataSet = await getDataSet(category, parseInt(e.target.dataset.num));
    setMap(dataSet, parseInt(e.target.dataset.num));
    // renderContent(parseInt(e.target.dataset.num));
  });
  return button;
};

const goPrevPage = async() => {
  const dataTotalCnt = await getDataTotalCnt();
  page -= maxButton;
  render(page, dataTotalCnt[0].totalCnt);
};

const goNextPage = async() => {
  const dataTotalCnt = await getDataTotalCnt();
  page += maxButton;
  
  render(page, dataTotalCnt[0].totalCnt);
};

const prev = document.createElement("button");
prev.classList.add("button", "prev");
prev.innerHTML = '<ion-icon name="chevron-back-outline"></ion-icon>';
prev.addEventListener("click", goPrevPage);

const next = document.createElement("button");
next.classList.add("button", "next");
next.innerHTML = '<ion-icon name="chevron-forward-outline"></ion-icon>';
next.addEventListener("click", goNextPage);

// const renderContent = (page, totalCnt) => {
//   // 목록 리스트 초기화
//   while (contents.hasChildNodes()) {
//     contents.removeChild(contents.lastChild);
//   }
//   // 글의 최대 개수를 넘지 않는 선에서, 화면에 최대 10개의 글 생성
//   for (let id = (page - 1) * maxContent + 1; id <= page * maxContent && id <= totalCnt; id++) {
//     contents.appendChild(makeContent(id));
//   }
// };

const renderButton = (page, totalCnt) => {
  const maxPage = Math.ceil(totalCnt / maxContent);
  // 버튼 리스트 초기화
  while (buttons.hasChildNodes()) {
    buttons.removeChild(buttons.lastChild);
  }
  // 화면에 최대 5개의 페이지 버튼 생성
  for (let id = page; id < page + maxButton && id <= maxPage; id++) {
    buttons.appendChild(makeButton(id));
  }
  // 첫 버튼 활성화(class="active")
  buttons.children[0].classList.add("active");

  buttons.prepend(prev);
  buttons.append(next);

  // 이전, 다음 페이지 버튼이 필요한지 체크
  if (page - maxButton < 1) buttons.removeChild(prev);
  if (page + maxButton > maxPage) buttons.removeChild(next);
};

const render = (page, totalCnt) => {
  // renderContent(page, totalCnt);
  renderButton(page, totalCnt);
};
*/
//검색결과 목록 하단에 페이지번호를 표시는 함수입니다
function displayPagination( dataSet, storeCnt ) {		// 파라미터로 총 음식점 개수
	
	var pageNum = Math.floor(storeCnt / 5);	// 보여야할 페이지 수
	var tailNum = storeCnt % 5;
	var npage;
	
	$('.pagination').empty();
	
	if(tailNum === 0) {
		pageNum = pageNum;
	} else {
		pageNum += 1;
	}
	
	$('.pagination').twbsPagination({
    totalPages: storeCnt, // 전체 페이지
    startPage: 1, // 시작(현재) 페이지
    visiblePages: 3, // 최대로 보여줄 페이지
    prev: "이전",
    next: "다음",
    first: '«',
    last: '»',
    onPageClick: async function (event, page) { // Page Click event
        console.info("current page : " + page);
        // console.log(pageNum, storeCnt);
        // setMap 호출하며 page 매개변수로 넘기기 22.11.07
        // console.log(isFirstExcute);

        if(isFirstExcute) {
          // 페이지를 처음 접근했을 때만 return;
          return;
        }

        const dataSet = await getDataSet('', page);
        setMap(dataSet, page);
    }
  });
}

let markerArray = [];
function closeMarker() {
  for (marker of markerArray) {
    marker.setMap(null);
  }
     
  markerArray = [];
}

async function setting() {
  try {
    // isFirstExcute === ture
    const dataTotalCnt = await getDataTotalCnt();
    const dataSet = await getDataSet();
    setMap(dataSet, 1);
    // render(page, dataTotalCnt[0].totalCnt);
    displayPagination(dataSet, dataTotalCnt[0].totalCnt);
  } catch (error) {
    console.error(error);
  } finally {
    isFirstExcute = false;
  }
}

setting();