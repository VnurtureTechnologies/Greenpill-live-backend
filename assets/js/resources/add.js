$(document).ready( function() {
    $(document).on('submit', '.add_form', function() {
        var formData = new FormData(this);
        form_action('/resources/do_add','POST','JSON', formData);
    })
})