from fastapi import FastAPI

page = FastAPI()

@page.get("/homepage")
def firstpage():
    return {"Detail":"It is first page"}