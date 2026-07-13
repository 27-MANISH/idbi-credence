from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List, Optional
from uuid import uuid4, UUID
from datetime import datetime, timezone

from app.models.schemas import OnboardingSubmitRequest, LoanOut, LoanUpdate
from app.db.supabase_client import supabase_client
from app.routers.auth import get_current_user

router = APIRouter(prefix="/loans", tags=["Loans"])

@router.post("/onboard", response_model=dict)
async def onboard_msme(req: OnboardingSubmitRequest):
    """
    DPDP-compliant onboarding flow. Saves profile, records consents, creates a pending loan application.
    """
    try:
        # 1. Create or retrieve Profile
        existing = supabase_client.table("profiles").select("*").eq("gstin", req.profile.gstin).execute()
        if existing.data:
            profile = existing.data[0]
            profile_id = profile["id"]
            # Update status if needed
            supabase_client.table("profiles").update({"status": "pending"}).eq("id", profile_id).execute()
        else:
            profile_payload = {
                "gstin": req.profile.gstin,
                "name": req.profile.name,
                "type": req.profile.type,
                "years": req.profile.years,
                "location": req.profile.location,
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            p_res = supabase_client.table("profiles").insert(profile_payload).execute()
            if not p_res.data:
                raise HTTPException(status_code=500, detail="Failed to create profile")
            profile = p_res.data[0]
            profile_id = profile["id"]

        # 2. Record Consents
        consent_payload = {
            "profile_id": profile_id,
            "gst_consent": req.consent.gst_consent,
            "upi_consent": req.consent.upi_consent,
            "aa_consent": req.consent.aa_consent,
            "epfo_consent": req.consent.epfo_consent,
            "consented_at": datetime.now(timezone.utc).isoformat()
        }
        c_res = supabase_client.table("consents").insert(consent_payload).execute()
        if not c_res.data:
            raise HTTPException(status_code=500, detail="Failed to record consents")
        consent = c_res.data[0]

        # 3. Create Loan Application
        app_id = f"APP-{uuid4().hex[:8].upper()}"
        loan_payload = {
            "profile_id": profile_id,
            "application_id": app_id,
            "loan_type": req.loan.loan_type,
            "amount": req.loan.amount,
            "tenure": req.loan.tenure,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        l_res = supabase_client.table("loans").insert(loan_payload).execute()
        if not l_res.data:
            raise HTTPException(status_code=500, detail="Failed to create loan application")
        loan = l_res.data[0]

        # 4. Write Audit Log
        audit_payload = {
            "entity_type": "loan",
            "entity_id": loan["id"],
            "action": "onboarded",
            "details": {
                "message": "MSME Onboarded & Consent Gathered",
                "gstin": req.profile.gstin,
                "loan_type": req.loan.loan_type,
                "amount": req.loan.amount
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        supabase_client.table("audits").insert(audit_payload).execute()

        return {
            "success": True,
            "profile_id": profile_id,
            "application_id": app_id,
            "loan_id": loan["id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Onboarding failed: {str(e)}")

@router.get("/queue")
async def get_underwriting_queue(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Get all loan applications with their borrower profile and scores (for credit officer dashboard).
    """
    try:
        # Query loans with profiles joined
        loans_res = supabase_client.table("loans").select("*, profiles(*)").execute()
        if not loans_res.data:
            return []
            
        enriched_queue = []
        for loan in loans_res.data:
            profile_id = loan["profile_id"]
            # Fetch score if exists
            score_res = supabase_client.table("scores").select("*").eq("profile_id", profile_id).order("computed_at", desc=True).limit(1).execute()
            score = score_res.data[0] if score_res.data else None
            
            # Fetch consent if exists
            consent_res = supabase_client.table("consents").select("*").eq("profile_id", profile_id).order("consented_at", desc=True).limit(1).execute()
            consent = consent_res.data[0] if consent_res.data else None
            
            enriched_queue.append({
                "loan": loan,
                "profile": loan.get("profiles"),
                "score": score,
                "consent": consent
            })
            
        return enriched_queue
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch queue: {str(e)}")

@router.get("/{loan_id}")
async def get_loan_details(loan_id: UUID, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Get details of a specific loan application, its profile, consent, and scores.
    """
    try:
        loan_res = supabase_client.table("loans").select("*, profiles(*)").eq("id", str(loan_id)).execute()
        if not loan_res.data:
            raise HTTPException(status_code=404, detail="Loan application not found")
        loan = loan_res.data[0]
        profile_id = loan["profile_id"]
        
        # Fetch score
        score_res = supabase_client.table("scores").select("*").eq("profile_id", profile_id).order("computed_at", desc=True).limit(1).execute()
        score = score_res.data[0] if score_res.data else None
        
        # Fetch consent
        consent_res = supabase_client.table("consents").select("*").eq("profile_id", profile_id).order("consented_at", desc=True).limit(1).execute()
        consent = consent_res.data[0] if consent_res.data else None
        
        # Fetch audits
        audit_res = supabase_client.table("audits").select("*").eq("entity_id", str(loan_id)).order("created_at", desc=True).execute()
        
        return {
            "loan": loan,
            "profile": loan.get("profiles"),
            "score": score,
            "consent": consent,
            "audits": audit_res.data or []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch loan details: {str(e)}")

@router.post("/{loan_id}/decision")
async def update_loan_decision(
    loan_id: UUID, 
    decision: LoanUpdate, 
    current_user: Annotated[dict, Depends(get_current_user)]
):
    """
    Approve or Reject a loan application (credit officer actions).
    """
    try:
        # Check loan exists
        existing = supabase_client.table("loans").select("*").eq("id", str(loan_id)).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Loan application not found")
        
        loan = existing.data[0]
        
        # Compute interest rate based on score if approved
        interest_rate = None
        if decision.status == "APPROVED":
            # Fetch score
            score_res = supabase_client.table("scores").select("overall_score").eq("profile_id", loan["profile_id"]).order("computed_at", desc=True).limit(1).execute()
            if score_res.data:
                score = score_res.data[0]["overall_score"]
                # Rule-based interest rate pricing
                if score >= 800:
                    interest_rate = "9.5%"
                elif score >= 750:
                    interest_rate = "10.5%"
                elif score >= 700:
                    interest_rate = "12.0%"
                elif score >= 650:
                    interest_rate = "14.0%"
                else:
                    interest_rate = "16.5%"
            else:
                interest_rate = "14.0%" # Default baseline if no score
        
        # Update loan
        update_payload = {
            "status": decision.status,
            "decided_by": current_user["id"],
            "decided_at": datetime.now(timezone.utc).isoformat(),
        }
        if interest_rate:
            update_payload["interest_rate"] = interest_rate
            
        l_res = supabase_client.table("loans").update(update_payload).eq("id", str(loan_id)).execute()
        if not l_res.data:
            raise HTTPException(status_code=500, detail="Failed to update loan status")
            
        # Update profile status to match
        profile_status = "approved" if decision.status == "APPROVED" else "rejected"
        supabase_client.table("profiles").update({"status": profile_status}).eq("id", loan["profile_id"]).execute()
            
        # Log Audit
        audit_payload = {
            "entity_type": "loan",
            "entity_id": str(loan_id),
            "action": decision.status.lower(),
            "actor_id": current_user["id"],
            "details": {
                "message": f"Loan {decision.status.lower()} by credit officer {current_user['name']}",
                "interest_rate": interest_rate
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        supabase_client.table("audits").insert(audit_payload).execute()
        
        return {
            "success": True,
            "status": decision.status,
            "interest_rate": interest_rate,
            "loan": l_res.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update loan decision: {str(e)}")
