import brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export const sendRegistrationEmail = async ({ to, name, token }) => {
  const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || 'HR Portal',
    email: process.env.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email: to, name }];
  sendSmtpEmail.templateId = parseInt(process.env.BREVO_REGISTRATION_TEMPLATE_ID);
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

export const sendVisaDocumentReminderEmail = async ({ to, name, documentType, action }) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || 'HR Portal',
    email: process.env.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email: to, name }];
  sendSmtpEmail.subject = 'Visa Document Reminder';
  sendSmtpEmail.htmlContent = `
		<html>
			<body>
				<h2>Visa Document Reminder</h2>
				<p>Dear ${name},</p>
				<p>${action === 'upload' ? 'Please upload' : 'Please re-upload'} your <strong>${documentType}</strong>.</p>
				<p>Please log in to the HR portal to submit the required document.</p>
				<p>If you have any questions, please contact HR.</p>
				<br>
				<p>Best,</p>
				<p>HR Team</p>
			</body>
		</html>
	`;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return {
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Error sending visa reminder email:', error);
    throw new Error(`Failed to send visa reminder email: ${error.message}`);
  }
};
