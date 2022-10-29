//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb://localhost:27017/blogDB",{useNewUrlParser:true,useUnifiedTopology:true});




const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["welcome", "click checkbox to delete", "check it out"];
const itemSchema = new mongoose.Schema({
  itemName:String
});

const Item = new mongoose.model("item",itemSchema);

const def1 = new Item({
  itemName:"welcome"
});
const def2 =new Item({
  itemName:"click checkbox to delete"
});
const def3 = new Item({
  itemName:"check it out"
});

const defItems = [def1,def2,def3];

const listSchema = new mongoose.Schema({
  name : String,
  items: [itemSchema]
});

const List = new mongoose.model("list",listSchema);


app.get("/", function(req, res) {

 Item.find(function(err,items){

     if(items.length === 0){
        Item.insertMany([def1,def2,def3],function(err){
          if(!err){
            console.log("succcess!");
          }
        });
        res.redirect("/");
      }
     else{
      res.render("list", {listTitle: "Today", newListItems: items});
     }
   
 });
  
});

app.post("/delete",function(req,res){

  const checkedId = req.body.checked;
  // console.log(req.body.checked);
if(req.body.ck === "Today"){
 
  Item.findByIdAndRemove(checkedId,function(err){
      
   if(!err){
     console.log("deleted");
     res.redirect("/");
   }
   
  });
}
else{
  List.findOneAndUpdate({name:req.body.ck},{$pull:{items:{_id:checkedId}}},function(err,foundlist){

    if(!err){
      res.redirect("/"+req.body.ck);
    }
  });
}
}); 

app.get("/:customName",function(req,res){

const customName = req.params.customName;
List.findOne({name: customName}, function(err,foundlist){
  if(!err){
    if(!foundlist){
      const list = new List({
        name: req.params.customName,
        items: [def1,def2,def3]
      });

      list.save(function(err, result) { // Log the result parameter to the console to review it
        res.redirect("/" + customName);
      });

    }
    else{
      res.render("list",{listTitle:foundlist.name , newListItems:foundlist.items});
    }
  }
});


});

app.post("/", function(req, res){

  const addItem = new Item({
    itemName:req.body.newItem
  });

  if(req.body.list=== "Today"){

    addItem.save();
 
    res.redirect("/");
  }
  else{
    List.findOne({name:req.body.list},function(err,doocs){
      
      doocs.items.push(addItem);
    
      doocs.save();
    res.redirect("/"+req.body.list);
  });
  }

});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
