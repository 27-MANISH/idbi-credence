from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, loans, score

app = FastAPI(
    title="FinHealth API",
    description="Backend Scoring Orchestrator and Loan Origination API for FinHealth",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production to restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(loans.router, prefix="/api/v1")
app.include_router(score.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "FinHealth API",
        "description": "Backend Scoring Orchestrator and Loan Origination Engine"
    }
