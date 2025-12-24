from django.contrib import admin
from .models import (
    User, Student, Faculty, HOD, Admin, Mentor, Meeting, Internship,
    Project, CoCurricular, Semester, Subject, CareerDetails, PersonalProblem, Request
)

models = [User, Student, Faculty, HOD, Admin, Mentor, Meeting, Internship,
          Project, CoCurricular, Semester, Subject, CareerDetails, PersonalProblem, Request]

for m in models:
    try:
        admin.site.register(m)
    except Exception:
        pass
