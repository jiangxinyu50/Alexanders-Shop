var local_storage = window.localStorage;
var sel_cache = {};
var error_item = {};
var myScroll = null;
var shopScroll = null;
var mobile_code = {};

if(local_storage["sel_cache"])
    sel_cache = JSON.parse(local_storage["sel_cache"]);

var cache_keys = Object.keys(sel_cache);

/*
   购物车 数据变动显示以及存入本地缓存
*/
function shop_item_init(cart_only){
    //购买信息与增删相关的操作
    for(i=0; i<cache_keys.length; i++){
        var item_list = sel_cache[cache_keys[i]];
        var item_guid_list = Object.keys(item_list);

        //自选数量少,弹出提示
        if(parseInt(item_list['count']) < parseInt(item_list['min'])){
            error_item[cache_keys[i]] = 1;

            $('.cart-btn').addClass('weui-btn_disabled');
            $('.tooltiptext').css("visibility", "visible");
            $('.tooltiptext').text(item_list['name']+'栏目最低数量要求：'+ item_list['min']);
        }else if(item_list['multiple'] != undefined && item_list['box'] != undefined && parseInt(item_list['multiple']) == 1){
            var gcdlcm = getGCDLCM(item_list['box']);
            var gcd = gcdlcm.GCD;

            var tmp_num = parseInt(item_list['count']) - parseInt(item_list['min']);

            if(tmp_num >= 0 && tmp_num%gcd != 0){
                error_item[cache_keys[i]] = 1;
                $('.cart-btn').addClass('weui-btn_disabled');
                $('.tooltiptext').css("visibility", "visible");
                $('.tooltiptext').text(item_list['name']+'栏目数量要求为：'+ item_list['box'] + '的整数倍。');
            }
        }

        //购买商品数量变动显示
        for(j=0; j<item_guid_list.length; j++){
            var good_guid = item_guid_list[j];

            if(good_guid.length < 20){
                continue;
            }

            if(!cart_only){
                $('.number-'+good_guid).text(item_list[good_guid].num);
                
            }

            if(parseInt(item_list[good_guid].num) > 0){
                addToCart(item_list[good_guid].column_guid, good_guid, item_list[good_guid].price, item_list[good_guid].num, item_list[good_guid].name);
                $('.number-'+good_guid).addClass('goods-has-number');
            }
        }
    }
    //购物车为空,立即购买按钮点不了
    if(isEmpty(sel_cache)){
        $('.cart-btn').addClass('weui-btn_disabled');
    }

    //购买价钱随之变动
    $('.cart-price').text(local_storage['price']);
    if(local_storage['num_total']){
        $('.cart-count').text(local_storage['num_total']);
    }
}

var iScreenWidth = window.screen.width; //获得浏览器分辨率

// 根据屏幕分辨率判断一些样式
if (iScreenWidth <= 1024) {

    $('.gotop').hide();
    $('.menu-ul').hide();

    $('.tabbar-content').show();

    $('.pc-cart-footer').hide();
    $('.cart-buy-footer').show();
    $('.topbar').show();

} else {

    $('.back_up').hide();
    $('.menu-ul').show();

    /*        //监听事件，滚动条超过一定程度，显示“右浮菜单”
     window.addEventListener('scroll',function(){
     var _scrollTop = document.body.scrollTop;

     if(_scrollTop > 150){
     $('.gotop').show();
     }else{
     $('.gotop').hide();
     }
     },false);*/
    $('.gotop').show();
    $('.follow-us').mouseover(function(){
        $('.panel-wechat').show();
    });
    $('.follow-us').mouseout(function(){
        $('.panel-wechat').hide();
    });

    $('.tabbar-content').remove();

    $('.pc-cart-footer').show();
    $('.cart-buy-footer').hide();
    $('.topbar').hide();
}

/*
 *  JQ函数
 */
$(function() {
    /*FastClick.attach(document.body);*/
    //返回顶部
    $('.back_up').on('click', function(e){
        goTop();
    });
    //返回顶部
    $('.goTop').on('click', function(e){
        goTop();
    });
    //关闭弹出层
    $('.close-cart').on('click', function(e){
        $('.shop-cart-content').removeClass('weui-actionsheet_toggle');
    });

    //动态关闭弹出层
    $('body').on('click', '.close-icon-modal', function(e){
        close_toggle_modal();
    });

    //购物车上红色数量提示
    $('.menu-cart').on('click', function(e){
        close_toggle_modal();

        if($('.shop-cart-content').hasClass('weui-actionsheet_toggle')){
            $('.shop-cart-content').removeClass('weui-actionsheet_toggle');
        }else{
            $('.shop-cart-content').addClass('weui-actionsheet_toggle');
        }

        if(!shopScroll){
            shopScroll = new IScroll('.cart-iscroll', {
                mouseWheel: true,
                checkDOMChanges: true,
                click: false
            });
        }else{
            setTimeout(function () {
                shopScroll.refresh();
            }, 0);
        }
    });

    /*
     *  DOM事件,给“商品-” 添加一个动态事件,其中包括各类商品数据动态显示等
     */
    $('body').on('click', '.item-minus', function(e){
        
        var column_guid = $(this).attr('column');
        var goods_guid = $(this).attr('item');
        var box_num = $(this).attr('box');
        var multiple = $(this).attr('multiple');

        var num = parseInt($('.number-'+goods_guid).text());

        if(num == 0)
            return;

        var $item = $(this).parents('.goods-info');
        num--;
        sel_cache[column_guid]['count']--;

        //如果商品数量为0,删除本地购物缓存,否则,新建一个购物缓存
        if(num == 0){
            $('.number-'+goods_guid).removeClass('goods-has-number');
            $('#cart-item-'+goods_guid).remove();
            delete sel_cache[column_guid][goods_guid]; 

            if(sel_cache[column_guid]['count'] == 0){
                delete sel_cache[column_guid];
            }
        }else{
            sel_cache[column_guid][goods_guid] = {
                "column_guid" : column_guid,
                "num" : num,
                "box" : box_num,
                "multiple" : multiple,
                "name" : $item.attr('name'),
                "price" : $item.attr('price')
            }
        }

        //如果自选商品数量低于最低数量要求，则弹出提示气泡，否则超过或者为0不显示
        if(!isEmpty(sel_cache[column_guid]) &&sel_cache[column_guid]['count'] < parseInt(sel_cache[column_guid]['min']) && sel_cache[column_guid]['count']>0){
            error_item[column_guid] = 1;
            $('.cart-btn').addClass('weui-btn_disabled');
            $('.tooltiptext').css("visibility", "visible");
            $('.tooltiptext').text(sel_cache[column_guid]['name']+'栏目最低数量要求：'+ sel_cache[column_guid]['min']);
        }else if(!isEmpty(sel_cache[column_guid]) && sel_cache[column_guid]['multiple'] != undefined && sel_cache[column_guid]['box'] != undefined && parseInt(sel_cache[column_guid]['multiple']) == 1){
            var gcdlcm = getGCDLCM(sel_cache[column_guid]['box']);
            var gcd = gcdlcm.GCD;

            var tmp_num = parseInt(sel_cache[column_guid]['count']) - parseInt(sel_cache[column_guid]['min']);

            if(tmp_num >= 0){
                if(tmp_num%gcd != 0){
                    error_item[column_guid] = 1;
                    $('.cart-btn').addClass('weui-btn_disabled');
                    $('.tooltiptext').css("visibility", "visible");
                    $('.tooltiptext').text(sel_cache[column_guid]['name']+'栏目数量要求为：'+ sel_cache[column_guid]['box'] + '的整数倍。');
                }else{
                    if(error_item[column_guid]){
                        delete error_item[column_guid];
                    }
                }
            }
        }else{
            if(error_item[column_guid])
                delete error_item[column_guid];
        }

        //如果购物车内无商品，“立即购买”按钮不可点击
        if(isEmpty(error_item) && !isEmpty(sel_cache)){
            $('.cart-btn').removeClass('weui-btn_disabled');
        }else{
            $('.cart-btn').addClass('weui-btn_disabled');
        }

        if(isEmpty(error_item)){
            $('.tooltiptext').css("visibility", "hidden");
        }

        //价钱变动以及显示
        local_storage['price'] = parseInt(local_storage['price']) - parseInt($item.attr('price'));

        $('.cart-price').text(local_storage['price']);

        //商品数量变动以及显示
        var count = local_storage['num_total'];
        local_storage['num_total'] = parseInt(count) - 1;

        $('.cart-count').text(local_storage['num_total']);
        local_storage['sel_cache'] = JSON.stringify(sel_cache);

        $('.number-'+goods_guid).text(num);
    });

    /*
     *  DOM事件,给“商品+” 添加一个动态事件,其中包括各类商品数据动态显示等
     */
    $('body').on('click', '.item-plus' , function(e){
        
        var column_guid = $(this).attr('column');
        var goods_guid = $(this).attr('item');
        var box_num = $('#'+column_guid).attr('box');
        var multiple = $('#'+column_guid).attr('multiple');

        var num = parseInt($('.number-'+goods_guid).text());
        var $item = $(this).parents('.goods-info');
        num = parseInt(num) + 1;

        if(num == 1){
            addToCart(column_guid, goods_guid, $item.attr('price'), num, $item.attr('name'));
        }

        if(!sel_cache[column_guid]){
            var min = 1;

            if($('#'+column_guid).attr('min')){
                var min = $('#'+column_guid).attr('min');
            }

            name = $('#'+column_guid).attr('name');
            sel_cache[column_guid] = {
                "count" : num,
                "min" : min,
                "box" : box_num,
                "multiple" : multiple,
                "name" : name
            };
        }else{
            sel_cache[column_guid]['count']++;
        }

        sel_cache[column_guid][goods_guid] = {
            "column_guid" : column_guid,
            "num" : num,
            "name" : $item.attr('name'),
            "price" : $item.attr('price')
        };

        var pre_sell = $item.attr('pre_sell');
        var send_start_date = $item.attr('send_start_date');
        var show_send_info = false;

        //判断预售商品以及开始配送时间
        if(pre_sell && send_start_date){
            var send_date = new Date(send_start_date.replace(/-/g,   "/"));
            var today_date = new Date();

            if(send_date > today_date){
                show_send_info = true;
                $('.tooltiptext').text($item.attr('name')+'预售中，于'+ send_start_date + "开始配送");
                $('.tooltiptext').css("visibility", "visible");
            }
        }

        //如果自选商品数量低于最低数量要求，则弹出提示气泡
        if(sel_cache[column_guid]['count'] < parseInt(sel_cache[column_guid]['min'])){
            error_item[column_guid] = 1;
            $('.cart-btn').addClass('weui-btn_disabled');
            $('.tooltiptext').css("visibility", "visible");
            $('.tooltiptext').text(sel_cache[column_guid]['name']+'栏目最低数量要求：'+ sel_cache[column_guid]['min']);
        }else if(sel_cache[column_guid]['multiple'] != undefined && sel_cache[column_guid]['box'] != undefined && parseInt(sel_cache[column_guid]['multiple']) == 1){
            var gcdlcm = getGCDLCM(sel_cache[column_guid]['box']);
            var gcd = gcdlcm.GCD;

            var tmp_num = parseInt(sel_cache[column_guid]['count']) - parseInt(sel_cache[column_guid]['min']);

            if(tmp_num >= 0){
                if(tmp_num%gcd != 0){
                    error_item[column_guid] = 1;
                    $('.cart-btn').addClass('weui-btn_disabled');
                    $('.tooltiptext').css("visibility", "visible");
                    $('.tooltiptext').text(sel_cache[column_guid]['name']+'栏目数量要求为：'+ sel_cache[column_guid]['box'] + '的整数倍。');
                }else{
                    if(error_item[column_guid]){
                        delete error_item[column_guid];
                    }
                }
            }
        }else{
            if(error_item[column_guid]){
                delete error_item[column_guid];
            }  
        }

        //如果购物车弹出层没有错误信息,那么立即购买按钮就可以点击以及隐藏提示信息
        if(isEmpty(error_item)){
            $('.cart-btn').removeClass('weui-btn_disabled');
            $('.tooltiptext').css("visibility", "hidden");
        }

        //满足最低数量要求,且有预售商品，则显示预售商品提示信息
        // if(show_send_info){
        //     $('.tooltiptext').css("visibility", "visible");
        //     $('.tooltiptext').text("其中"+$item.attr('name')+"在预售中，所以订单将于"+send_start_date+"开始配送");
        // }

        //价钱变动以及显示
        if(local_storage['price'])
            local_storage['price'] = parseInt(local_storage['price']) + parseInt($item.attr('price'));
        else
            local_storage['price'] = parseInt($item.attr('price'));

        $('.cart-price').text(local_storage['price']);

        var count = local_storage['num_total'];

        //商品数量变动以及显示
        if(count)
            local_storage['num_total'] = parseInt(count) + 1;
        else{
            local_storage['num_total'] = 1;
        }

        $('.cart-count').text(local_storage['num_total']);

        local_storage['sel_cache'] = JSON.stringify(sel_cache);

        $('.number-'+goods_guid).text(num);
        $('.number-'+goods_guid).addClass('goods-has-number');
    });

    //点击遮幕也能关闭弹出层
    $('.togger-mask').on('click', function(e){
        close_toggle_modal();
        $('.cart-tooltip').removeClass('tooltip-position-menu');
    });
    //点击关闭按钮关闭弹出层
    $('.close-btn').on('click', function(e){
        close_toggle_modal();
        $('.cart-tooltip').removeClass('tooltip-position-menu');
    });

    //点击底部栏“购物车”内的“立即购买”后处理的事件
    $('.cart-btn').on('click', function(e){
        if(!isEmpty(error_item))
            return ;
        if(isEmpty(sel_cache)){
            return;
        }

        $.post("/ShopPc/add_to_card_handle", sel_cache, function(data) {
            if (data['status'] == 0) {
                window.location.href = "/ShopPc/cart";
            }else if(data['status'] == -10005){
                    if ($('#Binding-mobile-phone').css('display') == 'none'){
                        $('#Binding-mobile-phone').show(100);
                        $(".bind_mobile-btn").addClass("weui-btn_disabled weui-btn_default");
                        $(".get_code").addClass("weui-btn_disabled weui-btn_default");
                        $('.set_code').attr("disabled",true);
                        close_toggle_modal();
                    }
            }else{
                $('.error-message').text(data['message']);
                $('.error-dialog').show();
                $('.index-dialog-btn').addClass('need-clear');
                close_toggle_modal();
            }
        });
    });

    //弹出错误信息之后，确认清除缓存
    $('.index-dialog-btn').on('click', function(e){
        if($(this).hasClass('need-clear')){
            clear_storge();
            window.location.reload();
        }
        $('.error-dialog').hide();
    });
});

//清除缓存
function clear_storge(){
    local_storage.removeItem('sel_cache');
    local_storage.removeItem('num_total');
    local_storage.removeItem('price');
}

// 将购物信息添加至购物车弹出层,并在上面显示
function addToCart(column_guid, guid, price, num, name){
    var content = '<div class="weui-flex cart-goods-item goods-info" name="'+name+'" guid="'+guid+'" price="'+price+'" id= "cart-item-'+guid+'">\
                <div class="weui-flex__item">\
                    <div class="placeholder"><p class="cart-item-name">'+name+'</p></div>\
                </div>\
                <div>\
                    <div class="placeholder">\
                        <span class="item-minus item-change">\
                            <button class="weui-btn weui-btn_mini weui-btn_primary item-minus" column="'+column_guid+'" item="'+guid+'"><i class="iconfont icon-jianhao"></i></button>\
                        </span>\
                        <span class="goods-number number-'+guid+'">'+num+'</span>\
                        <span class="item-plus item-change">\
                            <button class="weui-btn weui-btn_mini weui-btn_primary item-plus" column="'+column_guid+'" item="'+guid+'"><i class="iconfont icon-jiahao1"></i></button>\
                        </span>\
                    </div>\
                </div>\
            </div>';

    $('.cart-items').prepend(content);    
}

//判断是否为空
function isEmpty(obj)
{
    for (var name in obj) 
    {
        return false;
    }
    return true;
}

//对有没有订单以及订单的所有主要信息进行判断校验
function order_verification(orderInfo){
    //订单为空
    if(!orderInfo){
        var req = {
            status : -1,
            message : '订单为空'
        };
        return req;
    }
    //未填写配送地址
    if(!orderInfo['address']){
        var req = {
            status : -2,
            message : '请填写配送地址。'
        };

        smoothScroll($(window), $('#address-panel').offset().top-100, 200);
        var pos = $('#address-panel').position();

        $('.tooltiptext').css({
          top: pos.top + 13,
          right : 15,
          visibility : "visible"
        });

        $('.tooltiptext').text(req['message']);
        return req;
    }
    //未选择配送时间
    if(!orderInfo['sendTime']){
        var req = {
            status : -3,
            message : '请选择配送时间'
        };

        smoothScroll($(window), $('#send-time-panel').offset().top-100, 200);
        var pos = $('#send-time-panel').position();

        $('.tooltiptext').css({
          top: pos.top + 13,
          right : 15,
          visibility : "visible"
        });

        $('.tooltiptext').text(req['message']);

        return req;
    }
    //订单正确
        var req = {
            status: 0
        };

        return req;
}

//点击，滚动条自动跳转至目的地
function smoothScroll(el, to, duration) {
    if (duration < 0) {
        return;
    }
    var difference = to - $(window).scrollTop();
    var perTick = difference / duration * 10;
    this.scrollToTimerCache = setTimeout(function() {
        if (!isNaN(parseInt(perTick, 10))) {
            window.scrollTo(0, $(window).scrollTop() + perTick);
            smoothScroll(el, to, duration - 10);
        }
    }.bind(this), 10);
}

//滚动条跳至...
$('.scrollTo').on('click', function() {
    smoothScroll($(window), $($(e.currentTarget).attr('href')).offset().top, 200);
});

//回到顶部，其中根据距离顶部不同，速度也不一样
function goTop(acceleration, time) {
    acceleration = acceleration || 0.1;
    time = time || 6;   //调高了会出现滑动bug
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    var x3 = 0;
    var y3 = 0;
    if (document.documentElement) {
    x1 = document.documentElement.scrollLeft || 0;
    y1 = document.documentElement.scrollTop || 0;
    }
    if (document.body) {
    x2 = document.body.scrollLeft || 0;
    y2 = document.body.scrollTop || 0;
    }
    var x3 = window.scrollX || 0;
    var y3 = window.scrollY || 0;
    // 滚动条到页面顶部的水平距离
    var x = Math.max(x1, Math.max(x2, x3));
    // 滚动条到页面顶部的垂直距离
    var y = Math.max(y1, Math.max(y2, y3));
    // 滚动距离 = 目前距离 / 速度, 因为距离原来越小, 速度是大于 1 的数, 所以滚动距离会越来越小
    var speed = 1 + acceleration;
    window.scrollTo(Math.floor(x / speed), Math.floor(y / speed));
    // 如果距离不为零, 继续调用迭代本函数
    if (x > 0 || y > 0) {
        var invokeFunction = "goTop(" + acceleration + ", " + time + ")";
        window.setTimeout(invokeFunction, time);
    }
}

//关闭购物车弹出层函数
function close_toggle_modal(){
    var $modal = $('.togger-mask').parent();

    $('.togger-mask').hide(100);
    $('.tooltiptext').addClass('tooltip-position-menu');
    $('.tooltiptext').removeClass('tooltip-position-cart');
    $('.close-btn').hide(100);
    $('.weui-tabbar').css('z-index', 500);

    $modal.find('.weui-actionsheet').removeClass('weui-actionsheet_toggle');
    $('.weui-tabbar').show();

    if(myScroll){
        myScroll.destroy(); //销毁当前会话中的全部数据
        myScroll = null;
    }
}
//---------------------------------------------------
// 日期格式化  
// 格式 YYYY/yyyy/YY/yy 表示年份  
// MM/M 月份  
// W/w 星期  
// dd/DD/d/D 日期  
// hh/HH/h/H 时间  
// mm/m 分钟  
// ss/SS/s/S 秒  
//---------------------------------------------------  
Date.prototype.Format = function(formatStr) {
    var str = formatStr;
    var Week = ['日','一','二','三','四','五','六'];

    str=str.replace(/yyyy|YYYY/,this.getFullYear());
    str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));

    str=str.replace(/MM/,this.getMonth()>9?this.getMonth().toString():'0' + this.getMonth());
    str=str.replace(/M/g,this.getMonth());

    str=str.replace(/w|W/g,Week[this.getDay()]);

    str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());
    str=str.replace(/d|D/g,this.getDate());

    str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());
    str=str.replace(/h|H/g,this.getHours());
    str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());
    str=str.replace(/m/g,this.getMinutes());

    str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());
    str=str.replace(/s|S/g,this.getSeconds());

    return str;
};

//-------------------------------------------------->
// js实现发送短信验证码后60秒防刷新
// ----js对cookie的操作
// ----主要逻辑代码
//-------------------------------------------------->
//--------------------主要逻辑代码---------------------//
//点击按钮开始倒计时
//ps:这个倒计时在刷新或者关闭网页重新进后,会重置;如果想要更好的效果,使用cookie.
var countdown = 60;  //设定60秒刷新
function setTime(val) {
    if (countdown == 0) {
        val.removeAttr("disabled"); //移除disabled属性
        val.text("重新发送");
        val.css({"color":"#d4a77E"});
        countdown = 60;
        return false;
    } else {
        val.attr("disabled", true);  //增加disabled属性
        val.text("正在获取("+countdown+")");
        val.css({"color":"#ccc"});

        countdown--;
    }
    setTimeout(function() {  //设定计时器
        setTime(val);
    },1000); //1000毫秒=1秒,刷新一次
}

//-------------数据变更发生事件------------//
//手机号码变更
$('.phoneNum').on('change', function() {
    var tel = $(this).attr('param-name');
    mobile_code[tel] = $(this).val();
});
//短信验证码变更
$('.set_code').on('change', function() {
    var code = $(this).attr('param-name');
    mobile_code[code] = $(this).val();
});

//点击获取按钮,开始倒计时
$(".get_code").on('click', function(){
    document.getElementById("get_code").addEventListener("click",isPhoneNum);

    setTime($(".get_code"));

    $('.set_code').removeAttr("disabled");
    $('.set_code').attr("autofocus","autofocus");

    $.post("/ShopPc/get_to_code",mobile_code, function(data){ //另起一个post,只传手机号以及验证码
        if(data['status'] != 0){
            $('.error-message').text(data['message']);
             $('.error-dialog').show();

            countdown = 0;
        }
    });
});

//校验手机号是否合法
function isPhoneNum(){
    var phoneNum = $(".phoneNum").val();
    var myReg = /^(((13[0-9]{1})|14[5|7]{1}|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/; //手机号正则表达式
    var get_code = $(".get_code");
    var tel_warn = $(".tel-warn");
    var bind_mobile_btn = $(".bind_mobile-btn");

    //边输入边做判断,以致按钮是否可点击
    if(!myReg.test(phoneNum)){
        get_code.attr("disabled", true);
        tel_warn.css("display","block");
        bind_mobile_btn.attr("disabled", true);
        bind_mobile_btn.addClass("weui-btn_default");
        return false;
    }else{
        get_code.removeAttr("disabled");
        tel_warn.css("display","none");
        bind_mobile_btn.removeAttr("disabled");
        bind_mobile_btn.removeClass("weui-btn_default");
        get_code.removeClass("weui-btn_disabled weui-btn_default");
        return true;
    }
}
//取消绑定手机号
$('.bind_mobile-cancle-btn').on('click', function(){
    $('#Binding-mobile-phone').hide();
});

//------------确认绑定手机号-------------//
//确认绑定手机号--点击事件
$('.bind_mobile-btn').on('click', function(){
    //校验是否可以点击
    if($(".phoneNum").val() == ""){ //手机号为空
        $(".get_code").attr("disabled", true); //获取验证码按钮不可点击
        $(".bind_mobile-btn").attr("disabled", true);  //确认按钮不可点击
        return false;
    }
    if($(".set_code").val() == ""){
        $("#bind_mobile-btn").attr("disabled", true);  //确认按钮不可点击
        return false;
    }

    $.post("/ShopPc/add_to_tel",mobile_code, function(data){ //另起一个post,只传手机号以及验证码
        if(data['status'] != 0){
            $('.error-message').text(data['message']);
            $('.error-dialog').show();

            countdown = 0;
        }else{
            //向add_to_card传入订单信息,条件成立,跳至cart页面;否则,提示错误.
            $.post("/ShopPc/add_to_card_handle",sel_cache, function(data){
                if(data['status'] == 0){
                    $('.succeedToast').show();
                    $('#Binding-mobile-phone').hide();

                    window.location.href = "/ShopPc/cart";
                }else{
                    $('.error-message').text(data['message']);
                    $('.error-dialog').show();
                    $('.index-dialog-btn').addClass('need-clear');
                    close_toggle_modal();
                }
            });
        }
    });
    document.getElementById("get_code").removeEventListener("click",isPhoneNum);
});

// 登录 按钮点击事件
$('#login-btn').on('click', function(){

    if($('#tel').val() == ""){
        alert('请输入您的手机号！');
    }else if($('#tel_code').val() == ""){
        alert('请填写验证码！');
    }else{
        $.post("/ShopPc/add_to_tel", mobile_code, function(data){
            if(data['status'] != 0){
                alert(data['message']);

                countdown = 0;
            }else{
                window.location.href = "/Vip/index";
            }
        });
    }
});

//修正IOS在定位fixed和input获取焦点focus与失去焦点blur的时候出现的问题---弹窗的不稳定显示
var scrollable = document.getElementById("scrollable");
new ScrollFix(scrollable);

function ScrollFix(elem) {
    //跟踪输入的变量
    var startY, startTopScroll;

    elem = elem || document.querySelector(elem);

    //如果没有获取到滚动条，什么也不做
    if(!elem)
        return;

    //开始处理交互
    elem.addEventListener('touchstart', function(event){
        startY = event.touches[0].pageY;
        startTopScroll = elem.scrollTop;

        if(startTopScroll <= 0)
            elem.scrollTop = 1;

        if(startTopScroll + elem.offsetHeight >= elem.scrollHeight)
            elem.scrollTop = elem.scrollHeight - elem.offsetHeight - 1;
    }, false);
}

// 判断img标签内的src地址是否正确
function isSrc(str_src){
    var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
        + "|" // 允许IP和DOMAIN（域名）
        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
        + "[a-z]{2,6})" // first level domain- .com or .museum
        + "(:[0-9]{1,4})?" // 端口- :80
        + "((/?)|" // a slash isn't required if there is no file name
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
    var re=new RegExp(strRegex);
    //re.test()
    if(re.test(str_src)){
        return true;
    }else{
        return false;
    }
}

function getGCDLCM(str){
    var arr=eval("[" + str + "]");
    var max=Math.max.apply(null, arr);
    var min=Math.min.apply(null, arr);
    var GCDLCM=new Object(); //函数返回对象
    GCDLCM.str=str; //输入的数字集合
    GCDLCM.num=arr.length; //数字总个数
    var i,j,ifstr="";
    for(j=0;j<arr.length;j++){
        ifstr+=arr[j] + "<1";
        if(j<arr.length-1) ifstr+="||"
    }
    if(eval(ifstr)){
        GCDLCM.GCD=-1; //最大公约数
        GCDLCM.LCM=-1; //最小公倍数
        return GCDLCM;
    }
    //求最大公约数
    for(i=min;i>0;i--){
        ifstr="";
        for(j=0;j<arr.length;j++){
            ifstr+=arr[j] + "%" + i + "==0";
            if(j<arr.length-1) ifstr+="&&"
        }
        if(eval(ifstr)){
            GCDLCM.GCD=i; //最大公约数
            break;
        }
    }
    // //求最小公倍数
    // var n=1;
    // for(j=0;j<arr.length;j++){ n=n*arr[j]; }
    // for(i=max;i<=n;i++){
    //     ifstr="";
    //     for(j=0;j<arr.length;j++){
    //         ifstr+=i + "%" + arr[j] + "==0";
    //         if(j<arr.length-1) ifstr+="&&"
    //     }
    //     if(eval(ifstr)){
    //         GCDLCM.LCM=i; //最小公倍数
    //         break;
    //     }
    // }
    return GCDLCM;
}

// 滚动条滚动,侧边导航栏自动到对应位置样式
$(document).ready(function(){

    var nav=(function(navObj){
        navObj.init=function(){ //页面初始化
            this.n=0;
            this.offsetTop=[];
            this.scrolltype=true;
            this.review=function(){
                // 这个设置随着滚动条的滚动，菜单栏样式更替
                $('.column-change').eq(this.n).children().children().addClass('slide-text_on').parent().parent().siblings().children().children().removeClass('slide-text_on');
            };
            for(var i=0;i<$('.shop-goods').length;i++){
                this.offsetTop.push($('.shop-goods').eq(i).offset().top);
            }
            navObj.bindE();
        };
        navObj.bindE=function(){//滚动条滚动改变导航元素效果
            var self=this;//这里的this等同于上面的this
            $(window).bind('load scroll',function(){
                var stval=$(this).scrollTop();
                if(stval>200){//判断滚动条滚动距离大于或小于header高度时，让导航效果对应在第一个上
                    if(stval<self.offsetTop[0]){
                        self.n=0;
                    }else{
                        for(var j=0;j<self.offsetTop.length;j++){
                            if(stval>(self.offsetTop[j]+200)&& stval<self.offsetTop[j+1]){self.n=j+1;break;}//这里的200是常量,跟上面的判断条件是一样的
                        }
                    }
                    if(self.scrolltype===true){
                        self.review();
                    }
                    $('.menu-ul').removeClass('pop1').addClass('pop');
                }else{
                    $('.menu-ul').removeClass('pop').addClass('pop1');
                    // 初始化刚进入页面的时候，菜单栏定位
                    $('.column-change').eq(0).children().children().addClass('slide-text_on').parent().parent().siblings().children().children().removeClass('slide-text_on');
                }
            });
        };
        return navObj;
    })(window.navObj || {});
    nav.init();

});
