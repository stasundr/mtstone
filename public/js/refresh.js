'use strict';

$(
    setInterval(function() {
        $.post('/refresh', function(data) {
            $('#list').html(data.list);
        })
    }, 1000)
);