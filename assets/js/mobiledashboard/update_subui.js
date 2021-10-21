$(document).ready( function() {
    $(document).on('submit', '.add_form', function() {
        var formData = new FormData(this);
        form_action('/mobiledashboard/update_subui','POST','JSON', formData);
    })
})
