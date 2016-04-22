'use strict';

function showPreview(file) {
    //$('#preview').replaceWith('<div id=\"preview\"><img src="' + window.location.href.replace(/#$/, '')  + file + '.png"/></div>')

    var img = `<div id="preview"><img src="${window.location.href.replace(/#$/, '')}${file}.png"/></div>`;
    $('#preview').replaceWith(img);
}

$(
    setInterval(function() {
        $.post('/refresh', function(data) {
            var list = '';
            console.log(data);
            data.originalNames.forEach(function(filename, index) {
                //list += '<a href="#" onclick="showPreview(\'' + data.publicNames[index] + '\')">' + filename + '</a>';

                if (data.fileStatus[index])
                    list += '<a href="#" onclick="showPreview(\'' + data.publicNames[index] + '\')">' + filename + '</a> <i class="fa fa-check"></i>';
                else
                    list += filename + ' <i class="fa fa-hourglass"></i>';

                list += '<br/>';
            });

            $('#list').replaceWith('<div id="list">' + list + '</div>');
        })
    }, 1000)
);