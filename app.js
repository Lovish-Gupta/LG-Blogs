require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent = "Hey! Welcome to my Blog channel. Here you can find some basic concepts and their code snippets (mostly in c++) used in competitive programming and problem solving. I will also try to upload solutions to the questions that i find amazing.";

const aboutContent = "Hey! I'm <strong>Lovish Gupta</strong>, a final year Computer Science undergraduate from Thapar Institute of Engineering and Technology. ";
const contactContent = "lovish.gupta.121@gmail.com";

const app = express();

mongoose.connect("mongodb+srv://" + process.env.MONGO_CREDENTIALS + "/blog",  { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });

const blogSchema = {
  title: String,
  body: String,
  code: String
};

const Blog = mongoose.model("blog", blogSchema);

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req,res){
  Blog.find({},function(err,blogs){
    res.render("home", {
      firstDay: homeStartingContent,
      journals: blogs
    });
  });
});

app.get("/about", function(req,res){
  res.render("about", {about: aboutContent})
});

app.get("/contact", function(req,res){
  res.render("contact", {contact: contactContent});
});

app.get("/compose", function(req,res){
  res.render("compose",{
    editTitle: "",
    editBody: "",
    Publish: "Publish",
    editCode: ""
  });
})

app.get("/posts/:postTitle", function(req, res){  
  Blog.findOne({title: _.startCase(_.toLower(req.params.postTitle))}, function(err, post){
    if(!err)
    {
      res.render("post",{
      postTitle: post.title,
      postBody: post.body,
      postCode: post.code
      });
    }
    else
      console.log(err);
  });    
});

app.get("/posts/:postTitle/admin", function(req, res){  
  Blog.findOne({title: _.startCase(_.toLower(req.params.postTitle))}, function(err, post){
    if(!err)
    {
      res.render("post-admin",{
      postTitle: post.title,
      postBody: post.body,
      postCode: post.code
      });
    }
    else
      console.log(err);
  });    
});

app.post("/compose", function(req,res){
  if(req.body.submit === "Publish")
  {
    Blog.findOne({title: _.startCase(_.toLower(req.body.postTitle))}, function(err,post){
    if(!post)
    {
      const post = new Blog({
        title: _.startCase(_.toLower(req.body.postTitle)),
        body: req.body.postBody,
        code: req.body.code
      });
      post.save();
      res.redirect("/");
    }
    else
      res.render("compose",{
        editTitle: "Post with same title already exists, please change the title",
        editBody: req.body.postBody,
        Publish: "Publish",
        editCode: req.body.code
      });
    })
  }
  else{
    Blog.findOneAndUpdate({title: _.startCase(_.toLower(req.body.prevTitle))}, {title: _.startCase(_.toLower(req.body.postTitle)), body: req.body.postBody, code: req.body.code}, function(err)
    {
      if(!err)
      {
        res.redirect("/posts/" + _.startCase(_.toLower(req.body.postTitle)));
      }
    });
  }
})

app.post("/edit", function(req,res){
  const title = req.body.edit;
  Blog.findOne({title: title},function(err,post){
    if(!err)
    {
      const len = post.code.length;
      res.render("compose",{
        editTitle: title,
        editBody: post.body,
        Publish: "Save Changes",
        editCode: post.code
      });
    }
  })
});

app.post("/delete", function(req, res){
    Blog.deleteOne({title: _.startCase(_.toLower(req.body.delete))}, function(err){
      if(!err)
        res.redirect("/");
      else
        console.log(err);
    });
  });  
// })













app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
