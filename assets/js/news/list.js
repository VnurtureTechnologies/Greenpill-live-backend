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
        "bDestroy": true,
        "bPaginate": false,
        "bInfo": false,
        "order": [],
        "oLanguage": {
            "sInfoFiltered": "",
            "sProcessing": "<img src='images/ajax-loader.gif' alt='loader'>",
            "sZeroRecords": "No Users found",
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
            url: '/news-list',
            type: "post",
            dataType: 'json',
            // data: function (d) {
            //     d.is_dashboard = $('[name=is_dashboard]').val();
            // }
        },
        "columns": [
            {"data": "title", "name": "title"},
            {"data": "category", "name": "category"},
            {"data": "short description", "name": "short description"},
            {"data": "long description", "name": "long description"},
            {"data": "pdf url", "name": "pdf url"},
            {"data": "web url", "name": "web url"},
            {"data": "get_action_button", "name": "get_action_button"}
        ],
        "columnDefs": [
            {"targets": -1, "orderable": false, },
        ]
    });

    $('#list_table').delegate('a.delete', 'click', function () {
        var id = $(this).attr('data-id');
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
                user_delete_action('/user-delete/' + id);
            }
        });
    });
});

function user_delete_action(url) {
    $.ajax({
        url: url,
        type: 'delete',
        dataType: 'json',
    }).done(function (response) {
        if (response.status == false) {
            Swal.fire("Sorry!", "Unable to process your request. Please try again later.)", "error");
        } else {
            Swal.fire('Deleted!', response.message , "success");
            setTimeout(function () {
                location.replace('/dashboard');
            }, 1200);
        }
    }).fail(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!'
        });
    });
}