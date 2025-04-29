
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    attendant_date = db.Column(db.DateTime)
