$(document).ready(function () {
    $(document).on('submit', '.add_form', function () {
        var formData = new FormData(this);
        form_action('/users/do_add', 'POST', 'JSON', formData);
    })
})
