$(document).ready(function () {
    $("#list_table").DataTable({
        dom: 'l<"toolbar">frtip',
        "responsive": true,
        "stateSave": false,
        "keys": false,
        "searching": false,
        "pagingType": "full_numbers",
        "bProcessing": true,
        "serverSide": true,
        "bServerSide": true,
        "bSort": false,
        "bDestroy": true,
        "bPaginate": false,
        "bInfo": false,
        "order": [],
        "oLanguage": {
            "sInfoFiltered": "",
            "sProcessing": "<img src='images/ajax-loader.gif' alt='loader'>",
            "sZeroRecords": "No Data Found",
            "sInfo": "Showing _START_ to _END_ of _TOTAL_ Users",
            "sLengthMenu": "Show _MENU_ Users",
            "sInfoEmpty": "Showing 0 to 0 of 0 Users",
            oPaginate: {
                sNext: '<span data-toggle="tooltip" title="Next Page" class="pagination-fa"><i class="fa fa-angle-right" ></i></span>',
                sPrevious: '<span data-toggle="tooltip" title="Previous Page" class="pagination-fa"><i class="fa fa-angle-left" ></i></span>',
                sFirst: false,
                sLast: false,
            },
        },
        "fnPreDrawCallback": function () {
            $("#list_table-table").hide();
            $(".loading").show();
        },
        "fnDrawCallback": function () {
            $("#list_table-table").show();
            $(".loading").hide();
            if (Math.ceil((this.fnSettings().fnRecordsDisplay()) / this.fnSettings()._iDisplayLength) > 1) {
                $('#list_table_paginate').css("display", "block");
            } else {
                $('#list_table_paginate').css("display", "none");
            }
        },
        "ajax": {
            url: '/user-list',
            type: "post",
            dataType: 'json',
            // data: function (d) {
            //     d.is_dashboard = $('[name=is_dashboard]').val();
            // }
        },
        "columns": [
            {"data": "firstName", "name": "firstName"},
            {"data": "lastName", "name": "lastName"},
            {"data": "mobileNumber", "name": "mobileNumber"},
            {"data": "email", "name": "email"},
            {"data": "role", "name": "role"},
            {"data": "companyName", "name": "companyName"},
            {"data": "get_action_button", "name": "get_action_button"}
        ],
        "columnDefs": [
            {"targets": -1, "orderable": false, },
        ]
    });

    $('#list_table').delegate('a.delete', 'click', function () {
        var id = $(this).attr('data-id');
        var action = $(this).attr('data-action');
		var data = {action: action};
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.value) {
                do_btn_action('/users-delete/' + id, data, 'delete');
            }
        });
    });
});

function do_btn_action(url, data, type) {
    $.ajax({
        url: url,
        type: type,
		data: data,
        dataType: 'json',
    }).done(function (response) {
        if (response.status == false) {
            Swal.fire("Sorry!", "Unable to process your request. Please try again later.", "error");
        } else {
            Swal.fire(response.title, response.message , "success");
            if (response.redirect != '') {
                setTimeout(function () {
                    location.replace(response.redirect);
                }, 1200);
            }
        }
    }).fail(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something Went Wrong!'
        });
    });
}
