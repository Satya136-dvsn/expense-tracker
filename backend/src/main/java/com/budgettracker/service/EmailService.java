package com.budgettracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Value("${app.email.from:noreply@budgetwise.com}")
    private String fromEmail;
    
    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;
    
    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;
    
    /**
     * Send a simple notification email
     */
    public void sendNotificationEmail(String toEmail, String subject, String message, String actionUrl) {
        if (!emailEnabled || mailSender == null) {
            System.out.println("Email disabled or not configured - would send: " + subject + " to " + toEmail);
            return;
        }
        
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            
            String htmlContent = buildNotificationEmailTemplate(subject, message, actionUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email notification", e);
        }
    }
    
    /**
     * Send bill reminder email
     */
    public void sendBillReminderEmail(String toEmail, String billName, String amount, 
                                    String dueDate, int daysUntilDue, String actionUrl) {
        String subject = "Bill Reminder: " + billName;
        String message = String.format(
            "Your %s bill of %s is due in %d day%s (%s). Don't forget to pay on time to avoid late fees.",
            billName, amount, daysUntilDue, daysUntilDue == 1 ? "" : "s", dueDate
        );
        
        sendNotificationEmail(toEmail, subject, message, actionUrl);
    }
    
    /**
     * Send overdue bill email
     */
    public void sendOverdueBillEmail(String toEmail, String billName, String amount, 
                                   int daysOverdue, String actionUrl) {
        String subject = "URGENT: Overdue Bill - " + billName;
        String message = String.format(
            "Your %s bill of %s is %d day%s overdue! Please pay immediately to avoid additional late fees and potential service interruption.",
            billName, amount, daysOverdue, daysOverdue == 1 ? "" : "s"
        );
        
        sendNotificationEmail(toEmail, subject, message, actionUrl);
    }
    
    /**
     * Send payment confirmation email
     */
    public void sendPaymentConfirmationEmail(String toEmail, String billName, String amount, 
                                           String confirmationNumber, String actionUrl) {
        String subject = "Payment Confirmed: " + billName;
        String message = String.format(
            "Your payment of %s for %s has been successfully processed. Confirmation Number: %s. Thank you for your payment!",
            amount, billName, confirmationNumber != null ? confirmationNumber : "N/A"
        );
        
        sendNotificationEmail(toEmail, subject, message, actionUrl);
    }
    
    /**
     * Send daily digest email
     */
    public void sendDailyDigestEmail(String toEmail, String userName, int upcomingBills, 
                                   int overdueBills, String totalAmount) {
        String subject = "BudgetWise Daily Digest";
        String message = String.format(
            "Good morning %s! Here's your daily financial summary:\n\n" +
            "• %d bill%s coming up\n" +
            "• %d overdue bill%s\n" +
            "• Total upcoming payments: %s\n\n" +
            "Stay on top of your finances with BudgetWise!",
            userName,
            upcomingBills, upcomingBills == 1 ? "" : "s",
            overdueBills, overdueBills == 1 ? "" : "s",
            totalAmount
        );
        
        sendNotificationEmail(toEmail, subject, message, baseUrl + "/bills");
    }
    
    /**
     * Send welcome email to new users
     */
    public void sendWelcomeEmail(String toEmail, String userName) {
        String subject = "Welcome to BudgetWise!";
        String message = String.format(
            "Welcome to BudgetWise, %s!\n\n" +
            "We're excited to help you take control of your finances. Here are some things you can do:\n\n" +
            "• Set up your bills and get automatic reminders\n" +
            "• Track your spending and create budgets\n" +
            "• Set savings goals and monitor your progress\n" +
            "• Get AI-powered financial insights\n\n" +
            "Get started by setting up your first bill or budget!",
            userName
        );
        
        sendNotificationEmail(toEmail, subject, message, baseUrl + "/dashboard");
    }
    
    /**
     * Build HTML email template
     */
    private String buildNotificationEmailTemplate(String subject, String message, String actionUrl) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>").append(subject).append("</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }");
        html.append(".content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }");
        html.append(".button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
        html.append(".footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        
        html.append("<div class='header'>");
        html.append("<h1>BudgetWise</h1>");
        html.append("</div>");
        
        html.append("<div class='content'>");
        html.append("<h2>").append(subject).append("</h2>");
        html.append("<p>").append(message.replace("\n", "<br>")).append("</p>");
        
        if (actionUrl != null && !actionUrl.isEmpty()) {
            String fullUrl = actionUrl.startsWith("http") ? actionUrl : baseUrl + actionUrl;
            html.append("<a href='").append(fullUrl).append("' class='button'>Take Action</a>");
        }
        
        html.append("</div>");
        
        html.append("<div class='footer'>");
        html.append("<p>This email was sent by BudgetWise at ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"))).append("</p>");
        html.append("<p>If you no longer wish to receive these emails, you can update your notification preferences in your account settings.</p>");
        html.append("</div>");
        
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    
    /**
     * Send simple text email (fallback)
     */
    public void sendSimpleEmail(String toEmail, String subject, String message) {
        if (!emailEnabled || mailSender == null) {
            System.out.println("Email disabled or not configured - would send: " + subject + " to " + toEmail);
            return;
        }
        
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            
            mailSender.send(mailMessage);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to send simple email", e);
        }
    }
}