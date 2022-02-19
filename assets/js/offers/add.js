$(document).ready(function () {

    $(document).on('submit', '.add_form', function () {
        var formData = new FormData(this);
        form_action('/offers/do_add', 'POST', 'JSON', formData);
    })
})

function show() {
    document.getElementById('amount').style.display = 'block';
}

function hide() {
    document.getElementById('amount').style.display = 'none';
}

function readURL(input, x) {
    if (input.files && input.files[0] && x == 'banner_image') {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#banner_image')
                .attr('src', e.target.result)
                .width(150)
                .height(200);
        };
        reader.readAsDataURL(input.files[0]);
    }

    if (input.files && input.files[0] && x == 'detail_image') {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#detail_image')
                .attr('src', e.target.result)
                .width(150)
                .height(200);
        };
        reader.readAsDataURL(input.files[0]);
    }

}
