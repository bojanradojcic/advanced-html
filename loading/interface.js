(function($) {
  var blankGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  var phoneNumber = '';

  function goToPage(name) {
    $('body > div.page').hide();
    $('#page_' + name).show();
  }

  function playCountdownSound() {
    var el = $('#countdown')[0];
    el.play();
  }

  function animateShutterButton(button, callback) {
    var $button = $(button);
    var $divs = $button.find('li div');
    var delay = 5;
    var interval = (delay * 1000 / $divs.length);

    $button.addClass('animating');
    $divs.css({ opacity: 1 });

    $divs.each(function(i) {
      var complete;

      if (i == $divs.length - 1) {
        complete = function() {
          $button.removeClass('animating');
          $divs.css({ opacity: 1 });
          callback();
        };
      }

      $(this).delay(i * interval).animate({ opacity: 0.25 }, interval, complete);
    });
  }

  function requestWarmup() {
    $.post('/warmup').fail(function() {
      goToPage('error');
    })
  }

  function requestCapture(poll) {
    $.post('/requests', function(id) {
      (poll = function() {
        setTimeout(function() {
          $.get('/requests/' + id, function(status) {
            if (status == 'completed') {
              $('#preview').attr('src', '/requests/' + id + '/image');
              goToPage('preview');
            } else if (status == 'pending') {
              poll();
            } else {
              goToPage('error');
            }
          }).fail(function() {
            goToPage('error');
          });
        }, 3000);
      })();
    }).fail(function() {
      goToPage('error');
    });
  }

  function clearPreview() {
    $('#preview').attr('src', blankGif);
  }

  function reset() {
    phoneNumber = '';
    clearPreview();
    goToPage('capture');
  }

  // Navigation
  $(function() {
    reset();

    $('#shutter_button:not(.animating)').on('click', function() {
      playCountdownSound();
      requestWarmup();
      animateShutterButton(this, function() {
        goToPage('loading');
        requestCapture();
      });
      return false;
    });

    $('#done_loading').on('click', function() {
      goToPage('preview');
      return false;
    });

    $('#accept_photo').on('click', function() {
      phoneNumber = '';
      goToPage('deliver');
      return false;
    });

    $('#decline_photo').on('click', function() {
      reset();
      return false;
    });

    $('#accept_phone, #skip_phone').on('click', function() {
      goToPage('finish');
      return false;
    });
  });

  $(function() {
    $('#preview').click(function() {
      var $img = $(this), src = $img.attr('src').replace(/\?.*/, '');
      clearPreview();
      setTimeout(function() { $img.attr('src', src + '?' + new Date().getTime()) }, 100);
    });
  });

  // Keypad
  $(function() {
    $("#keypad").on("mousedown touchstart", "li.number_button", function(event) {
      var $key = $(this);
      var key = $key.data("key");

      if (key == "clear") {
        clear();
      } else if (key == "backspace") {
        backspace();
      } else {
        press(key);
      }

      return false;
    });

    function redraw() {
      var span = document.getElementById("number");
      span.innerHTML = formatLocal("US", phoneNumber);
    }

    function press(digit) {
      phoneNumber += digit;
      redraw();
    }

    function backspace() {
      phoneNumber = phoneNumber.slice(0, number.length - 1);
      redraw();
    }

    function clear() {
      phoneNumber = '';
      redraw();
    }
  });

  $(function() {
    FastClick.attach(document.body);
  });

  $(function() {
    $(document).on("touchmove", function(event) {
      event.preventDefault();
    });
  });
}).call(this, jQuery);
