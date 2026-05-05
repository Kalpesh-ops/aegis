from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import tender_routes, vendor_routes

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Aegis: High-Assurance Procurement Gateway API",
    version="0.1.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; refine for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tender_routes.router, prefix="/tender", tags=["Tender"])
app.include_router(vendor_routes.router, prefix="/vendor", tags=["Vendor"])

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
