import './TransactionSummary.css';

const TransactionSummary = ({ transactions, filteredTransactions, filterType, filterCategory, searchQuery }) => {
    const formatCurrency = (amount) => {
        return '₹' + new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Calculate totals from ALL transactions (not filtered)
    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate filtered totals for display context
    const filteredIncome = filteredTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

    const filteredExpenses = filteredTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

    const hasFilters = filterType !== 'ALL' || filterCategory || searchQuery;

    return (
        <div className="summary-cards">
            <div className="summary-card income">
                <div className="card-icon">📥</div>
                <div className="card-content">
                    <div className="card-label">Total Income</div>
                    <div className="card-value">{formatCurrency(totalIncome)}</div>
                    {totalIncome === 0 && (
                        <div className="card-note" style={{ color: '#f59e0b', fontWeight: '500' }}>
                            💡 Add income transactions to track actual income
                        </div>
                    )}
                    {hasFilters && (
                        <div className="card-note">Filtered: {formatCurrency(filteredIncome)}</div>
                    )}
                </div>
            </div>

            <div className="summary-card expense">
                <div className="card-icon">📤</div>
                <div className="card-content">
                    <div className="card-label">Total Expenses</div>
                    <div className="card-value">{formatCurrency(totalExpenses)}</div>
                    {hasFilters && (
                        <div className="card-note">Filtered: {formatCurrency(filteredExpenses)}</div>
                    )}
                </div>
            </div>

            <div className="summary-card balance">
                <div className="card-icon">💰</div>
                <div className="card-content">
                    <div className="card-label">Net Balance</div>
                    <div className="card-value">{formatCurrency(totalIncome - totalExpenses)}</div>
                    {hasFilters && (
                        <div className="card-note">Filtered: {formatCurrency(filteredIncome - filteredExpenses)}</div>
                    )}
                </div>
            </div>

            <div className="summary-card count">
                <div className="card-icon">📊</div>
                <div className="card-content">
                    <div className="card-label">Transactions</div>
                    <div className="card-value">{filteredTransactions.length}</div>
                    {hasFilters && (
                        <div className="card-note">Total: {transactions.length}</div>
                    )}
                </div>
            </div>

            {totalIncome === 0 && transactions.length === 0 && (
                <div className="getting-started-card">
                    <div className="card-icon">🚀</div>
                    <div className="card-content">
                        <div className="card-label">Getting Started</div>
                        <div className="card-note" style={{ color: '#3b82f6', fontSize: '0.85rem', lineHeight: '1.4' }}>
                            Start by adding your first income transaction (salary, freelance, etc.)
                            to see your actual financial data sync across the entire app.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionSummary;