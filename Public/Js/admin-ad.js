if(defaultReview){
	$('.alert').show();
}

function changeMsgBtn(NewType, ClassId){
	_G(ClassId, '.key').hide();
	if(NewType === 'right'){
		_G(ClassId, '.fwCode').show();
		_G(ClassId, '.company').show();
		_G(ClassId, '.brand').show();
		_G(ClassId, '.product').show();
		_G(ClassId, '.wlCode').show();
		_G(ClassId, '.dealer').show();
		_G(ClassId, '.dealername').show();
		_G(ClassId, '.cktime').show();
	}
	else if(NewType == 'repert'){
		_G(ClassId, '.fwCode').show();
		_G(ClassId, '.company').show();
		_G(ClassId, '.brand').show();
		_G(ClassId, '.product').show();
		_G(ClassId, '.wlCode').show();
		_G(ClassId, '.checkCount').show();
		_G(ClassId, '.firstTime').show();
		_G(ClassId, '.dealer').show();
		_G(ClassId, '.dealername').show();
		_G(ClassId, '.cktime').show();
	}
	else if(NewType == 'error'){
		_G(ClassId, '.fwCode').show();
	}
}

$(function() {
	/*  在textarea处插入文本--Start */
	(function($) {
		$.fn
		.extend({
			insertContent : function(myValue, t) {
				var $t = $(this)[0];
				if (document.selection) { // ie
					this.focus();
					var sel = document.selection.createRange();
					sel.text = myValue;
					this.focus();
					sel.moveStart('character', -l);
					var wee = sel.text.length;
					if (arguments.length == 2) {
						var l = $t.value.length;
						sel.moveEnd("character", wee + t);
						t <= 0 ? sel.moveStart("character", wee - 2 * t
								- myValue.length) : sel.moveStart(
								"character", wee - t - myValue.length);
						sel.select();
					}
				} else if ($t.selectionStart
						|| $t.selectionStart == '0') {
					var startPos = $t.selectionStart;
					var endPos = $t.selectionEnd;
					var scrollTop = $t.scrollTop;
					$t.value = $t.value.substring(0, startPos)
							+ myValue
							+ $t.value.substring(endPos,
									$t.value.length);
					this.focus();
					$t.selectionStart = startPos + myValue.length;
					$t.selectionEnd = startPos + myValue.length;
					$t.scrollTop = scrollTop;
					if (arguments.length == 2) {
						$t.setSelectionRange(startPos - t,
								$t.selectionEnd + t);
						this.focus();
					}
				} else {
					this.value += myValue;
					this.focus();
				}
			}
		})
	})(jQuery);
	/* 在textarea处插入文本--Ending */
});