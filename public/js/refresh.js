'use strict';

$(
    setInterval(function() {
        $.post('/refresh', function(data) {
            var list = '';
            data.originalNames.forEach(function(filename, index) {
                if (data.fileStatus[index])
                    list += `<a href="#" onclick="$('#preview').attr('src', '${window.location.pathname}${data.publicNames[index]}.png')"> ${filename} </a> <i class="fa fa-check"></i>`;
                else
                    list += `${filename} <i class="fa fa-hourglass"></i>`;

                list += '<br/>';
            });

            $('#list').html(list);
        })
    }, 1000)
);