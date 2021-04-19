$(document).ready( function() {
    $(document).on('submit', '.edit_form', function() {
        var id = $(this).attr('data-id');
        var formData = new FormData(this);
        form_action('/news/do_edit/'+ id ,'POST' ,'json' , formData);
    })
})