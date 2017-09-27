$(function () {
  $(document).on("pageInit", "#user-info-page", function(e) {
  	var info_change = {};

    $("#city-picker").cityPicker({
      toolbarTemplate: '<header class="bar bar-nav">\
      <button class="button button-link pull-right close-picker">确定</button>\
      <h1 class="title">选择城市</h1>\
      </header>'
    });

    $('.info-input').on('change', function(){
    	var param_name = $(this).attr('param');
    	var val = $(this).val();

    	info_change[param_name] = val;
    });

    $('#info-conform-btn').on('click', function(){
    	$.showIndicator();
    	info_change['id'] = $(this).attr('param');
    	$.post('/Mobile/Vip/saveInfoHandle', info_change, function(data){
    		$.hideIndicator();
    		if(data.status == 0){
    			$.toast("修改个人信息成功");
    		}else{
    			$.toast("提交失败，"+data.info);
    		}
    	})
    })
  });

  $(document).on("pageInit", "#user-tel-bind-page", function(e) {
    var params = {};
    var time=60;

    $('#bind-tel-input').on('change', function(){
        params['tel'] = $(this).val();
    })

    $('.get-code-btn').on('click', function(){
      if($(this).hasClass('disable'))
        return;
      
      btnControl(time);

      if(params['tel'] == '')
          return;

      $.post('/Mobile/Vip/sendMessage', {
          'openId' : $(this).attr('openId'),
          'timestamp' : $(this).attr('timestamp'),
          'token' : $(this).attr('token'),
          'tel' : params['tel']
      }, function(data){
          if(data['status'] == 0){
              params['code'] = data['code'];
          }
      })
    })

    $('.bind-tel-btn').on('click', function(){
        var code = $('#bind-code-input').val();

        if(code == params['code'] && code != ''){
            $.showIndicator();
            $.post('/Mobile/Vip/saveTel', {
                'openId' : $(this).attr('openId'),
                'timestamp' : $(this).attr('timestamp'),
                'token' : $(this).attr('token'),
                'tel' : params['tel'],
                'code' : params['code']
            }, function(data){
                if(data['status'] == 0){
                  $.hideIndicator();
                  $.toast("绑定成功");
                    
                  $.router.load('/Mobile/Vip/info', true);
                }else{
                    $.toast("绑定失败，"+data['info']);
                }
            })
        }else{
            $.toast("验证码错误");
        }
    })
  });

  $(document).on("pageInit", "#user-order-page", function(e) {
    $('#all_order_tab').load('/Mobile/Vip/orderList', {}, function(){
      $('#all_order_tab .order_item_link').on('click', function(){
        var order_id = $(this).parent('.order_item').attr('order-id');
        $.router.load('/Mobile/Vip/orderDetails/id/'+order_id, true);
      });
    });

    $('.order_tab_title').on('click', function(){
      var content_id = $(this).attr('tab-content-id');
      if($('#'+content_id).html().trim() == ''){
        var sign = $('#'+content_id).attr('sign');

        $('#'+content_id).load('/Mobile/Vip/orderList', {"sign" : sign}, function(){
          $('#'+content_id + ' .order_item_link').on('click', function(){
            var order_id = $(this).parent('.order_item').attr('order-id');
            $.router.load('/Mobile/Vip/orderDetails/id/'+order_id, true);
          })
        });
      }
    })
  });

  $(document).on("pageInit", "#user-integral-page", function(e) {
    $('#integral-log-list').load('/Mobile/Vip/integralLog');
  });

  $(document).on("pageInit", "#user-card-page", function(e) {
    $('.user-card-list').load('/Mobile/Vip/cardList');

    $('#promo-code-exchange-btn').on('click', function(){
      var code = $('#promo-code-input').val().trim();

      if(!code)
        return;

      $.showIndicator();
      $.post('/Mobile/Vip/exchange_promo_code', {"code":code}, function(data){
        $.hideIndicator();
        if(data.status == 0){
          $.toast("兑换成功");
          $('.user-card-list').load('/Mobile/Vip/cardList');
        }else{
          $.alert(data.info, '兑换失败');
        }
      })
    })
  });

  $.init();
});

function btnControl(time){
    time--;
    $('.get-code-btn').addClass('disable'); 
    $('.get-code-btn').text("获取验证码" + time);
    if(time >0)
        setTimeout("btnControl("+time+")", 1000);
    else{
        $('.get-code-btn').removeClass("disable");
        $('.get-code-btn').text('获取验证码');
    }
}