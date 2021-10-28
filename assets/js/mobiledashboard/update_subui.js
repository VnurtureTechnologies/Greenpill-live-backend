$(document).ready( function() {
    $(document).on('submit', '.add_form', function() {
        var formData = new FormData(this);
        form_action('/mobiledashboard/update_subui','POST','JSON', formData);
    })

    $('#services_tab').on('change', function() {
        $.ajax({
            url: `/mobiledashboard/get_subservices_data/${this.value}`,
            type: 'GET',
            success: function(data) {

                $('#subservice').empty();

                var html = ""
                
                html += `<label>Choose a sub service <span class="required">*</span></label>`;
                html += `<select class="floating-select" name="subservicetype" required>`;
                html += `<option value="nonex">--Choose--</option>`;
                data.forEach((d) => {
                    html += `<option value="${d.id}">${d.title}</option>`
                })
                html += ` </select>`;

                $('#subservice').append(html);
            }
        })
    })
})
