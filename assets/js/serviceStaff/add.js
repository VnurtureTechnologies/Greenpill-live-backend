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

    $(document).on('submit', '.add_form', function() {
        var formData = new FormData(this);
        form_action('/servicestaff/do_add','POST','JSON', formData);
    })
})
