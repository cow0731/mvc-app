/*
토큰 검증 API 연동

1. 로컬스토리지에서 x-access-token 확인
2. 토큰 검증 API 요청
3. 유효한 토큰이 아니라면, 로그아웃
4. 유효한 토큰이라면 로그인 상태 확인. 헤더 로그인/회원가입 -> 안녕하세요 (닉네임)님으로 수정


---
로그아웃 버튼 이벤트 연결

*/

// 1. 로컬스토리지에서 x-access-token 확인
setHeader();

// 로그아웃 버튼 이벤트 연결
const btnSignOut = document.querySelector("#sign-out");
btnSignOut.addEventListener("click", signOut);

async function setHeader() {
  const jwt = localStorage.getItem("x-access-token");

  if (!jwt) {
    return location.replace("./signin.html");
  }

  // 2. 토큰 검증 API 요청
  let isValidJwt;
  let jwtReturn;
  try {
    jwtReturn = await axios({
        method: "get", // http method
        url: url + "/jwt",
        headers: { "x-access-token": jwt }, // packet header
        data: {}, // packet body
    });

    isValidJwt = jwtReturn.data.code == 200;
  } catch(err) {
      console.error(err);
      signOut();
  }

  // 3. 유효한 토큰이 아니라면, 로그아웃
  if (!isValidJwt) {
      return signOut();
  }
  
  // 4. 유효한 토큰이라면 로그인 상태 확인. 헤더 로그인/회원가입 -> 안녕하세요 (닉네임)님으로 수정
  const userIdx = jwtReturn.data.result.userIdx;
  const nickname = jwtReturn.data.result.nickname;

  // .unsigned에 .hidden 추가, .signed에 .hidden 삭제
  // .nickname의 innerText로 nickname 설정
  const divUnsigned = document.querySelector(".unsigned");
  const divSigned = document.querySelector(".signed");
  // const spanNickname = document.querySelector(".nickname");

  divUnsigned.classList.add("hidden");
  divSigned.classList.remove("hidden");
  // spanNickname.innerText = nickname;
  $(".nickname").text(nickname);
}

function signOut(event) {
  localStorage.removeItem("x-access-token"); // 토큰 삭제하고
  location.replace("./signin.html");
}