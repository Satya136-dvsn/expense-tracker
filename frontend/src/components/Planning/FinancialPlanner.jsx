import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Common/Tabs';
import RetirementCalculator from './RetirementCalculator';
import DebtOptimizer from './DebtOptimizer';
import TaxPlanner from './TaxPlanner';
import UnifiedGoals from '../Goals/UnifiedGoals';
import './FinancialPlanner.css';

const FinancialPlanner = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [planningData, setPlanningData] = useState({
    retirement: null,
    debts: [],
    taxPlan: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanningData();
  }, []);

  const fetchPlanningData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch retirement data
      const retirementResponse = await fetch('/api/retirement/plan', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch debt data
      const debtsResponse = await fetch('/api/debts/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch tax plan data (most recent)
      const taxResponse = await fetch('/api/tax-planning/plan', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const retirement = retirementResponse.ok ? await retirementResponse.json() : null;
      const debts = debtsResponse.ok ? await debtsResponse.json() : [];
      const taxPlan = taxResponse.ok ? await taxResponse.json() : null;

      setPlanningData({ retirement, debts, taxPlan });
    } catch (error) {
      console.error('Error fetching planning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialHealthScore = () => {
    let score = 0;
    let factors = 0;

    // Retirement planning factor (0-40 points)
    if (planningData.retirement) {
      factors++;
      const monthlyContribution = (planningData.retirement.monthly401kContribution || 0) + 
                                 (planningData.retirement.monthlyIraContribution || 0);
      const monthlyIncome = planningData.retirement.currentAnnualIncome / 12;
      const savingsRate = monthlyContribution / monthlyIncome;
      
      if (savingsRate >= 0.15) score += 40;
      else if (savingsRate >= 0.10) score += 30;
      else if (savingsRate >= 0.05) score += 20;
      else score += 10;
    }

    // Debt management factor (0-30 points)
    if (planningData.debts.length > 0) {
      factors++;
      const totalDebt = planningData.debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
      const avgInterestRate = planningData.debts.reduce((sum, debt) => 
        sum + (debt.interestRate * debt.currentBalance), 0) / totalDebt;
      
      if (avgInterestRate < 0.05) score += 30;
      else if (avgInterestRate < 0.10) score += 20;
      else if (avgInterestRate < 0.15) score += 15;
      else score += 10;
    } else {
      factors++;
      score += 30; // No debt is good
    }

    // Tax planning factor (0-30 points)
    if (planningData.taxPlan) {
      factors++;
      const hasRetirementContributions = (planningData.taxPlan.traditional401kContribution || 0) > 0 ||
                                        (planningData.taxPlan.traditionalIraContribution || 0) > 0;
      const hasHSA = (planningData.taxPlan.hsaContribution || 0) > 0;
      const hasDeductions = (planningData.taxPlan.itemizedDeductions || 0) > 0;
      
      let taxScore = 10;
      if (hasRetirementContributions) taxScore += 10;
      if (hasHSA) taxScore += 5;
      if (hasDeductions) taxScore += 5;
      
      score += taxScore;
    }

    return factors > 0 ? Math.round(score / factors * 100 / 100) : 0;
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="financial-planner">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your financial plan...</p>
        </div>
      </div>
    );
  }

  const healthScore = calculateFinancialHealthScore();

  return (
    <div className="financial-planner">
      <div className="planner-header">
        <h1>Financial Planner</h1>
        <p>Comprehensive financial planning and optimization tools</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="planner-tabs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals & Savings</TabsTrigger>
          <TabsTrigger value="retirement">Retirement</TabsTrigger>
          <TabsTrigger value="debt">Debt Optimization</TabsTrigger>
          <TabsTrigger value="tax">Tax Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="overview-tab">
          <div className="overview-grid">
            {/* Financial Health Score */}
            <Card className="health-score-card">
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="health-score">
                  <div className={`score-value ${getHealthScoreColor(healthScore)}`}>
                    {healthScore}
                  </div>
                  <div className="score-label">
                    {getHealthScoreLabel(healthScore)}
                  </div>
                  <div className="score-breakdown">
                    <div className="score-factor">
                      <span>Retirement Planning</span>
                      <span className={planningData.retirement ? 'text-green-600' : 'text-red-600'}>
                        {planningData.retirement ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="score-factor">
                      <span>Debt Management</span>
                      <span className={planningData.debts.length === 0 ? 'text-green-600' : 'text-yellow-600'}>
                        {planningData.debts.length === 0 ? '✓' : `${planningData.debts.length} debts`}
                      </span>
                    </div>
                    <div className="score-factor">
                      <span>Tax Optimization</span>
                      <span className={planningData.taxPlan ? 'text-green-600' : 'text-red-600'}>
                        {planningData.taxPlan ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retirement Overview */}
            <Card className="retirement-overview-card">
              <CardHeader>
                <CardTitle>Retirement Planning</CardTitle>
              </CardHeader>
              <CardContent>
                {planningData.retirement ? (
                  <div className="retirement-summary">
                    <div className="summary-item">
                      <span>Current Age</span>
                      <span>{planningData.retirement.currentAge}</span>
                    </div>
                    <div className="summary-item">
                      <span>Retirement Age</span>
                      <span>{planningData.retirement.retirementAge}</span>
                    </div>
                    <div className="summary-item">
                      <span>Years to Retirement</span>
                      <span>{planningData.retirement.retirementAge - planningData.retirement.currentAge}</span>
                    </div>
                    <div className="summary-item">
                      <span>Monthly Savings</span>
                      <span>${((planningData.retirement.monthly401kContribution || 0) + 
                               (planningData.retirement.monthlyIraContribution || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>No retirement plan configured</p>
                    <Button onClick={() => setActiveTab('retirement')}>
                      Create Retirement Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debt Overview */}
            <Card className="debt-overview-card">
              <CardHeader>
                <CardTitle>Debt Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {planningData.debts.length > 0 ? (
                  <div className="debt-summary">
                    <div className="summary-item">
                      <span>Total Debt</span>
                      <span>${planningData.debts.reduce((sum, debt) => sum + debt.currentBalance, 0).toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                      <span>Number of Debts</span>
                      <span>{planningData.debts.length}</span>
                    </div>
                    <div className="summary-item">
                      <span>Average Interest Rate</span>
                      <span>
                        {planningData.debts.length > 0 ? 
                          (planningData.debts.reduce((sum, debt) => sum + debt.interestRate, 0) / planningData.debts.length * 100).toFixed(2) + '%' : 
                          '0%'}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span>Monthly Payments</span>
                      <span>${planningData.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>No active debts</p>
                    <div className="debt-free-badge">Debt Free! 🎉</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Planning Overview */}
            <Card className="tax-overview-card">
              <CardHeader>
                <CardTitle>Tax Planning</CardTitle>
              </CardHeader>
              <CardContent>
                {planningData.taxPlan ? (
                  <div className="tax-summary">
                    <div className="summary-item">
                      <span>Tax Year</span>
                      <span>{planningData.taxPlan.taxYear}</span>
                    </div>
                    <div className="summary-item">
                      <span>Filing Status</span>
                      <span>{planningData.taxPlan.filingStatus.replace('_', ' ')}</span>
                    </div>
                    <div className="summary-item">
                      <span>Annual Income</span>
                      <span>${planningData.taxPlan.annualIncome?.toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                      <span>Retirement Contributions</span>
                      <span>
                        ${((planningData.taxPlan.traditional401kContribution || 0) + 
                           (planningData.taxPlan.traditionalIraContribution || 0) + 
                           (planningData.taxPlan.hsaContribution || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>No tax plan configured</p>
                    <Button onClick={() => setActiveTab('tax')}>
                      Create Tax Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="quick-actions-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="quick-actions">
                <Button 
                  onClick={() => setActiveTab('retirement')}
                  className="action-button"
                >
                  Plan Retirement
                </Button>
                <Button 
                  onClick={() => setActiveTab('debt')}
                  className="action-button"
                >
                  Optimize Debts
                </Button>
                <Button 
                  onClick={() => setActiveTab('tax')}
                  className="action-button"
                >
                  Tax Planning
                </Button>
                <Button 
                  onClick={fetchPlanningData}
                  className="action-button secondary"
                >
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <UnifiedGoals />
        </TabsContent>

        <TabsContent value="retirement">
          <RetirementCalculator />
        </TabsContent>

        <TabsContent value="debt">
          <DebtOptimizer />
        </TabsContent>

        <TabsContent value="tax">
          <TaxPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialPlanner;