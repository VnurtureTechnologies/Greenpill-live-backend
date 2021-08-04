const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

var jsonPath = path.join(__dirname, '..', 'storage-config', 'data.json')

exports.get_firestore_data = async function()  {

        var db = admin.firestore();

        await db.collection('users').get()
        .then( async(r) => {
            var users_data = ["USERS"];
            r.forEach((result) => {
                users_data.push(result.data())
            })

            fs.writeFileSync(jsonPath, JSON.stringify(users_data,null,2));

            await db.collection('product').get()
            .then( async(pror) => {
                var products_data = ["PRODUCTS"];
                pror.forEach((proresult) => {
                    products_data.push(proresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(products_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('project').get()
            .then( async(proj) => {
                var project_data = ["PROJECTS"];
                proj.forEach((projresult) => {
                    project_data.push(projresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(project_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('news_and_innovation').get()
            .then( async(news) => {
                var news_data = ["NEWS AND INNOVATION"];
                news.forEach((newsresult) => {
                    news_data.push(newsresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(news_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('resources').get()
            .then( async(resources) => {
                var resources_data = ["RESOURCES"];
                resources.forEach((resourcesresult) => {
                    resources_data.push(resourcesresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(resources_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('admin').get()
            .then( async(admin) => {
                var admin_data = ["ADMIN"];
                admin.forEach((adminresult) => {
                    admin_data.push(adminresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(admin_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('contact').get()
            .then( async(contact) => {
                var contact_data = ["CONTACT"];
                contact.forEach((contactresult) => {
                    contact_data.push(contactresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(contact_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('getintouch').get()
            .then( async(getTouch) => {
                var getTouch_data = ["GET IN TOUCH"];
                getTouch.forEach((getTouchresult) => {
                    getTouch_data.push(getTouchresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(getTouch_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('greenIdeas').get()
            .then( async(greenIdeas) => {
                var greenIdeas_data = ["GREEN IDEAS"];
                greenIdeas.forEach((greenIdeasresult) => {
                    greenIdeas_data.push(greenIdeasresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(greenIdeas_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('notifications').get()
            .then( async(notifications) => {
                var notifications_data = ["NOTIFICATIONS"];
                notifications.forEach((notificationsresult) => {
                    notifications_data.push(notificationsresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(notifications_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('partnerPrograms').get()
            .then( async(partnerPrograms) => {
                var partnerPrograms_data = ["PARTNER PROGRAMS"];
                partnerPrograms.forEach((partnerProgramsresult) => {
                    partnerPrograms_data.push(partnerProgramsresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(partnerPrograms_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('videoGallery').get()
            .then( async(videoGallery) => {
                var videoGallery_data = ["VIDEO GALLERY"];
                videoGallery.forEach((videoGalleryresult) => {
                    videoGallery_data.push(videoGalleryresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(videoGallery_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

            await db.collection('whatsnew').get()
            .then( async(whatsnew) => {
                var whatsnew_data = ["WHATSNEW"];
                whatsnew.forEach((whatsnewresult) => {
                    whatsnew_data.push(whatsnewresult.data())
                })

                const fileData = JSON.parse(fs.readFileSync(jsonPath));
                fileData.push(whatsnew_data)
                fs.writeFileSync(jsonPath, JSON.stringify(fileData,null,2));
            })

        })

}