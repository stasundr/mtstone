'use strict';

function preview(file) {
    $('#preview').attr('src', `${window.location.pathname}${file}.png`);
}

$(
    setInterval(function() {
        $.post('/refresh', function(data) {
            var list = '';
            data.originalNames.forEach(function(filename, index) {
                if (data.fileStatus[index])
                    list += `<a href="#" onclick="preview('${data.publicNames[index]}')">${filename}</a> <i class="fa fa-check"></i>`;
                else
                    list += `${filename} <i class="fa fa-hourglass"></i>`;

                list += '<br/>';
            });

            $('#list').html(list);
        })
    }, 1000)
);