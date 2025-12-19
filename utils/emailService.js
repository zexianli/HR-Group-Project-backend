import brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
	brevo.TransactionalEmailsApiApiKeys.apiKey,
	process.env.BREVO_API_KEY
);

export const sendRegistrationEmail = async ({ to, name, token }) => {
	const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

	const sendSmtpEmail = new brevo.SendSmtpEmail();
	sendSmtpEmail.sender = {
		name: process.env.BREVO_SENDER_NAME || 'HR Portal',
		email: process.env.BREVO_SENDER_EMAIL,
	};
	sendSmtpEmail.to = [{ email: to, name }];
	sendSmtpEmail.templateId = parseInt(
		process.env.BREVO_REGISTRATION_TEMPLATE_ID
	);
	sendSmtpEmail.params = {
		name,
		registrationLink,
	};

	try {
		const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
		return {
			messageId: data.messageId,
		};
	} catch (error) {
		console.error('Error sending email:', error);
		throw new Error(`Failed to send registration email: ${error.message}`);
	}
};
