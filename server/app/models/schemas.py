from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "CREDIT_OFFICER"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserOut(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Profile schemas (MSME borrower profile)
class ProfileBase(BaseModel):
    gstin: str = Field(..., description="GST Identification Number of the MSME")
    name: str = Field(..., description="Legal name of the business")
    type: str = Field(..., description="Constitution type e.g., Sole Proprietorship, Partnership, Pvt Ltd")
    years: Optional[int] = Field(None, description="Number of years in operation")
    location: Optional[str] = Field(None, description="Business operating address/state")
    status: Optional[str] = "pending"

class ProfileCreate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Consent schemas (DPDP-compliant consent flags)
class ConsentBase(BaseModel):
    gst_consent: bool = False
    upi_consent: bool = False
    aa_consent: bool = False
    epfo_consent: bool = False

class ConsentCreate(ConsentBase):
    profile_id: UUID

class ConsentOut(ConsentBase):
    id: UUID
    profile_id: UUID
    consented_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ULI/OCEN-compatible Loan application schemas
class LoanBase(BaseModel):
    loan_type: str = Field(..., description="Type of loan (e.g. WORKING_CAPITAL, TERM_LOAN, INVOICE_DISCOUNTING)")
    amount: int = Field(..., description="Requested loan amount in INR")
    tenure: int = Field(..., description="Requested loan tenure in months")

class LoanCreate(LoanBase):
    profile_id: UUID
    application_id: str = Field(..., description="Unique application ID (OCEN standard format)")

class LoanUpdate(BaseModel):
    status: str = Field(..., description="APPROVED, REJECTED, PENDING")
    decided_by: Optional[str] = None

class LoanOut(LoanBase):
    id: UUID
    profile_id: UUID
    application_id: str
    interest_rate: Optional[str] = None
    status: str
    decided_by: Optional[str] = None
    decided_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Unified Scoring schemas
class ScoreBase(BaseModel):
    overall_score: int
    grade: str
    risk_band: str
    gst_score: int
    upi_score: int
    aa_score: int
    epfo_score: int
    signals: Dict[str, Any]
    explanation: Optional[str] = None

class ScoreOut(ScoreBase):
    id: UUID
    profile_id: UUID
    computed_at: datetime

    class Config:
        from_attributes = True

# Audit log schemas
class AuditCreate(BaseModel):
    entity_type: str
    entity_id: UUID
    action: str
    details: Dict[str, Any]
    actor_id: Optional[UUID] = None

class AuditOut(BaseModel):
    id: UUID
    entity_type: str
    entity_id: UUID
    action: str
    actor_id: Optional[UUID] = None
    details: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# Complete application flow request (combines Profile + Consents + Loan details for Onboarding wizard)
class OnboardingSubmitRequest(BaseModel):
    profile: ProfileCreate
    consent: ConsentBase
    loan: LoanBase

# Phase 2 score computation & explainability
class ScoreComputeRequest(BaseModel):
    profile_id: UUID
    consent_id: Optional[UUID] = None

class ScoreExplainFeature(BaseModel):
    name: str
    raw_value: float
    weight: float
    contribution: float
    impact: str  # "positive" | "negative" | "neutral"

class ScoreExplainResponse(BaseModel):
    features: List[ScoreExplainFeature]
    recommendations: List[str]
    strengths: List[str]
    weaknesses: List[str]
    risk_report: str

