//网址验证
function IsUrl(inputName)
{
    var str = $(inputName).val().trim();
    var strRegex = "^((https|http|ftp|rtsp|mms)?://)"; 
    var re=new RegExp(strRegex); 
    //re.test()
    if (re.test(str)){
        return (true); 
    }else{ 
        return (false); 
    }
}

//对电子邮件的验证
function IsEmail(inputName)
{
    var str = $(inputName).val().trim();
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if(!myreg.test(str))
    {
        return false;
    }else{
        return true;
    }
}

//检验菜单框字符长度
function checkLength(inputName , textLength){
    var str = G(inputName).value.trim();
    var result = "";

    if(str.length > textLength){
        for(var i = 0;i < textLength;i++){
            result += str[i];
        }
        G(inputName).value = result;
    }
}

//检验是否为数字
function checkInt(inputName){
    var str = G(inputName).value;
    var tel = "";

    for(var i = 0;i<str.length;i++){
        if(!isNaN(str[i]) || str[i] == "-"){
            tel += str[i];
        }
    }

    G(inputName).value = tel;
}