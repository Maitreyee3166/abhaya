const User = require('../models/user');
const Contact = require('../models/contact');
const { State, City } = require("country-state-city");
const logger = require('../utils/logger');
const Message = require('../models/message');


class UserController {

    contactCreateView(req, res) {

        const states = State.getStatesOfCountry("IN");
        const cities = City.getCitiesOfState("IN", states);

        return res.render("user/contact_create", {
            userData: req.user,
            states,
            cities
        });
    }

    contactCreateCity(req, res) {

        const cities = City.getCitiesOfState("IN", req.params.stateCode);

        // console.log(cities);

        return res.json(cities);
    }

    async contactView(req, res) {

        try {
            const contact = await Contact.findOne({ userId: req.user.id });

            // console.log(contact);

            res.render("user/contact", {
                userData: req.user,
                contact
            });

        } catch (error) {

            logger.error(error);
            res.render("user/contact");
        }
    }

    async contactCreate(req, res) {
        try {

            const { name, relationship, phone } = req.body;

            // console.log(req.body);

            let contact = await Contact.findOne({
                userId: req.user.id
            });

            if (!contact) {

                // First contact for this user
                contact = new Contact({
                    userId: req.user.id,
                    contacts: [{
                        name,
                        relationship,
                        phone
                    }]
                });

            } else {
                // Add another contact
                contact.contacts.push({
                    name,
                    relationship,
                    phone
                });
            }

            await contact.save();
            return res.redirect("/contact/all");

        } catch (error) {

            logger.error(error);
            return res.redirect('/contact/add-view')
        }
    }

    contactSupportPageView (req, res) {

        return res.render("contact");
    }

    async messageCreate(req, res){
        try {
            const { name, email, phone, type, message } = req.body;``
            
            const newMessage = new Message({name, email, phone, type, message});

            const result = await newMessage.save();

            req.flash("success", "Your message has been sent successfully to our support team!");
            return res.redirect('/contact/support');

        } catch (error) {
            req.flash("error", "Something Error!");
            return res.redirect('/contact/support');
            
        }
    }
}


module.exports = new UserController()