import sys
import os
import json
import unittest

# Adjust Python path to load app modules correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.agents import (
    gst_agent_node,
    upi_agent_node,
    aa_agent_node,
    epfo_agent_node,
    scoring_orchestrator_node,
    generate_fallback_explanation,
    AgentState
)

class TestScoringPipeline(unittest.TestCase):
    
    def setUp(self):
        # Base state with consent flags
        self.base_state: AgentState = {
            "profile_id": "test-profile-id",
            "consent_id": "test-consent-id",
            "gstin": "29ABCDE1234F1Z5", # Sri Lakshmi Engineering
            "business_name": "Sri Lakshmi Engineering",
            "business_type": "Manufacturing",
            "years_in_business": 5,
            "location": "Bengaluru",
            "gst_consent": True,
            "upi_consent": True,
            "aa_consent": True,
            "epfo_consent": True,
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

    def test_gst_agent_scoring(self):
        # Sri Lakshmi Engineering GST metrics: filing_regularity=75, revenue_growth=25, tax_compliance=83.33
        state = dict(self.base_state)
        res = gst_agent_node(state)
        self.assertIn("gst_score", res)
        self.assertGreater(res["gst_score"], 300)
        self.assertLess(res["gst_score"], 900)
        self.assertTrue(any("GST" in sig or "YoY" in sig or "compliance" in sig for sig in res["gst_data"]["signals"]))

    def test_upi_agent_scoring(self):
        state = dict(self.base_state)
        res = upi_agent_node(state)
        self.assertIn("upi_score", res)
        self.assertGreater(res["upi_score"], 300)
        
    def test_aa_agent_scoring(self):
        state = dict(self.base_state)
        res = aa_agent_node(state)
        self.assertIn("aa_score", res)
        self.assertGreater(res["aa_score"], 300)
        
    def test_epfo_agent_scoring(self):
        state = dict(self.base_state)
        res = epfo_agent_node(state)
        self.assertIn("epfo_score", res)
        self.assertGreater(res["epfo_score"], 300)

    def test_orchestrator_weighted_average(self):
        # We manually inject scores to verify orchestrator weighted sum and SHAP contributions
        state = dict(self.base_state)
        state.update({
            "gst_score": 700, # Weight 0.30
            "upi_score": 650, # Weight 0.25
            "aa_score": 750, # Weight 0.25
            "epfo_score": 800, # Weight 0.20
            "gst_data": {"signals": [], "filing_regularity": 95},
            "upi_data": {"signals": [], "volume": 80},
            "aa_data": {"signals": [], "cash_flow": 75},
            "epfo_data": {"signals": [], "payroll_consistency": 85, "employee_count": 8}
        })
        
        res = scoring_orchestrator_node(state)
        
        # Expected base weighted score:
        # (700*0.30) + (650*0.25) + (750*0.25) + (800*0.20)
        # = 210 + 162.5 + 187.5 + 160 = 720
        self.assertEqual(res["overall_score"], 720)
        self.assertEqual(res["grade"], "B+")
        self.assertEqual(res["risk_band"], "Low-Medium")
        
        # Verify SHAP contributions sum to overall_score - 600 (720 - 600 = 120)
        features = res["explanation"]["features"]
        total_contrib = sum(f["contribution"] for f in features)
        self.assertAlmostEqual(total_contrib, 120.0, places=1)

    def test_orchestrator_capping_rule(self):
        # Inject one score < 400 to test the Critical Failure Cap (caps score at 550)
        state = dict(self.base_state)
        state.update({
            "gst_score": 750, # Weight 0.30
            "upi_score": 800, # Weight 0.25
            "aa_score": 380, # Weight 0.25, critical failure!
            "epfo_score": 850, # Weight 0.20
            "gst_data": {"signals": [], "filing_regularity": 95},
            "upi_data": {"signals": [], "volume": 80},
            "aa_data": {"signals": [], "cash_flow": 30},
            "epfo_data": {"signals": [], "payroll_consistency": 95, "employee_count": 15}
        })
        
        res = scoring_orchestrator_node(state)
        
        # The base score would be: (750*0.3) + (800*0.25) + (380*0.25) + (850*0.2)
        # = 225 + 200 + 95 + 170 = 690.
        # Since AA score (380) < 400, it is capped at 550.
        self.assertEqual(res["overall_score"], 550)
        self.assertEqual(res["grade"], "C+")
        self.assertEqual(res["risk_band"], "Medium-High")
        self.assertTrue(any("cap" in sig.lower() for sig in res["signals"]))
        
        # Verify SHAP contributions sum to overall_score - 600 (550 - 600 = -50)
        features = res["explanation"]["features"]
        total_contrib = sum(f["contribution"] for f in features)
        self.assertAlmostEqual(total_contrib, -50.0, places=1)

    def test_orchestrator_penalties_and_boosts(self):
        # 1. Test GST non-compliance penalty (-50)
        # Ramesh Textiles has filing_regularity < 50
        state = dict(self.base_state)
        state.update({
            "gstin": "33RXTEX5678A1Z0",
            "gst_score": 500,
            "upi_score": 600,
            "aa_score": 600,
            "epfo_score": 600,
            "gst_data": {"signals": [], "filing_regularity": 40},
            "upi_data": {"signals": [], "volume": 60},
            "aa_data": {"signals": [], "cash_flow": 60},
            "epfo_data": {"signals": [], "payroll_consistency": 70, "employee_count": 8}
        })
        
        res = scoring_orchestrator_node(state)
        # Base score: (500*0.3) + (600*0.25) + (600*0.25) + (600*0.2) = 150 + 150 + 150 + 120 = 570
        # GST filing regularity = 40 < 50, so deduct 50 points = 520.
        self.assertEqual(res["overall_score"], 520)
        self.assertTrue(any("penalty" in sig.lower() for sig in res["signals"]))
        
        # Verify SHAP contributions sum to overall_score - 600 (520 - 600 = -80)
        features = res["explanation"]["features"]
        total_contrib = sum(f["contribution"] for f in features)
        self.assertAlmostEqual(total_contrib, -80.0, places=1)

        # 2. Test EPFO payroll stability boost (+20)
        # Bharat Digital Solutions has payroll_consistency > 90 and employees > 10
        state_boost = dict(self.base_state)
        state_boost.update({
            "gstin": "27BDSOL9012B1Z8",
            "gst_score": 800,
            "upi_score": 800,
            "aa_score": 800,
            "epfo_score": 800,
            "gst_data": {"signals": [], "filing_regularity": 95},
            "upi_data": {"signals": [], "volume": 90},
            "aa_data": {"signals": [], "cash_flow": 85},
            "epfo_data": {"signals": [], "payroll_consistency": 95, "employee_count": 25}
        })
        
        res_boost = scoring_orchestrator_node(state_boost)
        # Base score: 800
        # Boost applies: +20 points = 820.
        self.assertEqual(res_boost["overall_score"], 820)
        self.assertTrue(any("boost" in sig.lower() or "premium" in sig.lower() for sig in res_boost["signals"]))
        
        # Verify SHAP contributions sum to overall_score - 600 (820 - 600 = 220)
        features_boost = res_boost["explanation"]["features"]
        total_contrib_boost = sum(f["contribution"] for f in features_boost)
        self.assertAlmostEqual(total_contrib_boost, 220.0, places=1)

    def test_fallback_explanation_generation(self):
        state = dict(self.base_state)
        state.update({
            "overall_score": 750,
            "grade": "A",
            "risk_band": "Low",
            "signals": ["Strong GST filing regularity", "Consistent UPI transaction history"]
        })
        
        fallback = generate_fallback_explanation(state)
        self.assertIn("strengths", fallback)
        self.assertIn("weaknesses", fallback)
        self.assertIn("recommendations", fallback)
        self.assertIn("risk_report", fallback)
        self.assertTrue(len(fallback["strengths"]) > 0)
        self.assertTrue(len(fallback["recommendations"]) > 0)
        self.assertIn("Low", fallback["risk_report"])

if __name__ == '__main__':
    unittest.main()
