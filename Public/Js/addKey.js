function addNewKeyword(){
			if(document.getElementById("keyword-new").value != "")
			{
				var s=document.getElementById('list-ul-new');
				
				if(s.childNodes.length == 1){
					document.getElementById("list-ul-new").innerHTML += "<li><input type='checkbox' name='selectKey-new' value='"+document.getElementById("keyword-new").value+"'/>"+document.getElementById("keyword-new").value+"</li>";
					newArr["keyword"] += document.getElementById("keyword-new").value;
				}
				else{
					document.getElementById("list-ul-new").innerHTML += "<li><input type='checkbox' name='selectKey-new' value='"+document.getElementById("keyword-new").value+"'/>"+document.getElementById("keyword-new").value+"</li>";
					newArr["keyword"] += ","+document.getElementById("keyword-new").value;
				}
                                document.getElementById("keyword-new").value = "";
			}
    }
    
    function changeNewname(id , index){
        newArr["name"] = document.getElementById("name-new").value;
    }
    
    function setNewType(type){
        newArr["responseType"] = type;
        materialNum = 0;
        
        if(type == "text"){
        	$("#text-new").show();
        }else{
        	$("#text-new").hide();
        }
    }
    
    function changeNewContent(){
        newArr["textContent"] = document.getElementById("text-new").value;
    }
    
    function deleteNewKey(){
        newArr["keyword"] = "";
        var checked = document.getElementsByName("selectKey-new");
        for(var i = 0; i < checked.length; i ++){
            if(checked[i].checked){
                var s=document.getElementById('list-ul-new');
                s.removeChild(s.childNodes[i+1]);
                i--;
            }
        }
        
        for(var i = 0; i <checked.length;i++){
            newArr["keyword"] += checked[i].value+",";
        }
        newArr["keyword"] = newArr["keyword"].substr(0,newArr["keyword"].length-1);
    }