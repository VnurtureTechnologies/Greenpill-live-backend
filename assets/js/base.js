$(document).ready(function() {

});

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            //#show_image - img tag id
            $('#show_image').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}


function form_action(url, type, datatype, data) {
    console.log(url);
    $('.validation_error').remove();
    $('form :submit');
    $.ajax({
        url: url,
        data: data,
        type: type,
        dataType: datatype,
        processData: false,
        contentType: false,
        beforeSend: function() {
            $(".page_loader").show();
        },
    }).done(function(response) {
        $('input, select, textarea').removeAttr('style');
        $('form :submit').removeAttr("disabled", "disabled");
        $(".page_loader").hide();
        // $('html, body').animate({
        //     scrollTop: $('form').offset().top - 20
        // }, 'slow');
        if (response.status == true) {
            Swal.fire('Success!', response.message, "success");
            if (response.redirect != '') {
                setTimeout(function() {
                    location.replace(response.redirect);
                }, 1200);
            }
        } else {
            if (typeof response.message == "string") {
                Swal.fire("Sorry!", response.message, "error");
            } else {
                $.each(response.message, function(key, value) {
                    $("[name='" + value['param'] + "']").attr('style', 'border-bottom: 1px solid red');
                    $("[name='" + value['param'] + "']").after('<div class="validation_error">' + value['msg'] + '</div>');
                });
            }
        }
    }).fail(function(error) {
        $('form :submit').removeAttr("disabled", "disabled");
        console.log(error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!'
        });
    });
}

