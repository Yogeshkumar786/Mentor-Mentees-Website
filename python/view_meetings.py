import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentormentee.settings')
django.setup()

from core.models import Meeting

print('\n📋 MEETINGS TABLE (core_meeting) - All Columns:\n')
print('id, mentorId, date, time, description, facultyReview, status, createdAt, updatedAt')

meetings = Meeting.objects.all()[:5]

print(f'\n📊 Sample Meeting Data ({meetings.count()} rows shown):\n')
print(f'{"ID":<30} | {"Date":12} | {"Time":12} | {"Status"}')
print('-' * 80)
for meeting in meetings:
    print(f'{meeting.id[:28]:<30} | {str(meeting.date)[:12]:12} | {meeting.time:12} | {meeting.status}')

print(f'\n✅ Total meetings in database: {Meeting.objects.count()}')
