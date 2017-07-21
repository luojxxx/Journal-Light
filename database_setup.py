from sqlalchemy import create_engine
from sqlalchemy import Table, Column, Integer, String, BigInteger, Boolean, Date, MetaData, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
from sqlalchemy.dialects import postgresql

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String)
    phonenumber = Column(String)
    name = Column(String)
    signupdate = Column(Date)
    paymentdate = Column(Date)
    password = Column(String(100))
    quota = Column(Integer)

    @property
    def serialize(self):
        return {
        'id':self.id,
        'email':self.email,
        'phonenumber':self.phonenumber,
        'name':self.name,
        'signupdate':self.signupdate,
        'paymentdate':self.paymentdate,
        'password':self.password,
        'quota':self.quota,
        }

# class UserData(Base):
#     __tablename__ = 'usersdata'

#     data_uid = Column(Integer, primary_key=True)
#     data_id = Column(Integer)
#     datetime_code = Column(String)
#     ai_response = Column(Boolean)
#     datetime_precision = Column(String)
#     content = Column(String)
#     user_id = Column(Integer, ForeignKey('users.id'))
#     user = relationship(User)

#     @property
#     def serialize(self):
#         return {
#         'data_uid': self.data_uid,
#         'data_id': self.data_id,
#         'datetime_code': self.datetime_code,
#         'ai_response': self.ai_response,
#         'datetime_precision': self.datetime_precision,
#         'content': self.content,
#         'user_id': self.user_id,
#         }

# class UserDataOrder(Base):
#     __tablename__ = 'usersdataorder'
#     #data_order_id = Column(Integer, primary_key=True)
#     data_order = Column(postgresql.ARRAY(Integer))
#     user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
#     user = relationship(User)

#     @property
#     def serialize(self):
#         return {
#         'data_order': self.data_order,
#         'user_id': self.user_id,
#         }
