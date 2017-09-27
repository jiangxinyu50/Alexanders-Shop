/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function G(id){
    return document.getElementById(id);
}

function getRand(){
    var now=new Date(); 
    return now.getMinutes() + "" + now.getSeconds() + "" + now.getMilliseconds();
}
function getNewsObj(type){
    if(type === 'add'){
        return {
                    "handleType" : "AddGroup",
                    "image"      : "",
                    "total"      : 1,
                    'selID'      : 0,
                    "items"      : []};
    }
    
    if(type === 'addOne'){
        return {
                    "handleType" : "AddGroup",
                    "image"      : "",
                    "total"      : 1,
                    'selID'      : 0,
                    "items"      : []};
    }
}

function getItemObj(type){
    if(type === 'add'){
        return {
                "key" : "0",
                "image"      : "",
                "title" : "",
                "newsImg" : "",
                "description" : "",
                "content" : "",
                'synWeb': 0};
    }
    if(type === 'modify'){
        return {
                'id': 0,
                'key' : "0",
                "image"      : "",
                'title' : '',
                'addTime' : '',
                'description' : '',
                'content' : '',
                'image' : '',
                'update' : 2,
                'synWeb': 0
            };
    }
}

function setSelID(key, newsArr, imgUrl){
    var list = $("#list-"+key);
    var position = list.offset();
    
    var form = $("#main-right");
    var formPosition = form.offset();
    $("#main-right").css("margin-top",position.top - 160);
    
    for(var i = 0;i < newsArr.items.length;i++){
        if(key == newsArr.items[i].key){
            newsArr.selID = i;
            break;
        }
    }

    G('title').value = newsArr.items[newsArr.selID].title;

    if(newsArr.items[newsArr.selID].addPicture == 1){
       document.getElementById("addPicture").checked = true;

    }else{
        document.getElementById("addPicture").checked = false;

    }

    var add='';
    if(newsArr.items[newsArr.selID].image !== '')
        add="<img src='"+ imgUrl +"' " +"style='margin-left:15px;margin-top:15px;max-width:100px;max-height:100px;'/></img>";
    G("image_form").innerHTML = add;
    UE.getEditor('newstext').setContent(newsArr.items[newsArr.selID].content);

 
    
}

function addNewsDiv(requestUrl,type, newsArr){
    if(newsArr.total > 7){
        alert("您最大只能添加8条信息！");
        return;
    }
    $.get(requestUrl, function(fromdata){
        if(fromdata.status === 0){
            G("news").innerHTML += fromdata.data;

            newsArr.items.push(getItemObj(type));
            newsArr.items[newsArr.total].key = fromdata.key;
            setSelID(newsArr.items[newsArr.total].key, newsArr, '');
            newsArr.total = newsArr.total + 1;
            $(".news-edit").hide();
        }
     });
}

function changetitle(id, title, newsArr){
    G(id).innerHTML = title.trim();
    newsArr.items[newsArr.selID].title = title.trim();
    
    if (typeof newsArr.items[newsArr.selID].update !== "undefined" && newsArr.items[newsArr.selID].update === 0)
    {
        newsArr.items[newsArr.selID].update = 1;
    }

    // if(id.checked){
    //         newsArr.items[newsArr.selID].synWeb = id.value;
    //     }
    //     else{
    //         newsArr.items[newsArr.selID].synWeb = '';
    //     }
}


function changesynweb(id, synweb, newsArr){
    G(id).innerHTML = synweb;
    newsArr.items[newsArr.selID].synWeb = synweb;
    
    if (typeof newsArr.items[newsArr.selID].update !== "undefined" && newsArr.items[newsArr.selID].update === 0)
    {
        newsArr.items[newsArr.selID].update = 1;
    }
    if(G(id).checked){
            newsArr.items[newsArr.selID].synWeb = G(id).value;
        }
        else{
            newsArr.items[newsArr.selID].synWeb = '';
        }
}

function changeDescription(id, description , newsArr){
    G(id).innerHTML = description.trim();
    newsArr.items[newsArr.selID].description = description.trim();
    
    if (typeof newsArr.items[newsArr.selID].update !== "undefined" && newsArr.items[newsArr.selID].update === 0)
    {
        newsArr.items[newsArr.selID].update = 1;
    }
}