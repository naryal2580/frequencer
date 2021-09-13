#!/usr/bin/env python

from typing import Optional, List

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

import databases
import sqlalchemy


app = FastAPI()


templates = Jinja2Templates(directory="root/templates")

def init_db():
    global database, questions, subjects
    DB_URI = 'sqlite:///./frequencer.db'
    database = databases.Database(DB_URI)
    metadata = sqlalchemy.MetaData()
    questions = sqlalchemy.Table(
            'questions',
            metadata,
            sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
            sqlalchemy.Column("question", sqlalchemy.String),
            sqlalchemy.Column("votes", sqlalchemy.Integer),
            sqlalchemy.Column("subject_id", sqlalchemy.Integer)
            )
    subjects = sqlalchemy.Table(
            'subjects',
            metadata,
            sqlalchemy.Column('id', sqlalchemy.Integer, primary_key=True, autoincrement=True),
            sqlalchemy.Column('subject', sqlalchemy.String)
            )
    engine = sqlalchemy.create_engine(
        DB_URI, connect_args={"check_same_thread": False}
    )
    metadata.create_all(engine)


class Question(BaseModel):
    id: int
    question: str
    votes: int
    subject_id: int

class Subject(BaseModel):
    id: int
    subject: str


@app.on_event("startup")
async def startup():
    init_db()
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


@app.get('/')
def root():
    # return RedirectResponse('/index.htm')
    return RedirectResponse('/home')

@app.delete('/database')
async def reset_database():
    await database.disconnect()
    __import__('os').remove('frequencer.db')
    init_db()
    await database.connect()
    return {'reset': True}

@app.put('/subject/{subject}')
async def add_subject(subject):
    query = subjects.insert().values(subject=subject)
    subject_id = await database.execute(query)
    return {'id': subject_id}

@app.delete('/subject/{subject}')
async def delete_subject(subject):
    _ = await database.fetch_all(subjects.select().where(subjects.c.subject == subject))
    subject_id = int(_[0][0])
    await database.execute(questions.delete().where(questions.c.subject_id == subject_id))
    await database.execute(subjects.delete().where(subjects.c.subject == subject))
    return {'removed': {subject_id: subject}}

@app.delete('/question/{question_id}')
async def remove_question(question_id):
    await database.execute(questions.delete().where(questions.c.id == question_id))
    return {'removed': True}

@app.put('/question/{subject_id}/{question}')
async def add_question(subject_id, question):
    query = questions.insert().values(question=question, votes=1, subject_id=int(subject_id))
    question_id = await database.execute(query)
    return {'id': question_id}

@app.get('/questions', response_model=List[Question])
async def return_questions(id: Optional[int] = 0):
    if id:
        query = questions.select().where(questions.c.subject_id == id)
    else:
        query = questions.select()
    return await database.fetch_all(query)

@app.get('/subjects', response_model=List[Subject])
async def return_subjects():
    query = subjects.select()
    return await database.fetch_all(query)

@app.put('/vote')
async def cast_vote(id: str, type: str):
    question = await database.fetch_all(questions.select().where(questions.c.id == id))
    current_votes = question[0][2]
    if type == '+':
        query = questions.update().where(questions.c.id == id).values(votes=current_votes + 1)
    elif type == '-':
        if not current_votes - 1:
            return {'resp': 'CANNOT VOTE <= 0'}
        query = questions.update().where(questions.c.id == id).values(votes=current_votes - 1)
    else:
        raise HTTPException(status_code=403, detail="You're simply unauthorized to perform the following action.")
    await database.execute(query)
    return {'voted': id}


@app.get('/home', response_class=HTMLResponse)
async def home_page(request: Request):
    title, body = "Home", open('root/templates/Home.htm').read()
    page_enums = {
            "title": f"{title} - Frequencer",
            "body": body,
            "script": ""
        }
    return templates.TemplateResponse("boilerplate.ml", {"request": request, "page": page_enums})

@app.get('/add_subject', response_class=HTMLResponse)
async def add_subject_page(req: Request):
    title, body = "Add a subject", open('root/templates/Add a subject.htm').read()
    js = '''
$('#subject').onkeydown = (e) => {
    if (e.key === "Enter") {
        add_a_subject();
    }
}
'''[1:-1]
    page_enums = {
            "title": f"{title} - Frequencer",
            "body": body,
            "script": js
        }
    return templates.TemplateResponse("boilerplate.ml", {"request": req, "page": page_enums})

@app.get('/subject/{subject_id}', response_class=HTMLResponse)
async def subject_page(req: Request, subject_id):
    _ = await database.fetch_all(subjects.select().where(subjects.c.id == subject_id))
    subject = _[0]['subject']
    page_enums = {
            'title': f'{subject} - Frequencer',
            'body': open('root/templates/Subject.htm').read(),
            'script': open('root/static/js/Subject.js').read()
        }
    return templates.TemplateResponse("boilerplate.ml", {'request': req, 'page': page_enums})

app.mount("/", StaticFiles(directory="root/static"), name="root")


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=2580, reload=True)
