package com.detailing.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "email.deliverability")
public class EmailDeliverabilityConfig {
    
    private boolean useHtmlEmails = true;
    private boolean enableSpamHeaders = true;
    private String organizationName = "Earned Shine Detailing";
    private String supportEmail;
    private boolean enableUnsubscribeHeader = false;
    private int emailPriority = 3; 
    private boolean includeCalendarInvite = true;
    private String calendarInviteTimezone = "America/New_York"; 
    private boolean sendAdminNotifications = true;
    
    public boolean isUseHtmlEmails() {
        return useHtmlEmails;
    }

    public void setUseHtmlEmails(boolean useHtmlEmails) {
        this.useHtmlEmails = useHtmlEmails;
    }

    public boolean isEnableSpamHeaders() {
        return enableSpamHeaders;
    }

    public void setEnableSpamHeaders(boolean enableSpamHeaders) {
        this.enableSpamHeaders = enableSpamHeaders;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public void setSupportEmail(String supportEmail) {
        this.supportEmail = supportEmail;
    }

    public boolean isEnableUnsubscribeHeader() {
        return enableUnsubscribeHeader;
    }

    public void setEnableUnsubscribeHeader(boolean enableUnsubscribeHeader) {
        this.enableUnsubscribeHeader = enableUnsubscribeHeader;
    }

    public int getEmailPriority() {
        return emailPriority;
    }

    public void setEmailPriority(int emailPriority) {
        this.emailPriority = emailPriority;
    }

    public boolean isIncludeCalendarInvite() {
        return includeCalendarInvite;
    }

    public void setIncludeCalendarInvite(boolean includeCalendarInvite) {
        this.includeCalendarInvite = includeCalendarInvite;
    }

    public String getCalendarInviteTimezone() {
        return calendarInviteTimezone;
    }

    public void setCalendarInviteTimezone(String calendarInviteTimezone) {
        this.calendarInviteTimezone = calendarInviteTimezone;
    }

    public boolean isSendAdminNotifications() {
        return sendAdminNotifications;
    }

    public void setSendAdminNotifications(boolean sendAdminNotifications) {
        this.sendAdminNotifications = sendAdminNotifications;
    }
} 
