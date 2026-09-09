from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime

from sqlmodel import SQLModel, Field, Relationship, column


class share(SQLModel, table = True):
    pass