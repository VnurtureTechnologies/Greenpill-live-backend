$(document).ready( function() {
    $(document).on('submit', '.add_form', function() {
        var formData = new FormData(this);
        form_action('/servicestaff/do_add','POST','JSON', formData);
    })
})
