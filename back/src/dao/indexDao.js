const { pool } = require("../../config/database");

// 로그인 (회원검증)
exports.isValidUsers = async function (connection, userID, password) {
  const Query = `SELECT userIdx, nickname FROM Users where userID = ? and password = ? and status = 'A';`;
  const Params = [userID, password];

  const rows = await connection.query(Query, Params);

  return rows;
};

// ID 중복체크
exports.checkUser = async function (connection, userID) {
  const Query = `SELECT * FROM Users where userID = ?;`;
  const Params = [userID];

  const rows = await connection.query(Query, Params);

  return rows;
};

// 회원가입
exports.insertUsers = async function (connection, userID, password, nickname) {
  const Query = `insert into Users(userID, password, nickname) values (?,?,?);`;
  const Params = [userID, password, nickname];

  const rows = await connection.query(Query, Params);

  return rows;
};

// 유저별 맛집 추가
exports.addSelectedRes = async function (connection, userId, resId) {
  const Query = `insert into Selecting(userId, resId) values (?,?);`;
  const Params = [userId, resId];

  const rows = await connection.query(Query, Params);

  return rows;
};

// 유저별 맛집 조회
exports.selectMyRestaurants = async function (connection, userId) {
  const Query = `SELECT s.selectIdx, s.userId, r.restaurantIdx, r.title, r.address FROM Selecting s JOIN Restaurants r ON r.restaurantIdx = s.resId where s.status = 'A' and userId = ?;`;

  const Params = [userId];

  const rows = await connection.query(Query, Params);

  return rows;
};

// 총 음식점 개수
exports.selectTotalCnt = async function (connection, category) {
  const selectAllRestaurantsTotalCntQuery = `SELECT COUNT(*) as totalCnt FROM Restaurants where status = 'A';`;
  const selectRestaurantsTotalCntQuery = `SELECT COUNT(*) as totalCnt FROM Restaurants where status = 'A' and category = ?;`;
  
  const Params = [category];

  const Query = category
    ? selectRestaurantsTotalCntQuery
    : selectAllRestaurantsTotalCntQuery;

  const row = await connection.query(Query, Params);

  return row;
};

// 식당 조회
exports.selectRestaurants = async function (connection, category, offset) {
  const selectAllRestaurantsQuery = `SELECT restaurantIdx, title, address, category, videoUrl FROM Restaurants where status = 'A' ORDER BY restaurantIdx ASC LIMIT ?, 5;`;
  const selectCategorizedRestaurantsQuery = `SELECT restaurantIdx, title, address, category, videoUrl FROM Restaurants where status = 'A' and category = ? ORDER BY restaurantIdx ASC LIMIT ?, 5;`;

  const Params = category
    ? [category, offset]
    : [offset];

  const Query = category
    ? selectCategorizedRestaurantsQuery
    : selectAllRestaurantsQuery;

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.deleteStudent = async function (connection, studentIdx) {
  const Query = `update Students set status = "D" where studentIdx = ?;`;
  const Params = [studentIdx];

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.updateStudents = async function (
  connection,
  studentIdx,
  studentName,
  major,
  birth,
  address
) {
  const Query = `update Students set studentName = ifnull(?, studentName), major = ifnull(?, major), birth = ifnull(?, birth), address = ifnull(?, address) where studentIdx = ?;`;
  const Params = [studentName, major, birth, address, studentIdx];

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.isValidStudentIdx = async function (connection, studentIdx) {
  const Query = `SELECT * FROM Students where studentIdx = ? and status = 'A';`;
  const Params = [studentIdx];

  const [rows] = await connection.query(Query, Params);

  if (rows < 1) {
    return false;
  }

  return true;
};

exports.insertStudents = async function (
  connection,
  studentName,
  major,
  birth,
  address
) {
  const Query = `insert into Students(studentName, major, birth, address) values (?,?,?,?);`;
  const Params = [studentName, major, birth, address];

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.selectStudents = async function (connection, studentName) {
  const selectAllStudentsQuery = `SELECT * FROM Students;`;
  const selectStudentByNameQuery = `SELECT * FROM Students where studentName = ?;`;
  const Params = [studentName];

  let Query = studentName ? selectStudentByNameQuery : selectAllStudentsQuery;

  // if (!studentName) {
  //   Query = selectAllStudentsQuery;
  // } else {
  //   Query = selectStudentByNameQuery;
  // }

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.exampleDao = async function (connection, params) {
  const Query = `SELECT * FROM Students;`;
  const Params = [];

  const rows = await connection.query(Query, Params);

  return rows;
};
