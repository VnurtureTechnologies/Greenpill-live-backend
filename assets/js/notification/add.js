$(document).ready( function() {
    $(document).on('submit', '.add_form', function() {
        console.log("in add.js");
        var formData = new FormData(this);
        console.log(formData)
        form_action('/notification/do_add','POST','JSON', formData);
    })
})