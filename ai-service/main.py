from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from database import engine, Base
from routers import insights, predictions, anomalies
from config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="BudgetWise AI Insights Service",
    description="AI-powered financial insights and recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(insights.router, prefix="/api/ai/insights", tags=["insights"])
app.include_router(predictions.router, prefix="/api/ai/predictions", tags=["predictions"])
app.include_router(anomalies.router, prefix="/api/ai/anomalies", tags=["anomalies"])

@app.get("/")
async def root():
    return {"message": "BudgetWise AI Insights Service", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)