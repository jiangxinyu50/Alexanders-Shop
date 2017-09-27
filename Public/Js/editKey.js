    function addKeyword(id , index){
        if(document.getElementById("keyword-"+id).value != "")
        {
            var listItem = document.getElementById('list-ul-'+id);
            if(keyArr[index]["keyword"] == ""){
                document.getElementById("list-ul-"+id).innerHTML += "<li><input type='checkbox' name='selectKey-"+id+"' value='"+document.getElementById("keyword-"+id).value+"'/>"+document.getElementById("keyword-"+id).value+"</li>";
                keyArr[index]["keyword"] += document.getElementById("keyword-"+id).value;
            }else{
                document.getElementById("list-ul-"+id).innerHTML += "<li><input type='checkbox' name='selectKey-"+id+"' value='"+document.getElementById("keyword-"+id).value+"'/>"+document.getElementById("keyword-"+id).value+"</li>";
                keyArr[index]["keyword"] += ","+document.getElementById("keyword-"+id).value;
            }
            document.getElementById("keyword-"+id).value = "";
        } 
    }
    
    function changename(id , index){
        keyArr[index]["name"] = document.getElementById("name-"+id).value;
    }
    
    function changeContent(id , index){
      keyArr[index]["textContent"] = document.getElementById("text-" + id).value;
    }
    
    function deleteKey(id , index){
        keyArr[index]["keyword"] = "";
        var checked = document.getElementsByName("selectKey-"+id);
        
        for(var i = 0; i < checked.length; i++){
            if(checked[i].checked){
                var num = i;
                var s=document.getElementById('list-ul-'+id);
                s.removeChild(s.childNodes[num]);
                i--;
            }
        }
        
        for(var i = 0; i <checked.length;i++){
            keyArr[index]["keyword"] += checked[i].value+",";
        }
        keyArr[index]["keyword"] = keyArr[index]["keyword"].substr(0,keyArr[index]["keyword"].length-1);
    }
    
    function showMain(id , index , checked){
        if(checked){
            $("#rule-big-"+id).hide();
            $("#key-"+id).show();
            keyArr[index]["checked"] = false;
        }
        else{
            $("#rule-big-"+id).show();
            $("#key-"+id).hide();
            keyArr[index]["checked"] = true;
        }
    }