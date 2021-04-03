// jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//connection String
mongoose.connect("mongodb://localhost:27017/todolistDB",{ useUnifiedTopology: true });
//schema defining
const itemsSchema={
  name:String
};
//Model Definition
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to our todo List"
});
const item2=new Item({
  name:"Hit the + button to add a new item"
});
const item3=new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("list",listSchema);


app.get("/",function(req,res){

  Item.find(function(err,foundItems){

    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        }
        else {
          console.log("Items inserted to Database");
        }
      });
      res.redirect("/");
    }

    res.render("list",{listTitle:"Today", newListItems:foundItems});
  });

});

app.post("/",function(req,res){
  const itemName=req.body.newitem;
  const listName=req.body.list;
  const item =new Item({
    name:itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });
  }


});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
if(listName === "Today")
  {
  Item.findByIdAndRemove(checkedItemId,function(err){     // to remove callback function is neccessary in this method
    if(!err)
    {
      console.log("item is deleted");
      res.redirect("/");
    }
  });
}
else
{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundlist){    // $pull is used to remove all the related values of the item
      if(!err)
      {
        res.redirect("/"+listName);
      }
    })
}
});


app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);

List.findOne({name: customListName},function(err,foundList){
  if(!err)
  {
    if(!foundList)
    {
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }
    else {
    res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
    }
  }
});

});


app.listen(3000,function()
{
  console.log("Server is started with port 3000");
});
