const nodemailer = require('nodemailer');
const promisify = require('es6-promisify');
require('dotenv').config({ path: 'variables.env' });

const transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	}
});

exports.send = async (options) => {

	const mailOptions = {
		from: `noreply@matcha.com`,
		to: options.email,
		subject: `Matcha | ${options.subject}`,
		text: options.content
	};

	const sendMail = promisify(transport.sendMail, transport);
	return sendMail(mailOptions);
};
