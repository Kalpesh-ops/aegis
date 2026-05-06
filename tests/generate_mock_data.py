import fitz  # PyMuPDF
import os

def create_pdf(filename, content):
    doc = fitz.open()
    for page_text in content:
        page = doc.new_page()
        page.insert_text((50, 70), page_text, fontsize=11)
    
    output_path = os.path.join("tests", "mock_data", filename)
    doc.save(output_path)
    doc.close()
    print(f"Created {output_path}")

# 1. Tender Specification
tender_content = [
    "CRPF TENDER SPECIFICATION - 2024\nReference ID: CRPF-SPEC-01",
    "Section 4: Eligibility Criteria\n\n4.1 Financial Standing: The bidder must have a minimum standalone annual turnover of INR 5 Crores during the last financial year.",
    "4.2 Technical Experience: The bidder must have at least 3 years of experience in supplying security equipment to government agencies.",
    "4.3 Certification: A valid ISO 9001 certification is mandatory for all participating vendors."
]

# 2. Vendor A - Clear Pass
vendor_a_content = [
    "GLOBAL DEFENSE SYSTEMS LTD - BID SUBMISSION\nReference: CRPF-SPEC-01",
    "FINANCIAL STATEMENT\nOur standalone annual turnover for FY 2023-24 was INR 8.5 Crores.",
    "TECHNICAL EXPERIENCE\nWe have been operational since 2018, providing services for over 6 years to various state police departments.",
    "CERTIFICATIONS\nPlease find attached our ISO 9001:2015 certification valid until 2026."
]

# 3. Vendor B - Clear Fail
vendor_b_content = [
    "SECURE-TECH SOLUTIONS - TENDER BID\nReference: CRPF-SPEC-01",
    "FINANCIAL TURNOVER\nOur annual turnover for the last year was recorded at INR 3.2 Crores.",
    "EXPERIENCE\nSecure-Tech has been in the industry for 4 years.",
    "CERTIFICATES\nWe are currently in the process of renewing our ISO 9001 certification."
]

# 4. Vendor C - Ambiguous (Proximity Trigger)
vendor_c_content = [
    "AMBIGUOUS SYSTEMS INC - PROPOSAL\nReference: CRPF-SPEC-01",
    "FINANCIAL DISCLOSURE\nThe bidder must have a standalone turnover of Rs 5 Cr. Our group turnover is recorded as INR 12 Crores, while our standalone turnover for the bidding entity is INR 4 Crores.",
    "EXPERIENCE\nWe have 5 years of relevant government contract experience.",
    "COMPLIANCE\nWe hold a valid ISO 9001 certificate."
]

if __name__ == "__main__":
    create_pdf("Tender_CRPF_01.pdf", tender_content)
    create_pdf("Vendor_A_ClearPass.pdf", vendor_a_content)
    create_pdf("Vendor_B_ClearFail.pdf", vendor_b_content)
    create_pdf("Vendor_C_Ambiguous.pdf", vendor_c_content)
