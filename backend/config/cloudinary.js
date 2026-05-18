const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "drdaiwuae",
  api_key: "724571397544991",
  api_secret: "rqBEwy8Dn5Kfd3jGaJVIDPtPTcY",
});

module.exports = cloudinary;

