package com.budgettracker.service;

import com.budgettracker.dto.BankAccountRequest;
import com.budgettracker.dto.BankAccountResponse;
import com.budgettracker.model.BankAccount;
import com.budgettracker.model.BankConnection;
import com.budgettracker.model.Transaction;
import com.budgettracker.model.User;
import com.budgettracker.repository.BankAccountRepository;
import com.budgettracker.repository.BankConnectionRepository;
import com.budgettracker.repository.TransactionRepository;
import com.budgettracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class BankIntegrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(BankIntegrationService.class);
    
    @Autowired
    private BankAccountRepository bankAccountRepository;
    
    @Autowired
    private BankConnectionRepository bankConnectionRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private final Random random = new Random();
    
    /**
     * Get all bank accounts for a user
     */
    public List<BankAccountResponse> getUserBankAccounts(Long userId) {
        logger.debug("Fetching bank accounts for user: {}", userId);
        
        return bankAccountRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(BankAccountResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Add a new bank account (simplified - in production this would use Plaid Link)
     */
    public BankAccountResponse addBankAccount(Long userId, BankAccountRequest request) {
        logger.info("Adding bank account for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        // Create bank account
        BankAccount bankAccount = new BankAccount();
        bankAccount.setUser(user);
        bankAccount.setAccountName(request.getAccountName());
        bankAccount.setBankName(request.getBankName());
        bankAccount.setAccountNumber(request.getAccountNumber());
        bankAccount.setAccountType(request.getAccountType());
        bankAccount.setCurrentBalance(request.getCurrentBalance() != null ? request.getCurrentBalance() : BigDecimal.ZERO);
        bankAccount.setAvailableBalance(request.getAvailableBalance() != null ? request.getAvailableBalance() : BigDecimal.ZERO);
        bankAccount.setCurrencyCode(request.getCurrencyCode());
        bankAccount.setConnectionStatus(BankAccount.ConnectionStatus.ACTIVE);
        bankAccount.setExternalAccountId("demo_" + System.currentTimeMillis());
        bankAccount.setInstitutionId("demo_institution");
        bankAccount.setLastSyncAt(LocalDateTime.now());
        
        BankAccount savedAccount = bankAccountRepository.save(bankAccount);
        
        // Create a demo bank connection if it doesn't exist
        createDemoBankConnection(user, request.getBankName());
        
        logger.info("Bank account added successfully: {}", savedAccount.getId());
        return BankAccountResponse.fromEntity(savedAccount);
    }
    
    /**
     * Update bank account balance
     */
    public BankAccountResponse updateAccountBalance(Long accountId, BigDecimal newBalance) {
        logger.debug("Updating balance for account: {}", accountId);
        
        BankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Bank account not found: " + accountId));
        
        account.setCurrentBalance(newBalance);
        account.setAvailableBalance(newBalance);
        account.setLastSyncAt(LocalDateTime.now());
        
        BankAccount updatedAccount = bankAccountRepository.save(account);
        return BankAccountResponse.fromEntity(updatedAccount);
    }
    
    /**
     * Sync account data (simplified demo version)
     */
    public void syncAccountData(Long accountId) {
        logger.debug("Syncing data for account: {}", accountId);
        
        BankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Bank account not found: " + accountId));
        
        // Simulate balance update
        BigDecimal currentBalance = account.getCurrentBalance();
        BigDecimal change = BigDecimal.valueOf((random.nextDouble() - 0.5) * 100); // Random change between -50 and +50
        BigDecimal newBalance = currentBalance.add(change);
        
        account.setCurrentBalance(newBalance);
        account.setAvailableBalance(newBalance);
        account.setLastSyncAt(LocalDateTime.now());
        
        bankAccountRepository.save(account);
        
        // Optionally create a demo transaction
        if (Math.abs(change.doubleValue()) > 10) {
            createDemoTransaction(account, change);
        }
        
        logger.debug("Account sync completed for: {}", accountId);
    }
    
    /**
     * Sync all active accounts for a user
     */
    public void syncAllUserAccounts(Long userId) {
        logger.debug("Syncing all accounts for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        List<BankAccount> activeAccounts = bankAccountRepository.findByUserAndConnectionStatusOrderByCreatedAtDesc(
                user, BankAccount.ConnectionStatus.ACTIVE);
        
        for (BankAccount account : activeAccounts) {
            try {
                syncAccountData(account.getId());
            } catch (Exception e) {
                logger.error("Failed to sync account {}: {}", account.getId(), e.getMessage());
                account.setConnectionStatus(BankAccount.ConnectionStatus.ERROR);
                bankAccountRepository.save(account);
            }
        }
        
        logger.info("Completed sync for {} accounts for user: {}", activeAccounts.size(), userId);
    }
    
    /**
     * Disconnect a bank account
     */
    public void disconnectBankAccount(Long accountId) {
        logger.info("Disconnecting bank account: {}", accountId);
        
        BankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Bank account not found: " + accountId));
        
        account.setConnectionStatus(BankAccount.ConnectionStatus.DISCONNECTED);
        bankAccountRepository.save(account);
        
        logger.info("Bank account disconnected: {}", accountId);
    }
    
    /**
     * Get account balance summary for a user
     */
    public BigDecimal getTotalAccountBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        return bankAccountRepository.getTotalBalanceForUser(user);
    }
    
    /**
     * Scheduled task to sync all accounts
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    public void scheduledAccountSync() {
        logger.info("Starting scheduled account sync");
        
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1);
        List<BankAccount> accountsNeedingSync = bankAccountRepository.findAccountsNeedingSync(cutoffTime);
        
        for (BankAccount account : accountsNeedingSync) {
            try {
                syncAccountData(account.getId());
            } catch (Exception e) {
                logger.error("Failed to sync account {} during scheduled sync: {}", account.getId(), e.getMessage());
            }
        }
        
        logger.info("Scheduled account sync completed for {} accounts", accountsNeedingSync.size());
    }
    
    /**
     * Create a demo bank connection
     */
    private void createDemoBankConnection(User user, String bankName) {
        String institutionId = "demo_" + bankName.toLowerCase().replaceAll("\\s+", "_");
        
        Optional<BankConnection> existingConnection = bankConnectionRepository.findByUserAndInstitutionId(user, institutionId);
        if (existingConnection.isPresent()) {
            return; // Connection already exists
        }
        
        BankConnection connection = new BankConnection();
        connection.setUser(user);
        connection.setInstitutionId(institutionId);
        connection.setInstitutionName(bankName);
        connection.setAccessToken("demo_access_token_" + System.currentTimeMillis());
        connection.setItemId("demo_item_" + System.currentTimeMillis());
        connection.setStatus(BankConnection.ConnectionStatus.ACTIVE);
        connection.setLastSuccessfulSync(LocalDateTime.now());
        connection.setConsentExpiration(LocalDateTime.now().plusMonths(6));
        
        bankConnectionRepository.save(connection);
    }
    
    /**
     * Create a demo transaction
     */
    private void createDemoTransaction(BankAccount account, BigDecimal amount) {
        Transaction transaction = new Transaction();
        transaction.setUser(account.getUser());
        transaction.setTitle(amount.compareTo(BigDecimal.ZERO) > 0 ? "Bank Deposit" : "Bank Withdrawal");
        transaction.setDescription("Automatic sync from " + account.getBankName());
        transaction.setAmount(amount.abs());
        transaction.setType(amount.compareTo(BigDecimal.ZERO) > 0 ? Transaction.TransactionType.INCOME : Transaction.TransactionType.EXPENSE);
        transaction.setCategory(amount.compareTo(BigDecimal.ZERO) > 0 ? "Income" : "Banking");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setCurrencyCode(account.getCurrencyCode());
        
        transactionRepository.save(transaction);
    }
}