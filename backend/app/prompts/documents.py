DOCUMENT_PROMPTS = {
    "rent_reduction": {
        "title": "Rent Reduction Request Letter",
        "prompt": """Generate a formal rent reduction request letter for a UAE tenant.

Tenant Details:
{input_data}

Requirements:
- Professional formal tone
- Reference UAE Law No. 26/2007 Article 9 (rent review based on RERA index)
- Cite RERA Smart Rental Index if rent is above market
- Request specific percentage reduction
- Include 90-day notice acknowledgment
- No markdown formatting — plain text only

Language: {language}""",
    },
    "deposit_refund": {
        "title": "Security Deposit Refund Demand",
        "prompt": """Generate a formal security deposit refund demand letter for a UAE tenant.

Details:
{input_data}

Requirements:
- Reference UAE Law No. 26/2007 Article 20 (deposit return obligations)
- State that deposit must be returned within 30 days of vacancy
- List any deductions being disputed
- Mention RDSC filing if not resolved in 15 days
- Firm but professional tone
- No markdown — plain text only

Language: {language}""",
    },
    "maintenance_complaint": {
        "title": "Maintenance Complaint Letter",
        "prompt": """Generate a formal maintenance complaint letter for a UAE tenant.

Details:
{input_data}

Requirements:
- Reference landlord's obligation for major maintenance (Law No. 26/2007)
- State specific issues and dates reported
- Request resolution within 30 days
- Mention right to file RDSC complaint
- Professional tone
- No markdown — plain text only

Language: {language}""",
    },
    "notice_to_vacate": {
        "title": "Notice to Vacate Letter",
        "prompt": """Generate a formal notice to vacate letter from a UAE tenant to landlord.

Details:
{input_data}

Requirements:
- State proper notice period (90 days standard)
- Reference contract end date
- Request confirmation of receipt
- State expectations for deposit return
- Professional tone
- No markdown — plain text only

Language: {language}""",
    },
    "counter_eviction": {
        "title": "Counter-Eviction Notice Response",
        "prompt": """Generate a formal response to an eviction notice for a UAE tenant.

Details:
{input_data}

Requirements:
- Challenge improper notice if applicable (must be 12 months for personal use, Law No. 33/2008 Article 25)
- Request proof of landlord's stated reason
- State tenant's rights under UAE law
- Announce intent to file RDSC complaint if eviction proceeds
- Firm, legal tone
- No markdown — plain text only

Language: {language}""",
    },
    "rdsc_complaint": {
        "title": "RDSC Complaint Letter",
        "prompt": """Generate a formal complaint letter for filing with the Rental Disputes Settlement Centre (RDSC) in Dubai.

Details:
{input_data}

Requirements:
- Formal RDSC filing format
- Clear statement of dispute
- Chronological timeline of events
- Specific laws violated
- Relief requested (monetary/injunction)
- List supporting documents to attach
- No markdown — plain text only

Language: {language}""",
    },
}
