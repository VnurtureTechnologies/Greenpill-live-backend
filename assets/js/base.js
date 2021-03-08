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


function fetch_place(url, type, datatype, data) {
    console.log(url);
    $.ajax({
        url: url,
        data: data,
        type: type,
        dataType: datatype,
        processData: false,
        contentType: false,
    }).done(function(response) {
        alert('place fetched successfully');
        var id_input = document.getElementById('fetched_place_id');
        id_input.value = response.data;
        console.log(response);
    }).fail(function(response) {
        alert('Something went wrong');
        location.reload();
    })
}

var photo_reference_data = [];
var restaurant_name;

function fetch_place_details(url, type, datatype, data) {
    console.log(url);
    $.ajax({
        url: url,
        data: data,
        type: type,
        dataType: datatype,
        processData: false,
        contentType: false,
    }).done(function(response) {
        alert('place details fetched successfully');
        res_name = document.getElementById('rest_name');
        res_name.value = response.data.name;
        restaurant_name = response.data.name;
        res_phone = document.getElementById('rest_phone');
        res_phone.value = response.data.formatted_phone_number;
        res_lat = document.getElementById('rest_lat');
        res_lat.value = response.data.geometry.location.lat;
        res_long = document.getElementById('rest_long');
        res_long.value = response.data.geometry.location.lng;
        res_address = document.getElementById('rest_address');
        res_address.value = response.data.adr_address;
        res_mon = document.getElementById('monday');
        res_mon.value = response.data.opening_hours.weekday_text[0];
        res_tue = document.getElementById('tuesday');
        res_tue.value = response.data.opening_hours.weekday_text[1];
        res_wed = document.getElementById('wednesday');
        res_wed.value = response.data.opening_hours.weekday_text[2];
        res_thurs = document.getElementById('thursday');
        res_thurs.value = response.data.opening_hours.weekday_text[3];
        res_fri = document.getElementById('friday');
        res_fri.value = response.data.opening_hours.weekday_text[4];
        res_sat = document.getElementById('saturday');
        res_sat.value = response.data.opening_hours.weekday_text[5];
        res_sun = document.getElementById('sunday');
        res_sun.value = response.data.opening_hours.weekday_text[6];
        // res_photo_reference = document.getElementById('photo_reference');
        response.data.photos.forEach(resp => {
            photo_reference_data.push(resp.photo_reference);
        });
        // console.log(photo_reference_data)
        // res_photo_reference.value = response.data.photos[0].photo_reference;
        // console.log(response);
    }).fail(function(response) {
        alert('Something went wrong');
        location.reload();
    })
}

function return_data() {
    return photo_reference_data;
}

function return_restaurant_name() {
    return restaurant_name;
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

function addcsv_db(url, type, datatype, data) {
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
            console.log(response)
            Swal.fire({
                icon: 'success', 
                title: response.message, 
                text: response.data
            });
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
        console.log(error)
        console.log(error.responseText['message']);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.responseText
        });
    });
}