import hashlib
import json
import logging
from typing import TypedDict, List, Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel

from langgraph.graph import StateGraph, START, END
from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------------------
# 1. State Definition
# ------------------------------------------------------------------------------
class AgentState(TypedDict):
    profile_id: str
    consent_id: Optional[str]
    
    # Metadata
    gstin: str
    business_name: str
    business_type: str
    years_in_business: int
    location: str
    
    # Consents
    gst_consent: bool
    upi_consent: bool
    aa_consent: bool
    epfo_consent: bool
    
    # Raw Alternate Data
    gst_data: Dict[str, Any]
    upi_data: Dict[str, Any]
    aa_data: Dict[str, Any]
    epfo_data: Dict[str, Any]
    
    # Dimension Scores (300-900)
    gst_score: int
    upi_score: int
    aa_score: int
    epfo_score: int
    
    # Composite Output
    overall_score: int
    grade: str
    risk_band: str
    signals: List[str]
    
    # Explanations
    explanation: Dict[str, Any]

# ------------------------------------------------------------------------------
# 2. Mock Data & Deterministic Metric Generator
# ------------------------------------------------------------------------------
MOCK_DATA_BY_GSTIN = {
    # Sri Lakshmi Engineering (APP-001)
    "29ABCDE1234F1Z5": {
        "gst": {"filing_regularity": 75, "revenue_growth": 25, "tax_compliance": 83.33},
        "upi": {"volume": 60, "diversity": 70, "consistency": 66.67},
        "aa": {"cash_flow": 70, "emi_discipline": 75, "balance_maint": 51.67},
        "epfo": {"employee_count": 12, "payroll_consistency": 85}
    },
    # Ramesh Textiles (APP-002)
    "33RXTEX5678A1Z0": {
        "gst": {"filing_regularity": 40, "revenue_growth": -10, "tax_compliance": 60},
        "upi": {"volume": 50, "diversity": 50, "consistency": 55},
        "aa": {"cash_flow": 40, "emi_discipline": 30, "balance_maint": 35},
        "epfo": {"employee_count": 8, "payroll_consistency": 70}
    },
    # Bharat Digital Solutions (APP-003)
    "27BDSOL9012B1Z8": {
        "gst": {"filing_regularity": 95, "revenue_growth": 45, "tax_compliance": 95},
        "upi": {"volume": 90, "diversity": 85, "consistency": 80},
        "aa": {"cash_flow": 85, "emi_discipline": 95, "balance_maint": 75},
        "epfo": {"employee_count": 25, "payroll_consistency": 95}
    },
    # Annapurna Food Products (APP-004)
    "19AFPFO3456C1Z3": {
        "gst": {"filing_regularity": 45, "revenue_growth": -5, "tax_compliance": 55},
        "upi": {"volume": 48, "diversity": 45, "consistency": 52},
        "aa": {"cash_flow": 45, "emi_discipline": 40, "balance_maint": 42},
        "epfo": {"employee_count": 5, "payroll_consistency": 68}
    },
    # Venkateswara Auto Parts (APP-005)
    "33VAPAR7890D1Z6": {
        "gst": {"filing_regularity": 72, "revenue_growth": 15, "tax_compliance": 80},
        "upi": {"volume": 75, "diversity": 70, "consistency": 72},
        "aa": {"cash_flow": 65, "emi_discipline": 70, "balance_maint": 55},
        "epfo": {"employee_count": 10, "payroll_consistency": 82}
    },
    # Green Earth Packaging (APP-006)
    "29GEPAC2345E1Z9": {
        "gst": {"filing_regularity": 85, "revenue_growth": 30, "tax_compliance": 88},
        "upi": {"volume": 80, "diversity": 75, "consistency": 78},
        "aa": {"cash_flow": 80, "emi_discipline": 85, "balance_maint": 70},
        "epfo": {"employee_count": 15, "payroll_consistency": 90}
    }
}

def get_deterministic_metrics(gstin: str) -> dict:
    normalized_gstin = gstin.strip().upper()
    if normalized_gstin in MOCK_DATA_BY_GSTIN:
        return MOCK_DATA_BY_GSTIN[normalized_gstin]
        
    h = int(hashlib.md5(normalized_gstin.encode()).hexdigest(), 16)
    return {
        "gst": {
            "filing_regularity": 50 + (h % 51),
            "revenue_growth": -20 + ((h // 10) % 101),
            "tax_compliance": 60 + ((h // 100) % 41)
        },
        "upi": {
            "volume": 40 + ((h // 1000) % 61),
            "diversity": 30 + ((h // 10000) % 71),
            "consistency": 45 + ((h // 100000) % 56)
        },
        "aa": {
            "cash_flow": 40 + ((h // 1000000) % 61),
            "emi_discipline": 50 + ((h // 10000000) % 51),
            "balance_maint": 30 + ((h // 100000000) % 71)
        },
        "epfo": {
            "employee_count": 3 + ((h // 1000000000) % 23),
            "payroll_consistency": 50 + ((h // 10000000000) % 51)
        }
    }

# ------------------------------------------------------------------------------
# 3. Agent Nodes
# ------------------------------------------------------------------------------
def gst_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    GST Agent Node: Computes GST Compliance Score and generates signals.
    """
    if not state.get("gst_consent"):
        return {"gst_score": 0, "gst_data": {}}
        
    metrics = get_deterministic_metrics(state["gstin"])["gst"]
    filing_regularity = metrics["filing_regularity"]
    revenue_growth = metrics["revenue_growth"]
    tax_compliance = metrics["tax_compliance"]
    
    # Calculate revenue growth score (normalized -50 to 100 to 0-100)
    rev_score = min(max((revenue_growth + 50) * 100 / 150, 0), 100)
    
    # Normalize score
    norm_score = filing_regularity * 0.4 + rev_score * 0.3 + tax_compliance * 0.3
    gst_score = int(300 + 6 * norm_score)
    
    signals = []
    if filing_regularity >= 90:
        signals.append("Strong GST filing regularity")
    elif filing_regularity < 50:
        signals.append("Irregular GST filing history (Penalty applied)")
        
    if revenue_growth >= 20:
        signals.append("High YoY revenue growth")
    elif revenue_growth < 0:
        signals.append("Negative YoY revenue growth detected")
        
    if tax_compliance >= 90:
        signals.append("Excellent tax compliance rate")
        
    return {
        "gst_score": gst_score,
        "gst_data": {
            "filing_regularity": filing_regularity,
            "revenue_growth": revenue_growth,
            "tax_compliance": tax_compliance,
            "signals": signals
        }
    }

def upi_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    UPI Agent Node: Computes UPI Transaction Score and generates signals.
    """
    if not state.get("upi_consent"):
        return {"upi_score": 0, "upi_data": {}}
        
    metrics = get_deterministic_metrics(state["gstin"])["upi"]
    volume = metrics["volume"]
    diversity = metrics["diversity"]
    consistency = metrics["consistency"]
    
    norm_score = volume * 0.4 + diversity * 0.3 + consistency * 0.3
    upi_score = int(300 + 6 * norm_score)
    
    signals = []
    if volume >= 80:
        signals.append("High UPI transaction volume")
    if diversity >= 70:
        signals.append("Diverse merchant customer base")
    elif diversity < 40:
        signals.append("Concentrated merchant customer base")
    if consistency >= 80:
        signals.append("Consistent UPI transaction history")
        
    return {
        "upi_score": upi_score,
        "upi_data": {
            "volume": volume,
            "diversity": diversity,
            "consistency": consistency,
            "signals": signals
        }
    }

def aa_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    AA Agent Node: Computes Account Aggregator Score and generates signals.
    """
    if not state.get("aa_consent"):
        return {"aa_score": 0, "aa_data": {}}
        
    metrics = get_deterministic_metrics(state["gstin"])["aa"]
    cash_flow = metrics["cash_flow"]
    emi_discipline = metrics["emi_discipline"]
    balance_maint = metrics["balance_maint"]
    
    norm_score = cash_flow * 0.4 + emi_discipline * 0.4 + balance_maint * 0.2
    aa_score = int(300 + 6 * norm_score)
    
    signals = []
    if cash_flow >= 80:
        signals.append("Strong account cash flow")
    if emi_discipline >= 90:
        signals.append("Zero EMI bounces in 6 months")
    elif emi_discipline < 50:
        signals.append("Multiple EMI bounces detected")
    if balance_maint >= 70:
        signals.append("Healthy average monthly balance")
    elif balance_maint < 40:
        signals.append("Thin average monthly balance")
        
    return {
        "aa_score": aa_score,
        "aa_data": {
            "cash_flow": cash_flow,
            "emi_discipline": emi_discipline,
            "balance_maint": balance_maint,
            "signals": signals
        }
    }

def epfo_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    EPFO Agent Node: Computes EPFO Payroll Score and generates signals.
    """
    if not state.get("epfo_consent"):
        return {"epfo_score": 0, "epfo_data": {}}
        
    metrics = get_deterministic_metrics(state["gstin"])["epfo"]
    employee_count = metrics["employee_count"]
    payroll_consistency = metrics["payroll_consistency"]
    
    employee_score = min(employee_count * 5, 100)
    norm_score = employee_score * 0.4 + payroll_consistency * 0.6
    epfo_score = int(300 + 6 * norm_score)
    
    signals = []
    if employee_count > 15:
        signals.append("Large stable headcount roster")
    if payroll_consistency >= 90:
        signals.append("Regular EPFO contribution filing (Stability boost)")
    elif payroll_consistency < 60:
        signals.append("Inconsistent EPFO contribution filing")
        
    return {
        "epfo_score": epfo_score,
        "epfo_data": {
            "employee_count": employee_count,
            "payroll_consistency": payroll_consistency,
            "signals": signals
        }
    }

# ------------------------------------------------------------------------------
# 4. Scoring Orchestrator Node (Math & Capping Rules & SHAP)
# ------------------------------------------------------------------------------
def scoring_orchestrator_node(state: AgentState) -> Dict[str, Any]:
    """
    Scoring Orchestrator: Combines dimension scores, applies rules/capping,
    and performs SHAP contribution calculations.
    """
    scores = []
    
    # 1. Collect scores and their default weights
    if state.get("gst_consent"):
        scores.append(("gst", state["gst_score"], 0.30))
    if state.get("upi_consent"):
        scores.append(("upi", state["upi_score"], 0.25))
    if state.get("aa_consent"):
        scores.append(("aa", state["aa_score"], 0.25))
    if state.get("epfo_consent"):
        scores.append(("epfo", state["epfo_score"], 0.20))
        
    if not scores:
        # Defaults if no source consented
        return {
            "overall_score": 300,
            "grade": "D",
            "risk_band": "High",
            "signals": ["No data sources consented. Minimal credit score assigned."],
            "explanation": {
                "features": [],
                "recommendations": ["Grant data consents to allow credit evaluation."],
                "strengths": [],
                "weaknesses": ["No alternate financial data shared."],
                "risk_report": "The applicant did not provide consent to fetch any alternate data sources. Without GST, UPI, Bank cash flows, or EPFO records, a credit rating cannot be computed. Underwriting is rejected."
            }
        }
        
    # Normalize weights for consented sources
    total_weight = sum(w for _, _, w in scores)
    weighted_sum = sum(s * w for _, s, w in scores)
    base_score = int(weighted_sum / total_weight)
    
    # Collect signals from agents
    combined_signals = []
    for dim, _, _ in scores:
        combined_signals.extend(state[f"{dim}_data"].get("signals", []))
        
    actual_score = base_score
    capping_applied = False
    
    # 2. Capping Rule 1: Critical Failure Cap (any consented score < 400 caps overall at 550)
    for _, score, _ in scores:
        if score < 400:
            capping_applied = True
            break
            
    # 3. Guardrail Rule 2: GST Compliance Penalty (GST regularity < 50 penalizes by 50 pts)
    if state.get("gst_consent") and state["gst_data"].get("filing_regularity", 100) < 50:
        actual_score = max(300, actual_score - 50)
        combined_signals.append("GST non-compliance penalty (-50 points) applied")
        
    # 4. Guardrail Rule 3: EPFO Stability Boost (regularity > 90 and employees > 10 adds 20 pts)
    if state.get("epfo_consent") and state["epfo_data"].get("payroll_consistency", 0) > 90 and state["epfo_data"].get("employee_count", 0) > 10:
        actual_score = min(900, actual_score + 20)
        combined_signals.append("EPFO stability premium (+20 points) applied")
        
    # Apply critical failure cap after adjustments
    if capping_applied:
        if actual_score > 550:
            actual_score = 550
            combined_signals.append("Regulatory score cap applied due to dimension failure (<400)")
        
    # 5. Grade & Risk Band Mapping
    if actual_score >= 800:
        grade, risk_band = "A+", "Very Low"
    elif actual_score >= 750:
        grade, risk_band = "A", "Low"
    elif actual_score >= 650:
        grade, risk_band = "B+", "Low-Medium"
    elif actual_score >= 550:
        grade, risk_band = "C+", "Medium-High"
    else:
        grade, risk_band = "D", "High"
        
    # 6. SHAP-Style Feature Contribution Math (baseline: 600)
    contributions = {}
    base_contrib_sum = 0
    
    for dim, score, weight in scores:
        norm_weight = weight / total_weight
        contrib = (score - 600) * norm_weight
        contributions[dim] = contrib
        base_contrib_sum += contrib
        
    target_sum = actual_score - 600
    
    # Scale contributions if overall score was capped/penalized/boosted
    if abs(base_contrib_sum) > 0.001:
        scaling_factor = target_sum / base_contrib_sum
        for dim in contributions:
            contributions[dim] *= scaling_factor
    else:
        # Equal distribution if base sum was 0
        n_dims = len(contributions)
        for dim in contributions:
            contributions[dim] = target_sum / n_dims
            
    # Form feature explanation output
    shap_features = []
    dim_names = {
        "gst": "GST Tax Compliance",
        "upi": "UPI Cash Flow Density",
        "aa": "Bank Balance Maintenance",
        "epfo": "Workforce Payroll Stability"
    }
    
    for dim, score, _ in scores:
        contrib = contributions[dim]
        impact = "positive" if contrib > 5 else ("negative" if contrib < -5 else "neutral")
        
        # Determine a raw value representation
        if dim == "gst":
            raw_val = state["gst_data"]["filing_regularity"]
        elif dim == "upi":
            raw_val = state["upi_data"]["volume"]
        elif dim == "aa":
            raw_val = state["aa_data"]["cash_flow"]
        else:
            raw_val = state["epfo_data"]["employee_count"]
            
        shap_features.append({
            "name": dim_names[dim],
            "raw_value": float(raw_val),
            "weight": float(weight / total_weight),
            "contribution": float(round(contrib, 2)),
            "impact": impact
        })
        
    # Put partial explanation structure in state (will be augmented by LLM)
    explanation = {
        "features": shap_features,
        "recommendations": [],
        "strengths": [],
        "weaknesses": [],
        "risk_report": ""
    }
    
    return {
        "overall_score": actual_score,
        "grade": grade,
        "risk_band": risk_band,
        "signals": combined_signals,
        "explanation": explanation
    }

# ------------------------------------------------------------------------------
# 5. LLM Explainability Node
# ------------------------------------------------------------------------------
class GeminiScoreExplainSchema(BaseModel):
    recommendations: List[str]
    strengths: List[str]
    weaknesses: List[str]
    risk_report: str

def generate_fallback_explanation(state: AgentState) -> Dict[str, Any]:
    """
    Robust fallback explanation in case Gemini API is unavailable.
    """
    overall_score = state["overall_score"]
    grade = state["grade"]
    risk_band = state["risk_band"]
    business_name = state["business_name"]
    location = state["location"]
    signals = state.get("signals", [])
    
    strengths = [s for s in signals if any(kw in s.lower() for kw in ["strong", "regular", "high", "zero", "consistent", "excellent", "premium"])][:3]
    weaknesses = [s for s in signals if any(kw in s.lower() for kw in ["thin", "limited", "negative", "fail", "poor", "bounce", "irregular", "non-compliance", "penalty"])][:3]
    
    if not strengths:
        strengths = [f"Active business operations located in {location}", "Filing alternate data consents successfully"]
    if not weaknesses:
        weaknesses = ["Limited long-term credit history in official records", "Avenues available for UPI merchant optimization"]
        
    recommendations = []
    # Dynamic logic depending on values
    if state.get("gst_consent") and state["gst_data"].get("filing_regularity", 100) < 60:
        recommendations.append("Prioritize filing GST returns before the due date to avoid regulatory capping/penalties.")
    else:
        recommendations.append("Continue maintaining high GST regularity to sustain tax compliance credentials.")
        
    if state.get("upi_consent") and state["upi_data"].get("diversity", 100) < 50:
        recommendations.append("Expand merchant transaction reach to a wider, more diverse pool of UPI payers.")
    else:
        recommendations.append("Direct a greater share of customer collections through UPI QR channels to log higher transaction counts.")
        
    if state.get("aa_consent") and state["aa_data"].get("balance_maint", 100) < 50:
        recommendations.append("Improve average monthly balance (AMB) thresholds in primary current accounts.")
    else:
        recommendations.append("Manage cash withdrawals in line with seasonal revenue inflows to prevent bank balance erosion.")
        
    if len(recommendations) < 3:
        recommendations.append("Keep EPFO employee rosters consistent to score highly on workforce stability metrics.")
        
    # Professional risk report copy
    risk_report = (
        f"Borrower {business_name} located in {location} has been evaluated using alternate digital footprints. "
        f"The composite scoring engine has computed an overall score of {overall_score} (Grade {grade}, {risk_band} Risk). "
    )
    if risk_band == "Very Low":
        risk_report += "This business presents an exceptionally strong profile with excellent tax compliance and stable payroll registries. Credit decisioning recommends immediate processing and premium interest rate pricing."
    elif risk_band == "Low":
        risk_report += "The credit risk is low. Financial indicators and cash flows are consistent. Fast-track underwriting is recommended with standard competitive rates."
    elif risk_band == "Low-Medium":
        risk_report += "The business has a stable operational profile, though minor metrics like average bank balance or transaction concentration warrant standard credit review. Suitable for standard working capital facilities."
    elif risk_band == "Medium-High":
        risk_report += "The scoring engine has flagged heightened credit risk. Dimension scores were penalized or capped due to irregular tax filings or recurring cash flow dips. Requires detailed officer scrutiny and potential collateralization."
    else:
        risk_report += "High default probability. Multiple alternate data sources indicate chronic compliance failures, insufficient balance maintenance, or active defaults. Credit underwriting is not recommended."
        
    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "risk_report": risk_report
    }

def llm_explainability_node(state: AgentState) -> Dict[str, Any]:
    """
    LLM Explainability: Uses Gemini to synthesize SHAP and signals into natural language insights.
    Falls back gracefully if API fails or is not configured.
    """
    # Quick exit if no consents were granted
    if not (state.get("gst_consent") or state.get("upi_consent") or state.get("aa_consent") or state.get("epfo_consent")):
        return {} # Keep the scoring_orchestrator default explanation
        
    overall_score = state["overall_score"]
    grade = state["grade"]
    risk_band = state["risk_band"]
    business_name = state["business_name"]
    location = state["location"]
    signals = state.get("signals", [])
    shap_features = state["explanation"]["features"]
    
    # Check if Gemini key is active
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key == "YOUR_GEMINI_API_KEY":
        logger.warning("Gemini API key is not configured. Generating fallback local explanation.")
        fallback = generate_fallback_explanation(state)
        explanation = dict(state["explanation"])
        explanation.update(fallback)
        return {"explanation": explanation}
        
    # Construct structured prompt
    prompt = f"""
    Analyze the financial health of the MSME "{business_name}" located in {location}.
    Overall Score: {overall_score} (Grade: {grade}, Risk Band: {risk_band})
    Dimension Scores:
    - GST Compliance Score: {state.get('gst_score', 0)}/900
    - UPI Transaction Score: {state.get('upi_score', 0)}/900
    - Account Aggregator (Bank Cash Flow): {state.get('aa_score', 0)}/900
    - EPFO Payroll Stability: {state.get('epfo_score', 0)}/900

    Key Signals:
    {chr(10).join(f'- {s}' for s in signals)}

    SHAP Feature Contributions (deviation from 600 baseline):
    {chr(10).join(f'- {f["name"]}: {f["contribution"]:+.1f} points' for f in shap_features)}

    Provide a structured analysis including:
    1. Strengths: 2-3 bullet points.
    2. Weaknesses: 2-3 bullet points.
    3. Recommendations: 2-3 specific actions to improve the score.
    4. Risk Report: A professional summary of 3-4 sentences outlining the creditworthiness of this MSME, explaining why the score was computed this way (including any capping rules or penalties applied), and a credit recommendation for IDBI.
    """
    
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiScoreExplainSchema,
            ),
        )
        
        data = json.loads(response.text)
        explanation = dict(state["explanation"])
        explanation.update({
            "strengths": data.get("strengths", []),
            "weaknesses": data.get("weaknesses", []),
            "recommendations": data.get("recommendations", []),
            "risk_report": data.get("risk_report", "")
        })
        return {"explanation": explanation}
    except Exception as e:
        logger.error(f"Gemini generation failed: {str(e)}. Falling back to local rules.", exc_info=True)
        fallback = generate_fallback_explanation(state)
        explanation = dict(state["explanation"])
        explanation.update(fallback)
        return {"explanation": explanation}

# ------------------------------------------------------------------------------
# 6. Workflow Graph Assembly
# ------------------------------------------------------------------------------
builder = StateGraph(AgentState)

# Add Nodes
builder.add_node("gst_agent", gst_agent_node)
builder.add_node("upi_agent", upi_agent_node)
builder.add_node("aa_agent", aa_agent_node)
builder.add_node("epfo_agent", epfo_agent_node)
builder.add_node("orchestrator", scoring_orchestrator_node)
builder.add_node("explainer", llm_explainability_node)

# Parallel branching from START
builder.add_edge(START, "gst_agent")
builder.add_edge(START, "upi_agent")
builder.add_edge(START, "aa_agent")
builder.add_edge(START, "epfo_agent")

# Merge parallel branches in Orchestrator
builder.add_edge("gst_agent", "orchestrator")
builder.add_edge("upi_agent", "orchestrator")
builder.add_edge("aa_agent", "orchestrator")
builder.add_edge("epfo_agent", "orchestrator")

# Transition to Explainer and then END
builder.add_edge("orchestrator", "explainer")
builder.add_edge("explainer", END)

scoring_flow = builder.compile()
