$(document).ready( function() {
    $(document).on('submit', '.add_form', function() {
        var formData = new FormData(this);
        form_action('/mobiledashboard/do_add','POST','JSON', formData);
    })
})