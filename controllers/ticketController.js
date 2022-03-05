const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.get_all_tickets = async (req, res, next) => {
    const db = admin.firestore();

    await db.collection('clientBooking')
        .get()
        .then((result) => {
            var tickets = [];
            result.forEach((r) => {
                var row = {
                    "id": r.data().timestamp,
                    "service men": r.data().serviceStaff || '-',
                    "final cost": r.data().finalCost || '-',
                    "payment": sumFromArray('amount', r.data().payments),
                    "status": r.data().status,
                    "get_action_button": get_action_button(req, res, r)
                }
                tickets.push(row)
            })
            res.json(
                {
                    data: tickets
                }
            )
        })
}

const sumFromArray = (propertyName, array) => {
    let sum = 0;
    if (Array.isArray(array) && array.length > 0) {
        array.forEach(item => {
            sum += parseInt(item[propertyName]);
        });
        return sum;
    } else { return '-' }
};

function get_action_button(req, res, data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="/ticket-edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.edit_ticket = async (req, res, next) => {
    const db = admin.firestore();
    const id = req.params.id;
    var add_info = {}

    Object.entries(req.body).map(([key, value]) => {
        if (key.includes('-addInfo')) {
            add_info[key.split('-')[0]] = value
        }
    })

    let update_data = {
        status: req.body.status,
        finalCost: req.body.final_cost,
        minPayment: req.body.min_payment,
        serviceStaff: req.body.service_staff,
        additionalInformation: add_info
    }

    if (req.files) {
        await db.collection('clientBooking').doc(`${id}`)
            .get()
            .then(async (response) => {
                let category = response.data().category;
                let sub_category = response.data().subCategory;
                helpers.getfolderName(`bookings/${category}/${sub_category}/${response.id}`);

                if (req.files.performa_file && req.files.performa_file[0].fieldname == "performa_file") {
                    const performaUrl = await helpers.uploadTicketsPdf(req.files.performa_file[0]);
                    update_data['performaInvoice'] = performaUrl;
                    helpers.deleteObject(response.data().performaInvoice)
                }

                if (req.files.quotation_file && req.files.quotation_file[0].fieldname == "quotation_file") {
                    const quotationUrl = await helpers.uploadTicketsPdf(req.files.quotation_file[0]);
                    update_data['quotationFile'] = quotationUrl;
                    helpers.deleteObject(response.data().quotationFile)
                }
            })
    }

    setTimeout(editTicketData, 1000, update_data, id, res);
}

const editTicketData = (update_data, id, res) => {
    const db = admin.firestore();

    db.collection('clientBooking').doc(`${id}`).update(update_data)
        .then((response) => {
            res.json({
                status: true,
                message: "Data updated successfully",
                redirect: '/tickets'
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                message: "Something went wrong",
                redirect: '/tickets'
            })
        })
}

module.exports.delete_ticket = async (req, res, next) => {
    var db = admin.firestore();

    await db.collection('clientBooking').doc(`${req.params.id}`).delete()
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Ticket Deleted Successfully",
                redirect: "/tickets"
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                message: "Internal server error",
            })
        })
}


module.exports.get_ticket_data = function (ticket_id, callback) {
    var db = admin.firestore();
    const data = []

    db.collection('clientBooking').doc(`${ticket_id}`)
        .get()
        .then(async (r) => {
            await db.collection('users').doc(`${r.data().clientId}`)
                .get()
                .then((userDetails) => {
                    const user_data = {
                        username: userDetails.data().name,
                        mobile: userDetails.data().mobileNumber,
                        companyName: userDetails.data().companyName,
                        email: userDetails.data().email
                    }

                    data.push(user_data);

                    const ticket_data = {
                        id: r.id,
                        address: r.data().address,
                        city: r.data().city,
                        status: r.data().status,
                        category: r.data().category,
                        sub_category: r.data().subCategory,
                        serviceStaff: r.data().serviceStaff || "-- Choose --",
                        final_cost: r.data().finalCost,
                        minimum_payment: r.data().minPayment,
                    }

                    data.push(ticket_data);

                    const payment_data = {
                        payment: r.data().payments
                    }

                    data.push(payment_data);

                    const documents = {
                        documents: r.data().document
                    }

                    data.push(documents);

                    const additional_info = {
                        additional_info: r.data().additionalInformation
                    }

                    data.push(additional_info);

                    db.collection('serviceStaff').where('speciality', 'array-contains', `${r.data().category}`)
                        .get()
                        .then((staffResponse) => {
                            let serviceStaff = [];
                            staffResponse.forEach((staff) => {
                                serviceStaff.push(staff.data().fullname);
                            })

                            data.push(serviceStaff);
                            callback(data);
                        })
                })
        })
        .catch((err) => {
            callback([]);
        })
}
