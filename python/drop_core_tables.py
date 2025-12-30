"""
Script to drop all core tables from the PostgreSQL database and run fresh migrations.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentormentee.settings')
django.setup()

from django.db import connection

# Tables to drop (in order to handle foreign key dependencies)
TABLES_TO_DROP = [
    # Drop dependent tables first
    'requests',
    'student_subjects',
    'career_details',
    'personal_problems',
    'meetings',
    'mentorships',
    'co_curriculars_students',
    'co_curriculars',
    'projects_students',
    'projects',
    'internships_students',
    'internships',
    'semesters',
    'subjects',
    'hods',
    'admins',
    'students',
    'faculty',
    'users',
    # Old table names (if they exist)
    'mentors',
]

def drop_tables():
    with connection.cursor() as cursor:
        for table in TABLES_TO_DROP:
            try:
                cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
                print(f'Dropped table: {table}')
            except Exception as e:
                print(f'Error dropping {table}: {e}')
        
        # Also clear migration history for core app
        try:
            cursor.execute("DELETE FROM django_migrations WHERE app = 'core'")
            print('Cleared core migration history')
        except Exception as e:
            print(f'Error clearing migration history: {e}')

if __name__ == '__main__':
    confirm = input('This will DROP ALL core tables. Are you sure? (yes/no): ')
    if confirm.lower() == 'yes':
        drop_tables()
        print('\nDone! Now run: python manage.py migrate')
    else:
        print('Aborted.')
