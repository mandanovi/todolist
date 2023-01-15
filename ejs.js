const express=require("express");
const app=express();
const bodyParser=require("body-parser");
const { read } = require("fs");
const { config } = require("process");
const myDate = require(__dirname + "/day.js")
const mongoose = require("mongoose");
const e = require("express");
const _ = require("lodash")
require('dotenv').config()
const PORT = process.env.PORT || 3030;

app.use(bodyParser.urlencoded({extended:true}));
app.use('*/images',express.static('public/images'));
app.use('*/css',express.static('public/css'));

app.set("view engine", "ejs")


mongoose.connect("mongodb+srv://"+process.env.ADMIN_NAME +":"+process.env.ADMIN_PASS+"@cluster0.lfgnwag.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    item : String
};

const Item = mongoose.model("Item", itemsSchema);

const welcome = new Item ({
    item : "Welcome to your to-do-list app."
});

const adding = new Item({
    item : "Hit a + button to add new item"
});

const deleting = new Item({
    item : "<-- Hit this to delete an item"
});

const defaultItem = [welcome, adding, deleting];

const listSchema = {
    name: String,
    items : [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    let day = myDate.getDate();

    Item.find({}, function(err, foundItem) {
        if (foundItem.length === 0) {
            Item.insertMany(defaultItem, function(err){
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully insert items.")
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newItems: foundItem}); 
        }
        
    })
})

app.get("/:customroute", function(req, res){
    const customRoute = _.capitalize(req.params.customroute);

    List.findOne({name: customRoute}, function(err, results){
        if (!err) {
            if (!results) {
                const list = new List({
                    name : customRoute,
                    items : defaultItem
                })
                list.save()
                res.redirect("/" + customRoute)
            } else {
                res.render("list", {listTitle: results.name, newItems: results.items})
            }
        }
    })

    

});

app.post("/", function(req, res){
    let item = req.body.newItem;
    let listName = req.body.list;

    const userNewItem = new Item({
        item : item
    });

    if (listName === "Today") {
        userNewItem.save()
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, results){
            results.items.push(userNewItem)
            results.save()
            res.redirect("/" + listName)
        })
    }
    
    
    
})



app.post("/deleteItem", (req, res) => {
    const obj = JSON.parse(req.body.checkbox);
    console.log(obj.listName, obj.itemName, obj.itemID);

    if (obj.listName === "Today") {
        Item.findByIdAndRemove(obj.itemID, (err) => {
            if (!err) {
                res.redirect("/");
            }
        })
    } else {
        List.findOneAndUpdate({name: obj.listName}, {$pull: {items : {_id: obj.itemID}}}, 
            function (err, results) {
            if (!err) {
                res.redirect("/"+ obj.listName)
            } else {
                console.log(err)
            };
        });
    }
});


if (PORT == null || PORT == "") {
    PORT = 3000
} 
app.listen(PORT, () => {
    console.log("server started on port ${PORT}");
  });
