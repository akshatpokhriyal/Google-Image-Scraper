let mongoose = require("mongoose");

// Schema
let keywordSchema = mongoose.Schema({
  title: {
    type: String
  }
});

let keyword = (module.exports = mongoose.model("keyword", keywordSchema));
