import sys
import os
import unittest
from fastapi.testclient import TestClient

# Adjust Python path to load app modules correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.main import app
from app.db.supabase_client import supabase_client

class TestScoringAPI(unittest.TestCase):
    
    def setUp(self):
        self.client = TestClient(app)
        self.test_gstin = "TEST_GSTIN_1234"
        self.test_email = "test_officer@example.com"
        self.created_profile_id = None
        self.created_loan_id = None
        self.created_consent_id = None
        self.created_score_id = None
        self.auth_headers = {}
        
        # Clean up database first
        self.cleanup_database()
        
        # Sign up a test user
        signup_payload = {
            "email": self.test_email,
            "name": "Test Officer",
            "role": "REVIEWER",
            "password": "testpassword123"
        }
        signup_res = self.client.post("/api/v1/auth/signup", json=signup_payload)
        # If user already exists (should not since we cleaned up, but in case), we try to login
        
        # Log in to get token
        login_payload = {
            "email": self.test_email,
            "password": "testpassword123"
        }
        login_res = self.client.post("/api/v1/auth/login", json=login_payload)
        if login_res.status_code == 200:
            token = login_res.json()["access_token"]
            self.auth_headers = {"Authorization": f"Bearer {token}"}

    def tearDown(self):
        # Cleanup created test database entries and user
        self.cleanup_database()

    def cleanup_database(self):
        try:
            # Delete audits first (foreign key constraints)
            if self.created_loan_id:
                supabase_client.table("audits").delete().eq("entity_id", str(self.created_loan_id)).execute()
            if self.created_score_id:
                supabase_client.table("audits").delete().eq("entity_id", str(self.created_score_id)).execute()
                
            # Delete scores, loans, consents, profiles
            if self.created_profile_id:
                supabase_client.table("scores").delete().eq("profile_id", str(self.created_profile_id)).execute()
                supabase_client.table("loans").delete().eq("profile_id", str(self.created_profile_id)).execute()
                supabase_client.table("consents").delete().eq("profile_id", str(self.created_profile_id)).execute()
                supabase_client.table("profiles").delete().eq("id", str(self.created_profile_id)).execute()
                
            # Backup cleanup by GSTIN
            profile_res = supabase_client.table("profiles").select("id").eq("gstin", self.test_gstin).execute()
            if profile_res.data:
                pid = profile_res.data[0]["id"]
                supabase_client.table("scores").delete().eq("profile_id", pid).execute()
                supabase_client.table("loans").delete().eq("profile_id", pid).execute()
                supabase_client.table("consents").delete().eq("profile_id", pid).execute()
                supabase_client.table("profiles").delete().eq("id", pid).execute()
                
            # Delete user audits
            user_res = supabase_client.table("users").select("id").eq("email", self.test_email).execute()
            if user_res.data:
                uid = user_res.data[0]["id"]
                supabase_client.table("audit_logs").delete().eq("user_id", uid).execute()
                supabase_client.table("users").delete().eq("id", uid).execute()
        except Exception as e:
            print(f"Cleanup failed (non-blocking): {str(e)}")

    def test_onboard_and_compute_score_flow(self):
        # 1. Trigger MSME Onboarding
        onboard_payload = {
            "profile": {
                "gstin": self.test_gstin,
                "name": "Test Enterprise",
                "type": "Partnership",
                "years": 3,
                "location": "Mumbai"
            },
            "consent": {
                "gst_consent": True,
                "upi_consent": True,
                "aa_consent": True,
                "epfo_consent": True
            },
            "loan": {
                "loan_type": "WORKING_CAPITAL",
                "amount": 5000000,
                "tenure": 24
            }
        }
        
        onboard_res = self.client.post("/api/v1/loans/onboard", json=onboard_payload)
        if onboard_res.status_code != 200:
            print("ONBOARD RES STATUS:", onboard_res.status_code)
            print("ONBOARD RES BODY:", onboard_res.text)
        self.assertEqual(onboard_res.status_code, 200)
        onboard_data = onboard_res.json()
        self.assertTrue(onboard_data["success"])
        self.assertIn("profile_id", onboard_data)
        self.assertIn("loan_id", onboard_data)
        
        self.created_profile_id = onboard_data["profile_id"]
        self.created_loan_id = onboard_data["loan_id"]
        
        # 2. Trigger Score Computation
        compute_payload = {
            "profile_id": self.created_profile_id
        }
        compute_res = self.client.post(
            "/api/v1/score/compute",
            json=compute_payload,
            headers=self.auth_headers
        )
        if compute_res.status_code != 200:
            print("COMPUTE RES STATUS:", compute_res.status_code)
            print("COMPUTE RES BODY:", compute_res.text)
        self.assertEqual(compute_res.status_code, 200)
        
        score_data = compute_res.json()
        self.assertIn("features", score_data)
        self.assertIn("recommendations", score_data)
        self.assertIn("strengths", score_data)
        self.assertIn("weaknesses", score_data)
        self.assertIn("risk_report", score_data)
        
        # Check that score was inserted in DB
        db_scores = supabase_client.table("scores").select("*").eq("profile_id", self.created_profile_id).execute()
        self.assertTrue(len(db_scores.data) > 0)
        self.created_score_id = db_scores.data[0]["id"]
        
        # 3. Retrieve Explanation by ID
        explain_res = self.client.get(
            f"/api/v1/score/explain/{self.created_score_id}",
            headers=self.auth_headers
        )
        self.assertEqual(explain_res.status_code, 200)
        explain_data = explain_res.json()
        self.assertEqual(explain_data["risk_report"], score_data["risk_report"])

if __name__ == '__main__':
    unittest.main()
