package com.budgettracker.service;

import com.budgettracker.model.Bill;
import com.budgettracker.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillReminderScheduler {
    
    @Autowired
    private BillRepository billRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Check for bills that need reminders and create notifications
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    public void checkBillReminders() {
        LocalDate today = LocalDate.now();
        
        // Get all active bills
        List<Bill> allBills = billRepository.findAll().stream()
            .filter(bill -> bill.getStatus() == Bill.BillStatus.ACTIVE)
            .collect(Collectors.toList());
        
        for (Bill bill : allBills) {
            if (bill.getStatus() != Bill.BillStatus.ACTIVE || bill.getNextDueDate() == null) {
                continue;
            }
            
            int daysUntilDue = (int) ChronoUnit.DAYS.between(today, bill.getNextDueDate());
            
            // Check if bill needs a reminder
            if (bill.getReminderDaysBefore() != null && daysUntilDue == bill.getReminderDaysBefore() && daysUntilDue > 0) {
                // Create reminder notification
                notificationService.createBillReminder(bill.getUserId(), bill, daysUntilDue);
            }
            
            // Check if bill is due today
            if (daysUntilDue == 0) {
                // Create due today notification
                notificationService.createBillReminder(bill.getUserId(), bill, 0);
            }
            
            // Check if bill is overdue
            if (daysUntilDue < 0) {
                int daysOverdue = Math.abs(daysUntilDue);
                
                // Update bill status to overdue
                if (bill.getStatus() != Bill.BillStatus.OVERDUE) {
                    bill.setStatus(Bill.BillStatus.OVERDUE);
                    billRepository.save(bill);
                }
                
                // Create overdue notification (only on first day overdue to avoid spam)
                if (daysOverdue == 1) {
                    notificationService.createOverdueBillNotification(bill.getUserId(), bill, daysOverdue);
                }
                
                // Send weekly reminders for overdue bills
                if (daysOverdue % 7 == 0) {
                    notificationService.createOverdueBillNotification(bill.getUserId(), bill, daysOverdue);
                }
            }
        }
    }
    
    /**
     * Send daily digest emails
     * Runs every day at 8 AM
     */
    @Scheduled(cron = "0 0 8 * * ?")
    public void sendDailyDigests() {
        // This would be implemented to send daily digest emails
        // For now, we'll just log that it would run
        System.out.println("Daily digest scheduler would run at: " + LocalDate.now());
    }
    
    /**
     * Clean up completed one-time bills
     * Runs daily at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupCompletedBills() {
        LocalDate cutoffDate = LocalDate.now().minusDays(30);
        
        // Find one-time bills that are paid off and older than 30 days
        List<Bill> completedBills = billRepository.findAll().stream()
            .filter(bill -> bill.getFrequency() == Bill.BillFrequency.ONE_TIME)
            .filter(bill -> bill.getStatus() == Bill.BillStatus.PAID_OFF)
            .filter(bill -> bill.getDueDate().isBefore(cutoffDate))
            .toList();
        
        // Archive or delete these bills (for now just log)
        if (!completedBills.isEmpty()) {
            System.out.println("Would archive " + completedBills.size() + " completed one-time bills");
        }
    }
}