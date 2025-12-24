import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentormentee.settings')
django.setup()

from core.models import User, Student, Faculty, Mentor, Meeting

print('=== Testing relationship queries ===')

# Get first mentor
m = Mentor.objects.first()
print(f'\nMentor: {m.id}')
print(f'Faculty: {m.faculty.name}')
print(f'Student: {m.student.name}')

# Get meetings for this mentor
print(f'\nMeetings for this mentor:')
for meeting in m.meetings.all():
    print(f'  - {meeting.date}: {meeting.description}')

# Test reverse relationship: Faculty -> Mentorships
print(f'\n=== Faculty Mentorships ===')
faculty = Faculty.objects.first()
print(f'Faculty: {faculty.name}')
print(f'Number of mentorships: {faculty.mentorships.count()}')
for mentorship in faculty.mentorships.all():
    print(f'  - Student: {mentorship.student.name}, Year: {mentorship.year}, Semester: {mentorship.semester}, Active: {mentorship.isActive}')

# Test reverse relationship: Student -> Mentors
print(f'\n=== Student Mentors ===')
student = Student.objects.first()
print(f'Student: {student.name}')
print(f'Number of mentors: {student.mentors.count()}')
for mentor in student.mentors.all():
    print(f'  - Faculty: {mentor.faculty.name}, Year: {mentor.year}, Semester: {mentor.semester}, Active: {mentor.isActive}')

print('\n✅ All relationship queries succeeded!')
