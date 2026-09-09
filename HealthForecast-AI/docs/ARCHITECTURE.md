# Architecture mapping

The supplied diagram contains users/stakeholders, an application layer, API gateway/security,
an AI analytics/prediction engine, a data/storage layer, infrastructure and external integrations.

This repository maps them to:

Users -> React UI -> FastAPI/JWT/RBAC -> PostgreSQL
                         |
                         +-> ML engine -> readmission probability/risk category
                         +-> treatment analytics
                         +-> clinical decision-support rules
                         +-> healthcare analytics

External EHR/HIS, lab, pharmacy, insurance, email/SMS and cloud integrations are kept as
future integration boundaries rather than pretending they are connected.
