const express = require("express");
const bodyParser = require("body-parser");
const Scraper = require("images-scraper");

const google = new Scraper.Google();

const mongoose = require("mongoose");

//Database connection
mongoose.connect("mongodb://akshat:image123@ds013599.mlab.com:13599/image");
let db = mongoose.connection;

// Init App
const app = express();

// model
let Keyword = require("./models/keyword");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Routes

app.get("/", (req, res) => {
  res.render("index", { output: null });
});

app.post("/", (req, res) => {
  Keyword.find({}, (err, keywords) => {
    if (err) {
      console.log(err);
    } else {
      let text = req.body.text;
      let check;
      for (let i = keywords.length - 1; i >= 0; i--) {
        if (keywords[i].title === text) {
          check = true;
          break;
        } else {
          check = false;
        }
      }

      if (check === true) {
        res.redirect("/" + text);
      } else {
        let keyword = new Keyword();
        keyword.title = req.body.text;
        keyword.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            let text = req.body.text;
            res.redirect("/" + text);
          }
        });
      }
    }
  });
});

app.get("/:text", (req, res) => {
  let text = req.params.text;

  google
    .list({
      keyword: text,
      num: 10,
      detail: true,
      nightmare: {
        show: false
      }
    })
    .then(response => {
      let result = response;
      let output = result.map(result => result.url);
      res.render("index", { output: output });
    })
    .catch(err => {
      console.log("err", err);
    });
});
app.post("/:text", (req, res) => {
  let text = req.body.text;
  res.redirect("/" + text);
});

app.get("/search/keywords", (req, res) => {
  Keyword.find({}, (err, keywords) => {
    if (err) {
      console.log(err);
    } else {
      res.render("keywords", { keywords: keywords });
      console.log(keywords);
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("File Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render("404");
});

// Set Port
app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), function() {
  console.log("Server started on port " + app.get("port"));
});
