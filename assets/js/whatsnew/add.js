$(document).ready( function() {
    $(document).on('submit', '.add_form', function() {
        var formData = new FormData(this);
        form_action('/whatsnew/do_add','POST','JSON', formData);
    })
})

// $(document).ready( function() {
//     $(document).on('submit', '.add_form', function() {
//         var formData = new FormData(this);
//         form_action('/whatsnew/do_add','POST','JSON', formData);
//     })
// })