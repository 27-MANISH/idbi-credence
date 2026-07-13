import json
import logging
from typing import Annotated, Optional
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status

from app.models.schemas import ScoreComputeRequest, ScoreExplainResponse
from app.db.supabase_client import supabase_client
from app.routers.auth import get_current_user
from app.agents import scoring_flow

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/score", tags=["Scoring"])

@router.post("/compute", response_model=ScoreExplainResponse)
async def compute_score(
    req: ScoreComputeRequest,
    current_user: Annotated[Optional[dict], Depends(get_current_user)] = None
):
    """
    Compute FinHealth score for an MSME profile. Triggers the LangGraph orchestrator
    which executes agent nodes, applies guardrails, and calls Gemini for explanation.
    Saves the computed score in Supabase and writes an audit log.
    """
    try:
        # 1. Fetch Profile
        profile_res = supabase_client.table("profiles").select("*").eq("id", str(req.profile_id)).execute()
        if not profile_res.data:
            raise HTTPException(status_code=404, detail="MSME profile not found")
        profile = profile_res.data[0]

        # 2. Fetch Consent
        consent = None
        if req.consent_id:
            consent_res = supabase_client.table("consents").select("*").eq("id", str(req.consent_id)).execute()
            if consent_res.data:
                consent = consent_res.data[0]
        else:
            # Fallback to the latest consent for this profile
            consent_res = (
                supabase_client.table("consents")
                .select("*")
                .eq("profile_id", str(req.profile_id))
                .order("consented_at", desc=True)
                .limit(1)
                .execute()
            )
            if consent_res.data:
                consent = consent_res.data[0]

        # 3. Initialize AgentState
        state_input = {
            "profile_id": str(profile["id"]),
            "consent_id": str(consent["id"]) if consent else None,
            "gstin": profile["gstin"],
            "business_name": profile["name"],
            "business_type": profile["type"],
            "years_in_business": profile["years"] or 0,
            "location": profile["location"] or "Unknown",
            "gst_consent": consent["gst_consent"] if consent else False,
            "upi_consent": consent["upi_consent"] if consent else False,
            "aa_consent": consent["aa_consent"] if consent else False,
            "epfo_consent": consent["epfo_consent"] if consent else False,
            "gst_data": {},
            "upi_data": {},
            "aa_data": {},
            "epfo_data": {},
            "gst_score": 0,
            "upi_score": 0,
            "aa_score": 0,
            "epfo_score": 0,
            "overall_score": 300,
            "grade": "D",
            "risk_band": "High",
            "signals": [],
            "explanation": {}
        }

        # 4. Invoke LangGraph Scoring flow
        logger.info(f"Invoking scoring flow for profile: {profile['id']}")
        result_state = scoring_flow.invoke(state_input)

        # 5. Save score to Supabase
        explanation_payload = result_state["explanation"]
        score_payload = {
            "profile_id": str(profile["id"]),
            "overall_score": result_state["overall_score"],
            "grade": result_state["grade"],
            "risk_band": result_state["risk_band"],
            "gst_score": result_state["gst_score"],
            "upi_score": result_state["upi_score"],
            "aa_score": result_state["aa_score"],
            "epfo_score": result_state["epfo_score"],
            "signals": result_state["signals"],
            "explanation": json.dumps(explanation_payload),
            "computed_at": datetime.now(timezone.utc).isoformat()
        }
        
        score_res = supabase_client.table("scores").insert(score_payload).execute()
        if not score_res.data:
            raise HTTPException(status_code=500, detail="Failed to save computed score to database")
        
        score_record = score_res.data[0]

        # Update profile status from 'pending' to 'scored' (or keep it if already updated)
        # Note: if the profile status is pending, scoring completes it
        if profile["status"] == "pending":
            supabase_client.table("profiles").update({"status": "scored"}).eq("id", profile["id"]).execute()

        # 6. Log Audit
        audit_payload = {
            "entity_type": "score",
            "entity_id": score_record["id"],
            "action": "computed",
            "details": {
                "overall_score": result_state["overall_score"],
                "grade": result_state["grade"],
                "risk_band": result_state["risk_band"],
                "signals": result_state["signals"]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        if current_user:
            audit_payload["actor_id"] = current_user["id"]
        supabase_client.table("audits").insert(audit_payload).execute()

        # Return structured explanation
        return ScoreExplainResponse(**explanation_payload)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Score computation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Score computation failed: {str(e)}")


@router.get("/explain/{id}", response_model=ScoreExplainResponse)
async def get_score_explanation(
    id: UUID,
    current_user: Annotated[Optional[dict], Depends(get_current_user)] = None
):
    """
    Retrieve explainability metrics (SHAP and LLM report) for a specific score ID.
    Can also fall back to finding the latest score for a Profile ID if requested.
    """
    try:
        # First, try to fetch score directly by score ID
        score_res = supabase_client.table("scores").select("*").eq("id", str(id)).execute()
        
        if not score_res.data:
            # Fallback: check if the ID corresponds to a profile
            score_res = (
                supabase_client.table("scores")
                .select("*")
                .eq("profile_id", str(id))
                .order("computed_at", desc=True)
                .limit(1)
                .execute()
            )
            
        if not score_res.data:
            raise HTTPException(status_code=404, detail="Score record or profile score not found")
            
        score = score_res.data[0]
        
        # Parse explanation JSON string
        explanation_str = score.get("explanation")
        if not explanation_str:
            raise HTTPException(status_code=404, detail="No explanation details found for this score")
            
        explanation_dict = json.loads(explanation_str)
        return ScoreExplainResponse(**explanation_dict)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch score explanation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch explanation: {str(e)}")
