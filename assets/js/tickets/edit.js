$(document).ready( function() { 
    const ticketId = window.location.pathname.split("/")[2];
    let ticket_data = ""
    
    $.ajax({
        url: `/ticket-internal-edit/${ticketId}`,
        type: 'GET',
    }).done((response) => {
        console.log(response);
        ticket_data = response;
        if(response.data[2].payment) {
            response.data[2].payment.forEach((payment, index) => {
                var payment_html = "";
                payment_html += `<div class="floating-label left_fld">`;
                payment_html += `<label> Payment ${index} </label>`;
                payment_html += `<input class="floating-input" id="payment" value="${payment.amount}" name="payment" type="text" disabled>`
                payment_html += `</div>`;

                $("#inner_dynamic_payment").append(payment_html);
            })
        } else {
            var html = `<h5 text-align: center; margin-bottom: 10px; font-weight: 7000;>No payments till date.</h5>`
            $("#inner_dynamic_payment").append(html);
        }

        if(response.data[3].documents) {
            response.data[3].documents.forEach((document, index) => {
                var document_html = "";
                var file_name = document.split('%2F')[0] + " " + document.split('%2F')[1]
                document_html += `
                                    <a href='${document}' style="color:blue; text-decoration: underline; position: pointer" target="_blank">Document ${index + 1}
                                    </a>
                                 `
                $('#inner_dynamic_document').append(document_html);
            })
        }

        if(response.data[5]) {
            var select = "";
            select += `<select id="selected" class="floating-select" name="service_staff">
                            <option value="">-- Choose --</option>`;
                            response.data[5].forEach((staff) => {
                                select += ` <option value="${staff}">${staff}</option> `
                            })
            select += `</select>`;
            $('#serviceStaff').append(select);
        }
    })

    $(document).on('click', '#additional_info', () => {
        if($('#additional_info').hasClass('not_appended') == true) {
            if(ticket_data.data[4].additional_info) {
                var count = 1;
                Object.entries(ticket_data.data[4].additional_info).map(([key, value]) => {
    
                    if(count % 2 == 1) {
                        var additional_html = "";
                        additional_html +=  `<div class="claerfix"></div>`;
                        additional_html += `<div class="floating-label left_fld">`;
                        additional_html += `<label> ${key} </label>`;
                        additional_html += `<input class="floating-input" id="add_info" value="${value}" name="${key}-addInfo" type="text">`;
                        additional_html += `</div>`;
                        count++;
                    } else {
                        var additional_html = "";
                        additional_html += `<div class="floating-label right_fld">`;
                        additional_html += `<label> ${key} </label>`;
                        additional_html += `<input class="floating-input" id="add_info" value="${value}" name="${key}-addInfo" type="text">`;
                        additional_html += `</div>`;
                        count++;
                    }
    
                    $('#inner_dynamic_add_info').append(additional_html);
                })
                $('#add_sign').addClass('fa-minus').removeClass('fa-plus');
                $('#additional_info').removeClass('not_appended')
                $('#additional_info').addClass('appended');
            }
        } else if ($('#additional_info').hasClass('appended') == true) {
            $('#inner_dynamic_add_info').empty();
            $('#add_sign').addClass('fa-plus').removeClass('fa-minus');
            $('#additional_info').removeClass('appended');
            $('#additional_info').addClass('not_appended');
        }
    })

    $(document).on('submit', '.edit_form', function() {
        var id = $(this).attr('data-id');
        var formData = new FormData(this);

        form_action('/tickets/do_edit/'+ id ,'POST' ,'json' , formData);
    })
})
