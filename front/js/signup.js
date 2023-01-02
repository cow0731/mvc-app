/* 
회원가입 API 연동

1. #signup 클릭
2. #userID, #password, nickname 값 확인 (정규표현식 확인)
3. 회원가입 API 요청
4. 요청이 성공적이지 않다면, alert message
5. 요청이 성공하면, jwt를 localstorage에 저장하고 main page 이동

*/

function checkEmailForm(str) {
    var email = str.value;
    var msg = "";
    var color = "";

    const userIDRegExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i; // 이메일 정규식

    if (email.length) {
        msg = "올바른 이메일을 입력하세요";
        color = "red";

        if (userIDRegExp.test(email)) {
            msg = "올바른 이메일 형식입니다";
            color = "green";
        }
    } else {
        msg = "이메일을 입력 해주세요";
        color = "black";
    }
    
    document.getElementById("statusID").innerHTML = msg;
    document.getElementById("statusID").style.color = color;
}

// $(document).ready(function() {
//     $(".id_confirm").on("focusout", function() {
//         var id = $('input[name=id]').val();

//         $.ajax({
//             url: "/sign-up/id-check",
//             type: "post",
//             dataType: "JSON",
//             data: {"id": id}
//         })
//         .done(function(json) {
//             if(json.succYn == "Y" && json.cnt == 0) {
//                 $('#id_div').html('사용가능한 ID입니다');
//             } else {
//                 $('#id_div').html('사용불가능한 ID입니다');
//             }
//         })
//         .fail(function(xhr, status, errorThrown) {
//             console.log("Ajax 통신 실패: "+ errorThrown);
//             $('#id_div').html('<a style="color:red;">통신중 오류가 발생하였습니다</a>');
//         })
//     });

// })

function checkPasswordForm(str) {
    var pass = str.value;
    var message = "";
    var msg1 = "최소 8자 이상, 최대 16자 이하";
    var msg2 = "영문 포함";
    var msg3 = "숫자 포함";
    var color = "";
    var checkPoint = 0;

    const passwordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,16}$/; // 비밀번호 정규식 8-16 문자, 숫자 조합

    if (pass.length) {
        
        document.getElementById("passMsg1").style.display = "";
        document.getElementById("passMsg2").style.display = "";
        document.getElementById("passMsg3").style.display = "";

        if(pass.length < 8 || pass.length > 16) {
            // document.querySelector(".passCheck").style.color = "red";
            $('.passCheck').css("color", "red");
            // document.getElementById("statusPass").innerHTML = "사용불가능한 비밀번호입니다.";
            // document.getElementById("statusPass").style.color = "#FF8C42";
            message = "사용불가능한 비밀번호입니다.";
            color = "#FF8C42";
            
        } else {
            // document.getElementById("passMsg1").style.color = "green";
            $('#passMsg1').css("color", "green");

            // 비밀번호 문자열에 영문 존재 여부 검사
            var pattern1 = /[a-zA-Z]/;
            if(pattern1.test(pass) == false) {
                checkPoint = checkPoint + 1;
            } else {
                // document.getElementById("passMsg2").style.color = "green";
                $('#passMsg2').css("color", "green");
            }

            // 비밀번호 문자열에 숫자 존재 여부 검사
            var pattern2 = /[0-9]/;  // 숫자
            if(pattern2.test(pass) == false) {
                checkPoint = checkPoint + 1;
            } else {
                // document.getElementById("passMsg3").style.color = "green";
                $('#passMsg3').css("color", "green");
            }

            // // 비밀번호 문자열에 영문 소문자 존재 여부 검사
            // var pattern2 = /[a-z]/;
            // if(pattern2.test(pass) == false) {
            //     checkPoint = checkPoint + 1;
            // } else {
            //     check += 1;
            // }

            // // 비밀번호 문자열에 영문 대문자 존재 여부 검사
            // var pattern3 = /[A-Z]/;
            // if(pattern3.test(pass) == false) {
            //     checkPoint = checkPoint + 1;
            // } else {
            //     check += 1;
            // }

            // if (check == 3) {
            //     document.getElementById("passMsg2").style.color = "green";
            // }

            // // 비밀번호 문자열에 특수문자 존재 여부 검사
            // var pattern4 = /[~!@#$%^&*()_+|<>?:{}]/;  // 특수문자
            // if(pattern4.test(pass) == false) {
            //     checkPoint = checkPoint + 1;
            // } else {
            //     document.getElementById("passMsg3").style.color = "green";
            // }

            // if(checkPoint >= 3) {
            //     message = ":: 보안성이 취약한 비밀번호 ::";
            //     color = "#A23E48";
            // } else if(checkPoint == 2) {
            //     message = ":: 보안성이 낮은 비밀번호 ::";
            //     color = "orange";
            // } 

            if(checkPoint >= 1) {
                message = "사용불가능한 비밀번호입니다.";
                color = "#FF8C42";
            } else {
                message = "사용가능한 비밀번호입니다.";
                color = "#0000CD";
            }
            
        }
    } else {
        message = "비밀번호를 입력 해주세요";
        color = "black";
        document.getElementById("passMsg1").style.display = "none";
        document.getElementById("passMsg2").style.display = "none";
        document.getElementById("passMsg3").style.display = "none";
    }
    
    document.getElementById("statusPass").innerHTML = message;
    document.getElementById("statusPass").style.color = color;
    document.getElementById("passMsg1").innerHTML = msg1;
    document.getElementById("passMsg2").innerHTML = msg2;
    document.getElementById("passMsg3").innerHTML = msg3;
    // document.getElementsByClassName("passCheck").style.color = color;
}

const btnSignUp = document.querySelector("#signup");

// 1. #signup 클릭
btnSignUp.addEventListener("click", signup);

async function signup(event) {
  const userID = document.querySelector("#userID").value;
  const password = document.querySelector("#password").value;
  const nickname = document.querySelector("#nickname").value;

  // 2. #email, #password, nickname 값 확인 (정규표현식 확인)
  const userIDRegExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i; // 이메일 정규식
  const passwordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,16}$/; // 비밀번호 정규식 8-16 문자, 숫자 조합
  const nicknameRegExp = /^[가-힣|a-z|A-Z|0-9|]{2,10}$/; // 닉네임 정규식 2-10 한글, 숫자 또는 영문

  if (!userIDRegExp.test(userID)) {
    return alert("아이디 형식: 유효한 이메일을 입력해주세요");
  }
  if (!passwordRegExp.test(password)) {
    return alert("비밀번호 형식: 8-16 문자, 숫자 조합");
  }
  if (!nicknameRegExp.test(nickname)) {
    return alert("닉네임 형식 2-10 한글, 숫자 또는 영문");
  }

  // 3. 회원가입 API 요청
  const signUpReturn = await axios({
    method: "post", // http method
    url: url + "/sign-up",
    headers: {}, // packet header
    data: { userID: userID, password: password, nickname: nickname }, // packet body
  });

  // 4. 요청이 성공적이지 않다면, alert message
  const isValidSignUp = signUpReturn.data.code == 200;

  if (!isValidSignUp) {
    return alert(signUpReturn.data.message);
  }

  // 5. 요청이 성공하면, jwt를 localstorage에 저장하고 main page 이동
  const jwt = signUpReturn.data.result.jwt;
  localStorage.setItem("x-access-token", jwt);
  alert(signUpReturn.data.message);

  return location.replace("./index.html");
}