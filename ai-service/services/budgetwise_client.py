import httpx
from typing import Dict, List, Optional, Any
from config import settings
import logging

logger = logging.getLogger(__name__)

class BudgetWiseClient:
    """Client for communicating with the main BudgetWise API"""
    
    def __init__(self):
        self.base_url = settings.budgetwise_api_url
        self.timeout = 30.0
    
    async def get_user_financial_data(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Fetch comprehensive financial data for a user"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Get user profile
                profile_response = await client.get(f"{self.base_url}/users/{user_id}")
                if profile_response.status_code != 200:
                    return None
                
                # Get transactions (last 6 months)
                transactions_response = await client.get(
                    f"{self.base_url}/transactions/user/{user_id}",
                    params={"months": 6}
                )
                
                # Get budgets
                budgets_response = await client.get(f"{self.base_url}/budgets/user/{user_id}")
                
                # Get goals
                goals_response = await client.get(f"{self.base_url}/goals/user/{user_id}")
                
                return {
                    "profile": profile_response.json() if profile_response.status_code == 200 else None,
                    "transactions": transactions_response.json() if transactions_response.status_code == 200 else [],
                    "budgets": budgets_response.json() if budgets_response.status_code == 200 else [],
                    "goals": goals_response.json() if goals_response.status_code == 200 else []
                }
        except Exception as e:
            logger.error(f"Error fetching user financial data: {e}")
            return None
    
    async def get_user_transactions(self, user_id: int, months: int = 3, days: int = None) -> Optional[List[Dict]]:
        """Fetch user transactions for a specific period"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                params = {}
                if months:
                    params["months"] = months
                if days:
                    params["days"] = days
                
                response = await client.get(
                    f"{self.base_url}/transactions/user/{user_id}",
                    params=params
                )
                
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching user transactions: {e}")
            return None
    
    async def get_user_budgets(self, user_id: int) -> Optional[List[Dict]]:
        """Fetch user budgets"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/budgets/user/{user_id}")
                
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching user budgets: {e}")
            return None
    
    async def get_user_analytics(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Fetch user analytics data"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/analytics/user/{user_id}")
                
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching user analytics: {e}")
            return None