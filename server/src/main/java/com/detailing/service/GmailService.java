package com.detailing.service;

import com.detailing.config.GmailConfig;
import com.detailing.config.EmailDeliverabilityConfig;
import com.detailing.model.Booking;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.internet.MimeBodyPart;
import javax.activation.DataHandler;
import javax.activation.DataSource;

import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Properties;

@Service
public class GmailService {

    private static final Logger logger = LoggerFactory.getLogger(GmailService.class);
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String APPLICATION_NAME = "Earned Shine Detailing";

    private final GmailConfig gmailConfig;
    private final EmailDeliverabilityConfig deliverabilityConfig;
    private final EmailTemplateService emailTemplateService;
    private final CalendarService calendarService;
    private volatile Gmail gmailService;

    @Autowired
    public GmailService(GmailConfig gmailConfig, 
                       EmailDeliverabilityConfig deliverabilityConfig,
                       EmailTemplateService emailTemplateService,
                       CalendarService calendarService) {
        this.gmailConfig = gmailConfig;
        this.deliverabilityConfig = deliverabilityConfig;
        this.emailTemplateService = emailTemplateService;
        this.calendarService = calendarService;
    }

    private Gmail getGmail() throws Exception {
        if (gmailService == null) {
            synchronized (this) {
                if (gmailService == null) {
                    logger.info("Initializing Gmail service…");

                    NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();

                    UserCredentials creds = UserCredentials.newBuilder()
                            .setClientId(gmailConfig.getClientId())
                            .setClientSecret(gmailConfig.getClientSecret())
                            .setRefreshToken(gmailConfig.getRefreshToken())
                            .build();

                    gmailService = new Gmail.Builder(
                                    transport,
                                    JSON_FACTORY,
                                    new HttpCredentialsAdapter(creds))
                            .setApplicationName(APPLICATION_NAME)
                            .build();

                    logger.info("Gmail service ready");
                }
            }
        }
        return gmailService;
    }

    public void sendBookingConfirmation(Booking booking) {
        sendBookingConfirmation(booking, !deliverabilityConfig.isUseHtmlEmails());
    }

    public void sendBookingConfirmation(Booking booking, boolean plainText) {
        try {
            String subject = "Booking Confirmation - " + booking.getBookingId();
            String content = plainText ? 
                emailTemplateService.generateBookingConfirmationPlainText(booking) : 
                emailTemplateService.generateBookingConfirmationEmail(booking);
            
            sendEmailWithBooking(
                booking.getEmail(),
                subject,
                content,
                plainText,
                booking
            );
            
            if (deliverabilityConfig.isSendAdminNotifications()) {
                sendAdminBookingNotification(booking, plainText);
            }
            
            logger.info("Confirmation email sent for {} ({}, calendar: {}) to customer{}",
                       booking.getBookingId(), 
                       plainText ? "plain text" : "HTML", 
                       deliverabilityConfig.isIncludeCalendarInvite() ? "included" : "not included",
                       deliverabilityConfig.isSendAdminNotifications() ? " and admin" : "");
        } catch (Exception e) {
            logger.error("Failed to send confirmation for {}", booking.getBookingId(), e);
        }
    }

    public void sendAdminBookingNotification(Booking booking, boolean plainText) {
        try {
            String subject = "New Booking Received - " + booking.getBookingId();
            String content = plainText ? 
                emailTemplateService.generateAdminBookingNotificationPlainText(booking) : 
                emailTemplateService.generateAdminBookingNotificationEmail(booking);
            
            sendEmailWithBooking(
                gmailConfig.getFromEmail(),
                subject,
                content,
                plainText,
                booking
            );
            
            logger.info("Admin notification sent for booking {}", booking.getBookingId());
        } catch (Exception e) {
            logger.error("Failed to send admin notification for {}", booking.getBookingId(), e);
        }
    }

    public void sendBookingStatusUpdate(Booking booking, String previousStatus) {
        try {
            String subject = "Booking Status Update - " + booking.getBookingId();
            String content = "Your booking status has been updated from " + previousStatus + " to " + booking.getStatus();
            
            sendEmailWithBooking(
                booking.getEmail(),
                subject,
                content,
                true,
                booking
            );
            
            logger.info("Status update email sent for booking {}", booking.getBookingId());
        } catch (Exception e) {
            logger.error("Failed to send status update for {}", booking.getBookingId(), e);
        }
    }

    private void sendEmailWithBooking(String toEmail, String subject, String content, boolean plainText, Booking booking) throws Exception {
        MimeMessage mime;
        
        if (deliverabilityConfig.isIncludeCalendarInvite()) {
            mime = createEmailWithCalendarInvite(toEmail, subject, content, plainText, booking);
        } else {
            mime = createEmail(toEmail, subject, content, plainText);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        mime.writeTo(baos);
        String raw = Base64.getUrlEncoder().encodeToString(baos.toByteArray());

        Message msg = new Message();
        msg.setRaw(raw);

        getGmail().users().messages().send("me", msg).execute();
    }

    private MimeMessage createEmailWithCalendarInvite(String toEmail, String subject, String content, 
                                                      boolean plainText, Booking booking) throws Exception {
        Session session = Session.getInstance(new Properties(), null);
        MimeMessage email = new MimeMessage(session);
        
        email.setFrom(new InternetAddress(gmailConfig.getFromEmail(), gmailConfig.getFromName()));
        email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(toEmail));
        email.setSubject(subject);

        MimeMultipart multipart = new MimeMultipart("mixed");

        MimeBodyPart textPart = new MimeBodyPart();
        if (plainText) {
            textPart.setText(content, "UTF-8");
        } else {
            textPart.setContent(content, "text/html; charset=UTF-8");
        }
        multipart.addBodyPart(textPart);

        String icsContent = calendarService.generateCalendarInvite(booking);
        if (!icsContent.isEmpty()) {
            MimeBodyPart calendarPart = new MimeBodyPart();
            calendarPart.setDataHandler(new DataHandler(new CalendarDataSource(icsContent)));
            calendarPart.setHeader("Content-Type", "text/calendar; method=REQUEST; name=\"invite.ics\"");
            calendarPart.setHeader("Content-Disposition", "attachment; filename=\"invite.ics\"");
            multipart.addBodyPart(calendarPart);
        }

        email.setContent(multipart);
        return email;
    }

    private MimeMessage createEmail(String toEmail, String subject, String content, boolean plainText) throws Exception {
        Session session = Session.getInstance(new Properties(), null);
        MimeMessage email = new MimeMessage(session);
        
        email.setFrom(new InternetAddress(gmailConfig.getFromEmail(), gmailConfig.getFromName()));
        email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(toEmail));
        email.setSubject(subject);
        
        if (plainText) {
            email.setText(content, "UTF-8");
        } else {
            email.setContent(content, "text/html; charset=UTF-8");
        }
        
        return email;
    }

    public String getAuthorizationUrl() throws Exception {
        NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
        
        com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets.Details details = 
            new com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets.Details();
        details.setClientId(gmailConfig.getClientId());
        details.setClientSecret(gmailConfig.getClientSecret());
        
        com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets clientSecrets = 
            new com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets();
        clientSecrets.setInstalled(details);
        
        com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow flow = 
            new com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow.Builder(
                transport, JSON_FACTORY, clientSecrets, 
                java.util.Collections.singletonList(com.google.api.services.gmail.GmailScopes.GMAIL_SEND))
                .setAccessType("offline")
                .setApprovalPrompt("force")
                .build();
        
        return flow.newAuthorizationUrl()
                .setRedirectUri("urn:ietf:wg:oauth:2.0:oob")
                .build();
    }

    private static class CalendarDataSource implements DataSource {
        private final String icsContent;

        public CalendarDataSource(String icsContent) {
            this.icsContent = icsContent;
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new ByteArrayInputStream(icsContent.getBytes("UTF-8"));
        }

        @Override
        public String getContentType() {
            return "text/calendar";
        }

        @Override
        public String getName() {
            return "invite.ics";
        }

        @Override
        public java.io.OutputStream getOutputStream() throws IOException {
            throw new IOException("Read-only data source");
        }
    }
}
