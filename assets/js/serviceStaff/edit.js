$(document).ready( function() {
    $('#checkBtn').click(function() {
        checked = $("input[type=checkbox]:checked").length;
        if(!checked) {
          Swal.fire({
          title: 'Oops',
          text: "You must check at least one Speciality.",
          icon: 'error',
        });
          return false;
        }  
    });

    $(document).on('submit', '.edit_form', function() {
        var id = $(this).attr('data-id');
        var formData = new FormData(this);
        form_action('/servicestaff/do_edit/'+ id ,'POST' ,'json' , formData);
    })
})
