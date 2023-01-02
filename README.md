# mvc-app (졸업 프로젝트)

### Kakao 지도 API를 활용한 맛집 기록 웹 서비스 <부제: 먹보카>

#### 1. 연구목적
- 웹 서비스인 먹보카는 사용자들이 자신의 맛집을 지도 서비스를 통해서 기록하고, 기록한 맛집은 지도를 통해 한눈에 확인할 수 있도록 하는 것이 목표이다.

#### 2. 사용기술
  - front
    - HTML, CSS, javascript
  - backend
    - Node.js, MySQL
    
#### 3. DB 설계

![image](https://user-images.githubusercontent.com/22956580/210199123-74fe5327-58a6-4190-be0e-1bea75bff6f8.png)

##### users 테이블
|이름|정의|
|:--|:--|
|userIdx|기본키|
|nickname|사용자의 닉네임|
|userID|사용자의 이메일 ID|
|password|사용자의 비밀번호|

##### restaurants 테이블
|이름|정의|
|:--|:--|
|restaurantIdx|기본키|
|title|음식점의 이름|
|address|음식점의 주소|
|videoUrl|음식점의 관련 유튜브 Url|
|category|음식점의 카테고리|

##### selecting 테이블
|이름|정의|
|:--|:--|
|selectIdx|기본키|
|userId|users 테이블의 기본키|
|resId|restaurants 테이블의 기본키|

#### 4. 구현화면

[로그인 페이지]
![image](https://user-images.githubusercontent.com/22956580/210199762-baecffbe-c155-423e-bde6-8c22d3eb3155.png)

[회원가입 페이지]
![image](https://user-images.githubusercontent.com/22956580/210200098-ff8373d1-871c-4c23-820c-c21a26b68cb0.png)

[회원가입 Validation 처리]
![image](https://user-images.githubusercontent.com/22956580/210200134-4176c1cb-3086-46cb-9964-b4e6e7b6a1b9.png)

[메인 페이지]
![image](https://user-images.githubusercontent.com/22956580/210200148-dc382440-3705-40e7-9fbf-82ebf2d5cf0f.png)

[나의 맛집 일지 페이지]
![image](https://user-images.githubusercontent.com/22956580/210200167-a00510f6-9abf-4de8-bce6-be1795c8ae4f.png)
