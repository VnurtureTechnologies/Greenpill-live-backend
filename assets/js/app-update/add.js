$(document).ready( function() {
    $(document).on('submit', '.add_form', function() {
        var formData = new FormData(this);
        form_action('/app-update/do_add','POST','JSON', formData);
    })
})