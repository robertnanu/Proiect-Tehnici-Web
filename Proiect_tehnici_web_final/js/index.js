const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const uuid = require("uuid");
const port = 3000

const fs = require('fs')
const path = require('path')

const app = express();

app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function(req, res){
    res.sendFile(__dirname + "/template/index.html")
})

app.get('/index.html', function(req, res){
    res.sendFile(__dirname + "/template/index.html")
})

app.get('/about.html', function(req, res){
    res.sendFile(__dirname + "/template/about.html")
})

app.get('/contact.html', function(req, res){
    res.sendFile(__dirname + "/template/contact.html")
})

app.get('/menu.html', function(req, res){
    res.sendFile(__dirname + "/template/menu.html")
})

//----------------------------------------------------------

app.get("/projects", function(req, res){
    let data = JSON.parse(fs.readFileSync("data/projects.json"));
    res.send(data);
})

app.post("/projects", function(req, res){
    var data = JSON.parse(fs.readFileSync("data/projects.json"));
    console.log(req.body);
    data.push({
        "name":req.body.name,
        "description":req.body.description
    });
    fs.writeFileSync("data/projects.json", JSON.stringify(data));
    res.send(data);
})

app.put("/projects/:id", function(req, res){
    var data = JSON.parse(fs.readFileSync("data/projects.json"));

    if(data.body.name!=null) data[req.params.id].name = req.body.name;
    if(data.body.description!=null) data[req.params.id].description = req.body.description;

    fs.writeFileSync("data/projects.json", JSON.stringify(data));
    res.send(data);
})

app.delete("/projects/:id", function(req, res){
    let data = JSON.parse(fs.readFileSync("data/projects.json"));
    delete data[req.params.id];
    console.log(req.params.id);
    data.splice(req.params.id, 1);
    fs.writeFileSync("data/projects.json", JSON.stringify(data));
    res.send(data);
})

function link_file(file_path, get_path = null){
    if(get_path==null){
        file_path.split("/").forEach(function(dir){
            get_path = dir;
        });
        get_path = "/"+get_path;
    }
    app.get(get_path, function(req, res){
        res.sendFile(path.join(file_path));
    });
}

function link_directory(dir, separate_directories = false, sub = "/", ignore_ext = [".html"]){
    fs.readdirSync(path.join(dir)).forEach(function(file) {
        get_path = file;
        if(file.split('.')[0]=="index") get_path = "";
        if(file.split('.').length==1){
            if(separate_directories) link_directory(dir+"/"+file, separate_directories, sub+file+"/");
            else link_directory(dir+"/"+file, separate_directories, sub);
        }else{
            //console.log(sub+get_path);
            link_file(dir+"/"+file, sub+get_path);
            for(var i=0;i<ignore_ext.length;i++)
                if(get_path.search(ignore_ext[i]))
                    link_file(dir+"/"+file, sub+get_path.replace(ignore_ext[i], ""));
        }
    });
}

link_directory(__dirname + "/images", true, "/images/")

link_directory(__dirname + "/styles", true, "/styles/")
link_directory(__dirname + "/js", true, "/js/")


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))