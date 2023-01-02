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
async function getDataSet() {
  const userId = getUserIdx();
  
  const dataSet = await axios({
    method: "get", // http method
    url: 'http://localhost:3000/my-restaurants',
    params: {userId: userId},
    headers: {}, // packet header
    data: {}, // packet body
  });

  return dataSet.data.result;
}

var selectedMarker = null;

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

var isFirstExcute = true;

async function setMap(dataSet) {
  markerArray = [];
  infowindowArray = [];

  var listEl = document.getElementById('storesList'),
  fragment = document.createDocumentFragment(),
  bounds = new kakao.maps.LatLngBounds();

  // console.log(fragment);
    
  closeMarker();
  
  for (var i = 0; i < dataSet.length; i++) {
    
    var itemEl = getListItem(i, dataSet[i].title);
     
    // 마커를 생성합니다
    let coords = await getCoordsByAddress(dataSet[i].address);
    var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: coords, // 마커를 표시할 위치
    });

    marker.setZIndex(i);
    // marker.setMap ( map );
    markerArray.push(marker);
    bounds.extend(coords);

    fragment.appendChild(itemEl);

    // 마커에 표시할 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
      content: dataSet[i].title, // 인포윈도우에 표시할 내용
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

// 리스트에 넣을 음식점 목록을 Element로 반환하는 함수입니다
function getListItem(index, places) {
  var el = document.createElement('li'),
  itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
              '<div class="info">' +
              '   <h4>' + places + '</h4>' + 
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

let markerArray = [];
function closeMarker() {
  for (marker of markerArray) {
    marker.setMap(null);
  }
     
  markerArray = [];
}

async function setting() {
  try {
    const dataSet = await getDataSet();
    setMap(dataSet);
  } catch (error) {
    console.error(error);
  } finally {
    isFirstExcute = false;
  }
}

setting();